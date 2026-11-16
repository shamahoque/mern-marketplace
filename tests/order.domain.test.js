import stripe from 'stripe'
import { api, signedInUser, bearer } from './helpers'
import Shop from '../server/models/shop.model'
import Product from '../server/models/product.model'
import { Order } from '../server/models/order.model'

jest.mock('stripe', () => {
  const methods = {
    customers: { create: jest.fn(), update: jest.fn() },
    tokens: { create: jest.fn() },
    charges: { create: jest.fn() }
  }
  return () => methods
})

const stripeClient = stripe()
const orderFields = {
  customer_name: 'Buyer',
  customer_email: 'buyer@test.com',
  delivery_address: { street: '1 Street', city: 'City', zipcode: '123', country: 'Country' }
}

const fixture = async () => {
  const seller = await signedInUser({ seller: true })
  const shop = await Shop.create({ name: 'Shop', owner: seller.user._id })
  const product = await Product.create({ name: 'Product', quantity: 10, price: 5, shop: shop._id })
  const order = await Order.create({
    ...orderFields,
    products: [{ product: product._id, shop: shop._id, quantity: 2 }]
  })
  return { seller, shop, product, order }
}

beforeEach(() => jest.clearAllMocks())

// The charge route is covered by tests/payment.test.js.
describe('domain order operations', () => {
  test('checkout saves the Stripe customer id and decreases each ordered product quantity', async () => {
    stripeClient.customers.create.mockResolvedValue({ id: 'cus_1' })
    const buyer = await signedInUser()
    const seller = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Shop', owner: seller.user._id })
    const first = await Product.create({ name: 'First', quantity: 10, price: 5, shop: shop._id })
    const second = await Product.create({ name: 'Second', quantity: 7, price: 9, shop: shop._id })
    const res = await api().post(`/api/orders/${buyer.user._id}`).set(bearer(buyer.token)).send({
      token: 'tok_1',
      order: {
        ...orderFields,
        products: [
          { product: { _id: first._id }, shop: shop._id, quantity: 2 },
          { product: { _id: second._id }, shop: shop._id, quantity: 3 }
        ]
      }
    })

    expect(res.status).toBe(200)
    expect(res.body.payment_id).toBe('cus_1')
    const saved = await Order.findById(res.body._id)
    expect(saved.payment_id).toBe('cus_1')
    expect(String(saved.user)).toBe(buyer.user._id)
    expect((await Product.findById(first._id)).quantity).toBe(8)
    expect((await Product.findById(second._id)).quantity).toBe(4)
  })

  test('shop owner lists only matching orders newest first with populated products', async () => {
    const { seller, shop, product, order } = await fixture()
    order.created = new Date('2020-01-01')
    await order.save()
    const latest = await Order.create({
      ...orderFields,
      created: new Date('2021-01-01'),
      products: [{ product: product._id, shop: shop._id, quantity: 1 }]
    })
    await Order.create({ ...orderFields, products: [] })
    const res = await api().get(`/api/orders/shop/${shop._id}`).set(bearer(seller.token))

    expect(res.status).toBe(200)
    expect(res.body.map(item => item._id)).toEqual([String(latest._id), String(order._id)])
    expect(res.body[0].products[0].product).toEqual({ _id: String(product._id), name: 'Product', price: 5 })
  })

  test('non-owner cannot list shop orders', async () => {
    const { shop } = await fixture()
    const stranger = await signedInUser({ seller: true })
    const res = await api().get(`/api/orders/shop/${shop._id}`).set(bearer(stranger.token))
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'User is not authorized' })
  })

  test('status values preserve enum order and spelling', async () => {
    const res = await api().get('/api/order/status_values')
    expect(res.status).toBe(200)
    expect(res.body).toEqual(['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
  })

  test('shop owner updates an item status', async () => {
    const { seller, shop, order } = await fixture()
    const res = await api().put(`/api/order/status/${shop._id}`).set(bearer(seller.token))
      .send({ cartItemId: order.products[0]._id, status: 'Shipped' })
    expect(res.status).toBe(200)
    expect(res.body.n).toBe(1)
    expect((await Order.findById(order._id)).products[0].status).toBe('Shipped')
  })

  test('cancellation restores the requested quantity and changes the item status', async () => {
    const { seller, shop, product, order } = await fixture()
    const res = await api().put(`/api/order/${shop._id}/cancel/${product._id}`).set(bearer(seller.token))
      .send({ cartItemId: order.products[0]._id, status: 'Cancelled', quantity: 2 })
    expect(res.status).toBe(200)
    expect(res.body.n).toBe(1)
    expect((await Product.findById(product._id)).quantity).toBe(12)
    expect((await Order.findById(order._id)).products[0].status).toBe('Cancelled')
  })

  test('owner of another shop cannot update an unrelated cart item', async () => {
    const { order } = await fixture()
    const seller = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Other shop', owner: seller.user._id })
    const res = await api().put(`/api/order/status/${shop._id}`).set(bearer(seller.token))
      .send({ cartItemId: order.products[0]._id, status: 'Delivered' })
    // D-15 fixed: item status updates are scoped to the owning shop
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Order item not found' })
    expect((await Order.findById(order._id)).products[0].status).toBe('Not processed')
  })
})
