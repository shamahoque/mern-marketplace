// Characterization of the Stripe flows: seller connect, checkout (customer), and charging an order.
// The Stripe SDK and `request` are mocked; we record what the app sends to Stripe and how it responds.
import mongoose from 'mongoose'
import request from 'request'
import stripe from 'stripe'
import { api, signedInUser, bearer } from './helpers'
import User from '../server/models/user.model'
import Shop from '../server/models/shop.model'
import Product from '../server/models/product.model'
import { Order } from '../server/models/order.model'

jest.mock('request', () => jest.fn())
jest.mock('stripe', () => {
  const m = {
    customers: { create: jest.fn(), update: jest.fn() },
    tokens: { create: jest.fn() },
    charges: { create: jest.fn() }
  }
  return () => m
})
const s = stripe()

// Stripe SDK methods return a promise and also call an optional trailing callback.
const stripeReturns = (fn, result, fail) => fn.mockImplementation((...args) => {
  const p = fail ? Promise.reject(fail) : Promise.resolve(result)
  const cb = typeof args[args.length - 1] === 'function' && args[args.length - 1]
  if (cb) p.then(r => cb(null, r), e => cb(e))
  return p
})

beforeEach(() => jest.clearAllMocks())

describe('PUT /api/stripe_auth/:userId (seller connects Stripe)', () => {
  test('exchanges the OAuth code and saves stripe_seller on the user', async () => {
    request.mockImplementation((opts, cb) => cb(null, {}, { stripe_user_id: 'acct_1', access_token: 'at' }))
    const { token, user } = await signedInUser()
    const res = await api().put(`/api/stripe_auth/${user._id}`).set(bearer(token)).send({ stripe: 'code_123' })

    expect(res.status).toBe(200)
    expect(res.body.stripe_seller).toEqual({ stripe_user_id: 'acct_1', access_token: 'at' })
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://connect.stripe.com/oauth/token',
      method: 'POST',
      body: expect.objectContaining({ code: 'code_123', grant_type: 'authorization_code' })
    }), expect.any(Function))
  })

  test('Stripe OAuth error -> 400 with its error_description', async () => {
    request.mockImplementation((opts, cb) => cb(null, {}, { error: 'invalid_grant', error_description: 'Bad code' }))
    const { token, user } = await signedInUser()
    const res = await api().put(`/api/stripe_auth/${user._id}`).set(bearer(token)).send({ stripe: 'bad' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Bad code' })
  })
})

describe('POST /api/orders/:userId (checkout)', () => {
  const checkout = async (buyer) => {
    const shop = await Shop.create({ name: 'S', owner: buyer.user._id })
    const product = await Product.create({ name: 'P', quantity: 10, price: 5, shop: shop._id })
    const order = {
      products: [{ product: { _id: product._id }, quantity: 2, shop: shop._id }],
      customer_name: 'Buyer', customer_email: 'b@test.com',
      delivery_address: { street: '1 St', city: 'C', zipcode: '1', country: 'X' }
    }
    const res = await api().post(`/api/orders/${buyer.user._id}`).set(bearer(buyer.token)).send({ order, token: 'tok_1' })
    return { res, product }
  }

  test('new buyer: creates Stripe customer, stores it, decrements stock, saves order', async () => {
    stripeReturns(s.customers.create, { id: 'cus_new' })
    const buyer = await signedInUser()
    const { res, product } = await checkout(buyer)

    expect(res.status).toBe(200)
    expect(s.customers.create).toHaveBeenCalledWith({ email: buyer.user.email, source: 'tok_1' })
    expect(res.body.payment_id).toBe('cus_new')
    expect((await User.findById(buyer.user._id)).stripe_customer).toBe('cus_new')
    expect((await Product.findById(product._id)).quantity).toBe(8)
  })

  test('returning buyer: updates the existing Stripe customer', async () => {
    stripeReturns(s.customers.update, { id: 'cus_old' })
    const buyer = await signedInUser()
    await User.updateOne({ _id: buyer.user._id }, { stripe_customer: 'cus_old' })
    const { res } = await checkout(buyer)

    expect(res.status).toBe(200)
    // first two args only: baseline passes a callback as well, the promise style doesn't
    expect(s.customers.update.mock.calls[0].slice(0, 2)).toEqual(['cus_old', { source: 'tok_1' }])
    expect(s.customers.create).not.toHaveBeenCalled()
    expect(res.body.payment_id).toBe('cus_old')
  })

  test("D-08: checking out as another user -> 403, Stripe not called", async () => {
    const victim = await signedInUser()
    await User.updateOne({ _id: victim.user._id }, { stripe_customer: 'cus_victim' })
    const attacker = await signedInUser()
    const res = await api().post(`/api/orders/${victim.user._id}`).set(bearer(attacker.token))
      .send({ order: { products: [] }, token: 'tok_attacker' })

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'User is not authorized' })
    expect(s.customers.update).not.toHaveBeenCalled()
    expect(await Order.countDocuments()).toBe(0)
  })

  test('updating the customer fails -> 400 "Could not update charge details"', async () => {
    stripeReturns(s.customers.update, null, new Error('card declined'))
    const buyer = await signedInUser()
    await User.updateOne({ _id: buyer.user._id }, { stripe_customer: 'cus_old' })
    const { res, product } = await checkout(buyer)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Could not update charge details' })
    expect((await Product.findById(product._id)).quantity).toBe(10)
  })
})

describe('PUT /api/order/:orderId/charge/:userId/:shopId (seller charges an order)', () => {
  const setup = async ({ connected = true } = {}) => {
    const seller = await signedInUser()
    if (connected) await User.updateOne({ _id: seller.user._id }, { stripe_seller: { stripe_user_id: 'acct_1' } })
    const shop = await Shop.create({ name: 'S', owner: seller.user._id })
    const order = await Order.create({
      products: [{ product: new mongoose.Types.ObjectId(), quantity: 1, shop: shop._id }],
      customer_name: 'Buyer', customer_email: 'b@test.com',
      delivery_address: { street: '1 St', city: 'C', zipcode: '1', country: 'X' },
      payment_id: 'cus_1'
    })
    const charge = () => api()
      .put(`/api/order/${order._id}/charge/${seller.user._id}/${shop._id}`)
      .set(bearer(seller.token))
      .send({ cartItemId: order.products[0]._id, status: 'Processing', amount: 12.5 })
    return { order, charge }
  }

  test('charges the buyer on the seller account (amount in cents) and updates status', async () => {
    stripeReturns(s.tokens.create, { id: 'tok_x' })
    stripeReturns(s.charges.create, { id: 'ch_1' })
    const { order, charge } = await setup()
    const res = await charge()

    expect(res.status).toBe(200)
    expect(s.tokens.create).toHaveBeenCalledWith({ customer: 'cus_1' }, { stripeAccount: 'acct_1' })
    expect(s.charges.create).toHaveBeenCalledWith(
      { amount: 1250, currency: 'usd', source: 'tok_x' }, { stripeAccount: 'acct_1' })
    expect((await Order.findById(order._id)).products[0].status).toBe('Processing')
  })

  test('seller without connected Stripe -> 400 "Please connect your Stripe account"', async () => {
    const { charge } = await setup({ connected: false })
    const res = await charge()
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Please connect your Stripe account' })
    expect(s.tokens.create).not.toHaveBeenCalled()
  })
})

// BUG-3: failed Stripe calls were never caught, so the request hung (or, for OAuth, the server crashed).
describe('BUG-3: Stripe failures return 400 instead of hanging', () => {
  test('charge fails -> 400 "Could not process charge", order status unchanged', async () => {
    stripeReturns(s.tokens.create, { id: 'tok_x' })
    stripeReturns(s.charges.create, null, new Error('Your card was declined.'))
    const seller = await signedInUser()
    await User.updateOne({ _id: seller.user._id }, { stripe_seller: { stripe_user_id: 'acct_1' } })
    const shop = await Shop.create({ name: 'S', owner: seller.user._id })
    const order = await Order.create({
      products: [{ product: new mongoose.Types.ObjectId(), quantity: 1, shop: shop._id }],
      customer_name: 'Buyer', customer_email: 'b@test.com',
      delivery_address: { street: '1 St', city: 'C', zipcode: '1', country: 'X' },
      payment_id: 'cus_1'
    })
    const res = await api()
      .put(`/api/order/${order._id}/charge/${seller.user._id}/${shop._id}`)
      .set(bearer(seller.token))
      .send({ cartItemId: order.products[0]._id, status: 'Processing', amount: 12.5 })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Could not process charge' })
    expect((await Order.findById(order._id)).products[0].status).toBe('Not processed')
  })

  test('creating the Stripe customer fails -> 400, no order, stock unchanged', async () => {
    stripeReturns(s.customers.create, null, new Error('Invalid token'))
    const buyer = await signedInUser()
    const shop = await Shop.create({ name: 'S', owner: buyer.user._id })
    const product = await Product.create({ name: 'P', quantity: 10, price: 5, shop: shop._id })
    const res = await api().post(`/api/orders/${buyer.user._id}`).set(bearer(buyer.token)).send({
      token: 'tok_bad',
      order: {
        products: [{ product: { _id: product._id }, quantity: 2, shop: shop._id }],
        customer_name: 'Buyer', customer_email: 'b@test.com',
        delivery_address: { street: '1 St', city: 'C', zipcode: '1', country: 'X' }
      }
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Could not update charge details' })
    expect(await Order.countDocuments()).toBe(0)
    expect((await Product.findById(product._id)).quantity).toBe(10)
  })

  test('Stripe OAuth unreachable -> 400 "Could not connect Stripe account"', async () => {
    request.mockImplementation((opts, cb) => cb(new Error('ECONNRESET')))
    const { token, user } = await signedInUser()
    const res = await api().put(`/api/stripe_auth/${user._id}`).set(bearer(token)).send({ stripe: 'code' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Could not connect Stripe account' })
  })
})
