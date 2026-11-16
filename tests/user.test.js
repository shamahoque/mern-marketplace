// Characterization tests: record what /api/users does at `baseline`,
// including the weak spots (D-08) so any change to them is deliberate.
import mongoose from 'mongoose'
import { api, createUser, signedInUser, bearer } from './helpers'
import User from '../server/models/user.model'

describe('POST /api/users (sign up)', () => {
  test('valid user -> 200 success message', async () => {
    const res = await api().post('/api/users').send({ name: 'A', email: 'a@test.com', password: 'secret123' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Successfully signed up!' })
  })

  test('password is stored hashed with a salt, never in plain text', async () => {
    await createUser({ email: 'h@test.com', password: 'secret123' })
    const u = await User.findOne({ email: 'h@test.com' })
    expect(u.hashed_password).toBeTruthy()
    expect(u.hashed_password).not.toBe('secret123')
    expect(u.salt).toBeTruthy()
  })

  test.each([
    [{ email: 'a@test.com', password: 'secret123' }, 'Name is required'],
    [{ name: 'A', password: 'secret123' }, 'Email is required'],
    [{ name: 'A', email: 'not-an-email', password: 'secret123' }, 'Please fill a valid email address'],
    [{ name: 'A', email: 'a@test.com', password: '123' }, 'Password must be at least 6 characters.'],
    [{ name: 'A', email: 'a@test.com' }, 'Password is required'],
  ])('invalid body %j -> 400 "%s"', async (body, error) => {
    const res = await api().post('/api/users').send(body)
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error })
  })

  // Baseline quirk: dbErrorHandler slices Mongo's raw message, so the text is mangled
  // (e.g. "11000 duplicate key error collection: <db>.users index: email already exists")
  // and varies with DB name / Mongo version. Only the stable part is pinned.
  test('duplicate email -> 400 with "already exists" error', async () => {
    const { email } = await createUser()
    const res = await api().post('/api/users').send({ name: 'Dup', email, password: 'secret123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/email already exists$/)
  })
})

describe('GET /api/users', () => {
  // D-08: was public at baseline; now requires sign-in
  test('without a token -> 401', async () => {
    await createUser()
    const res = await api().get('/api/users')
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'UnauthorizedError: No authorization token was found' })
  })

  test('signed in: returns only _id, name, email, created, updated', async () => {
    const { token } = await signedInUser()
    const res = await api().get('/api/users').set(bearer(token))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    // `updated` is absent until the user is first updated
    expect(Object.keys(res.body[0]).sort()).toEqual(['_id', 'created', 'email', 'name'])
  })
})

describe('/api/users/:userId', () => {
  test('GET with token returns profile without hashed_password or salt', async () => {
    const { token, user } = await signedInUser()
    const res = await api().get(`/api/users/${user._id}`).set(bearer(token))
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ _id: user._id, name: user.name, email: user.email, seller: false })
    expect(res.body.hashed_password).toBeUndefined()
    expect(res.body.salt).toBeUndefined()
  })

  test('unknown but valid id -> 400 "User not found" (checked before auth)', async () => {
    const res = await api().get(`/api/users/${new mongoose.Types.ObjectId()}`)
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'User not found' })
  })

  test('malformed id -> 400 "Could not retrieve user"', async () => {
    const res = await api().get('/api/users/not-an-id')
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Could not retrieve user' })
  })

  test('PUT updates own profile, hides password fields, sets updated', async () => {
    const { token, user } = await signedInUser()
    const res = await api().put(`/api/users/${user._id}`).set(bearer(token)).send({ name: 'New Name', seller: true })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ _id: user._id, name: 'New Name', seller: true })
    expect(res.body.updated).toBeTruthy()
    expect(res.body.hashed_password).toBeUndefined()
    expect(res.body.salt).toBeUndefined()
  })

  test('PUT with a new password lets the user sign in with it', async () => {
    const { token, user } = await signedInUser()
    await api().put(`/api/users/${user._id}`).set(bearer(token)).send({ password: 'newpass123' }).expect(200)
    await api().post('/auth/signin').send({ email: user.email, password: 'newpass123' }).expect(200)
  })

  test('DELETE removes own account and returns it without password fields', async () => {
    const { token, user } = await signedInUser()
    const res = await api().delete(`/api/users/${user._id}`).set(bearer(token))
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ _id: user._id, email: user.email })
    expect(res.body.hashed_password).toBeUndefined()
    expect(await User.findById(user._id)).toBeNull()
  })
})
