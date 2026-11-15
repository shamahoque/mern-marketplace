// Characterization tests: record what /auth and the auth middleware do at `baseline`.
// They must keep passing after refactoring.
import { api, createUser, signedInUser, bearer } from './helpers'

describe('POST /auth/signin', () => {
  test('valid credentials return token, public user fields and set cookie "t"', async () => {
    const { email, password, name } = await createUser()
    const res = await api().post('/auth/signin').send({ email, password })

    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.user).toEqual({ _id: expect.any(String), name, email, seller: false })
    expect(res.headers['set-cookie'].join()).toMatch(/^t=/)
  })

  test('unknown email -> 401 "User not found"', async () => {
    const res = await api().post('/auth/signin').send({ email: 'nobody@test.com', password: 'x' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'User not found' })
  })

  test('wrong password -> 401 "Email and password don\'t match."', async () => {
    const { email } = await createUser()
    const res = await api().post('/auth/signin').send({ email, password: 'wrongpass' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Email and password don't match." })
  })
})

describe('GET /auth/signout', () => {
  test('clears cookie "t" and returns message', async () => {
    const res = await api().get('/auth/signout')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'signed out' })
    expect(res.headers['set-cookie'].join()).toMatch(/^t=;/)
  })
})

describe('requireSignin / hasAuthorization', () => {
  test('protected route without token -> 401 UnauthorizedError', async () => {
    const { user } = await signedInUser()
    const res = await api().get(`/api/users/${user._id}`)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'UnauthorizedError: No authorization token was found' })
  })

  test('invalid token -> 401 UnauthorizedError', async () => {
    const { user } = await signedInUser()
    const res = await api().get(`/api/users/${user._id}`).set(bearer('not.a.token'))
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/^UnauthorizedError: /)
  })

  test("editing another user's profile -> 403 \"User is not authorized\"", async () => {
    const alice = await signedInUser()
    const bob = await signedInUser()
    const res = await api().put(`/api/users/${bob.user._id}`).set(bearer(alice.token)).send({ name: 'hacked' })
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'User is not authorized' })
  })
})

describe('password hashing (D-08)', () => {
  const crypto = require('crypto')
  const User = require('../server/models/user.model').default

  test('new passwords are stored as scrypt with a random 16-byte salt', async () => {
    const { email } = await createUser()
    const u = await User.findOne({ email })
    expect(u.hashed_password).toMatch(/^scrypt\$[0-9a-f]{128}$/)
    expect(u.salt).toMatch(/^[0-9a-f]{32}$/)
  })

  test('a legacy SHA-1 account can still sign in and is upgraded to scrypt', async () => {
    const salt = '123456789'
    await User.collection.insertOne({
      name: 'Old', email: 'old@test.com', salt, seller: false, created: new Date(),
      hashed_password: crypto.createHmac('sha1', salt).update('oldpass123').digest('hex')
    })
    await api().post('/auth/signin').send({ email: 'old@test.com', password: 'wrongpass' }).expect(401)
    await api().post('/auth/signin').send({ email: 'old@test.com', password: 'oldpass123' }).expect(200)

    const u = await User.findOne({ email: 'old@test.com' })
    expect(u.hashed_password).toMatch(/^scrypt\$/)
    await api().post('/auth/signin').send({ email: 'old@test.com', password: 'oldpass123' }).expect(200)
  })
})
