// Publishable values safe to ship to the browser. In the client bundle webpack's
// DefinePlugin inlines these process.env reads; during SSR they read the real env.
export default {
  stripe_test_api_key: process.env.STRIPE_PUBLISHABLE_KEY || 'YOUR_stripe_test_api_key',
  stripe_connect_test_client_id: process.env.STRIPE_CONNECT_CLIENT_ID || 'YOUR_stripe_connect_test_client'
}
