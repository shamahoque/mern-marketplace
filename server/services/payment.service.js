// All Stripe access lives here (D-03). No req/res: callers decide how failures become HTTP responses.
import request from 'request'
import stripe from 'stripe'
import config from './../../config/config'

const myStripe = stripe(config.stripe_test_secret_key)

// Exchange a Stripe Connect OAuth code for the seller's account details.
// Resolves with Stripe's response body, which has `error`/`error_description` when the code is rejected.
const connectSeller = (code) => new Promise((resolve, reject) => {
  request({
    url: 'https://connect.stripe.com/oauth/token',
    method: 'POST',
    json: true,
    body: { client_secret: config.stripe_test_secret_key, code, grant_type: 'authorization_code' }
  }, (error, response, body) => error ? reject(error) : resolve(body))
})

// Attach the buyer's card to their Stripe customer, creating the customer on first purchase.
// Returns the customer id.
const saveCustomer = async (user, cardToken) => {
  const customer = user.stripe_customer
    ? await myStripe.customers.update(user.stripe_customer, { source: cardToken })
    : await myStripe.customers.create({ email: user.email, source: cardToken })
  return customer.id
}

// Charge a platform customer on the seller's connected account. `amount` is in dollars.
const chargeCustomer = async (customerId, sellerAccountId, amount) => {
  const account = { stripeAccount: sellerAccountId }
  const token = await myStripe.tokens.create({ customer: customerId }, account)
  return myStripe.charges.create({ amount: amount * 100, currency: 'usd', source: token.id }, account)
}

export default { connectSeller, saveCustomer, chargeCustomer }
