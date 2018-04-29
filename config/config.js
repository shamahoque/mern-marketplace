import local from './local-config';
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernproject',
  stripe_connect_test_client_id: local.stripe_connect_test_client_id,
  stripe_test_secret_key: process.env.STRIPE_TEST_SECRET_KEY || 'YOUR_stripe_test_secret_key',
  stripe_test_api_key: local.stripe_test_api_key
}

export default config
