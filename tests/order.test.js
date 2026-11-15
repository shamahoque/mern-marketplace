// D-08: GET /api/order/:orderId was readable by anyone at baseline.
// Now only the buyer or a seller with a shop in the order may read it.
import mongoose from 'mongoose'
import { api, signedInUser, bearer } from './helpers'
import Shop from '../server/models/shop.model'
import { Order } from '../server/models/order.model'

const setup = async () => {
  const buyer = await signedInUser()
  const seller = await signedInUser({ seller: true })
  const stranger = await signedInUser()
  const shop = await Shop.create({ name: 'S', owner: seller.user._id })
  const order = await Order.create({
    products: [{ product: new mongoose.Types.ObjectId(), quantity: 1, shop: shop._id }],
    customer_name: 'Buyer', customer_email: 'b@test.com',
    delivery_address: { street: '1 St', city: 'C', zipcode: '1', country: 'X' },
    user: buyer.user._id
  })
  const get = (who) => {
    const req = api().get(`/api/order/${order._id}`)
    return who ? req.set(bearer(who.token)) : req
  }
  return { buyer, seller, stranger, order, get }
}

test('without a token -> 401', async () => {
  const { get } = await setup()
  const res = await get()
  expect(res.status).toBe(401)
})

test('buyer can read their order', async () => {
  const { buyer, order, get } = await setup()
  const res = await get(buyer)
  expect(res.status).toBe(200)
  expect(res.body._id).toBe(String(order._id))
  expect(res.body.products[0].shop.name).toBe('S')
})

test('seller with a shop in the order can read it', async () => {
  const { seller, get } = await setup()
  expect((await get(seller)).status).toBe(200)
})

test('any other signed-in user -> 403', async () => {
  const { stranger, get } = await setup()
  const res = await get(stranger)
  expect(res.status).toBe(403)
  expect(res.body).toEqual({ error: 'User is not authorized' })
})

describe('GET /api/orders/user/:userId (D-08)', () => {
  test('buyer can list their own orders', async () => {
    const { buyer, order } = await setup()
    const res = await api().get(`/api/orders/user/${buyer.user._id}`).set(bearer(buyer.token))
    expect(res.status).toBe(200)
    expect(res.body.map(o => o._id)).toEqual([String(order._id)])
  })

  test("listing another user's orders -> 403", async () => {
    const { buyer, stranger } = await setup()
    const res = await api().get(`/api/orders/user/${buyer.user._id}`).set(bearer(stranger.token))
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'User is not authorized' })
  })
})
