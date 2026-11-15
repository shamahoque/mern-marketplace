// Server-only config. Never import this from client/ (it would bundle secrets); use config/public.js.
import 'dotenv/config'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.')
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernproject',
  stripe_test_secret_key: process.env.STRIPE_SECRET_KEY
}

export default config
