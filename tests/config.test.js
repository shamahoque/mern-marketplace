// D-06: secrets come from the environment, and the client-facing config carries none.

test('server config refuses to load without JWT_SECRET', () => {
  const saved = process.env.JWT_SECRET
  delete process.env.JWT_SECRET
  jest.isolateModules(() => {
    jest.doMock('dotenv/config', () => ({})) // ignore any local .env
    expect(() => require('../config/config')).toThrow(/JWT_SECRET is not set/)
  })
  process.env.JWT_SECRET = saved
})

test('server config reads secrets from the environment', () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_from_env'
  jest.isolateModules(() => {
    const config = require('../config/config').default
    expect(config.jwtSecret).toBe(process.env.JWT_SECRET)
    expect(config.stripe_test_secret_key).toBe('sk_test_from_env')
  })
  delete process.env.STRIPE_SECRET_KEY
})

test('public (client) config exposes only publishable values', () => {
  const pub = require('../config/public').default
  expect(Object.keys(pub).sort()).toEqual(['stripe_connect_test_client_id', 'stripe_test_api_key'])
})
