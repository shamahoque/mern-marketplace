// Shared helpers for characterization tests (reuse these in shop/product/order/auction tests).
import request from 'supertest'
import app from '../server/express'
import User from '../server/models/user.model'

export const api = () => request(app)

let n = 0
export const createUser = async (overrides = {}) => {
  n++
  const fields = { name: `User ${n}`, email: `user${n}@test.com`, password: 'secret123', ...overrides }
  await User.init() // make sure the unique email index exists
  await api().post('/api/users').send(fields).expect(200)
  return fields
}

// Creates a user and signs in. Returns { token, user, password }.
export const signedInUser = async (overrides) => {
  const { email, password } = await createUser(overrides)
  const res = await api().post('/auth/signin').send({ email, password }).expect(200)
  return { ...res.body, password }
}

export const bearer = (token) => ({ Authorization: `Bearer ${token}` })
