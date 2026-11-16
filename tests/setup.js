// Runs before every test file: in-memory MongoDB, clean collections between tests.
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// config/config.js refuses to load without it (D-06). Runs before any test file imports config.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'

// express.js compiles the webpack client bundle on import; tests only need the API.
jest.mock('../server/devBundle', () => ({ compile: () => {} }))
// client/auction/Bidding.js calls io() at import time (pulled in via SSR) and keeps reconnecting.
jest.mock('socket.io-client', () => () => ({ on() {}, emit() {}, off() {} }))

let mongod

beforeAll(async () => {
  // MONGO_TEST_URI: use an existing Mongo (e.g. docker) where the in-memory binary can't run.
  // Its database is wiped after every test, so never point it at real data.
  const uri = process.env.MONGO_TEST_URI || (mongod = await MongoMemoryServer.create()).getUri()
  // Same options as server/server.js
  await mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true })
})

afterEach(async () => {
  for (const c of Object.values(mongoose.connection.collections)) await c.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongod) await mongod.stop()
})
