// Characterization of the global error middleware in server/express.js.
import { api } from './helpers'
import { asyncHandler, HttpError } from '../server/helpers/errors'

test('malformed JSON body -> 400 "SyntaxError: ..."', async () => {
  const res = await api().post('/api/users').set('Content-Type', 'application/json').send('{"name":')
  expect(res.status).toBe(400)
  expect(res.body.error).toMatch(/^SyntaxError: /)
})

describe('asyncHandler', () => {
  const run = (fn, fallback) => new Promise(resolve => asyncHandler(fn, fallback)({}, {}, resolve, 'id-arg'))

  test('forwards a rejected error to next()', async () => {
    const boom = new Error('boom')
    expect(await run(async () => { throw boom })).toBe(boom)
  })

  test('replaces unexpected errors with the fallback, but keeps HttpErrors', async () => {
    const fallback = new HttpError(400, 'Could not retrieve user')
    expect(await run(async () => { throw new Error('db down') }, fallback)).toBe(fallback)
    const notFound = new HttpError(400, 'User not found')
    expect(await run(async () => { throw notFound }, fallback)).toBe(notFound)
  })

  test('passes extra args through (router.param id)', async () => {
    let seen
    await asyncHandler((req, res, next, id) => { seen = id; next() })({}, {}, () => {}, 'abc')
    expect(seen).toBe('abc')
  })
})
