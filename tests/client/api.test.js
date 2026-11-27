// Characterization test for D-09. Records what every client API function sends to the
// server (URL, method, token, body), so the shared apiClient refactor can be checked against it.
import * as auctionApi from '../../client/auction/api-auction'
import * as authApi from '../../client/auth/api-auth'
import * as orderApi from '../../client/order/api-order'
import * as productApi from '../../client/product/api-product'
import * as shopApi from '../../client/shop/api-shop'
import * as userApi from '../../client/user/api-user'

const params = { userId: 'u1', shopId: 's1', productId: 'p1', orderId: 'o1', auctionId: 'a1' }
const cred = { t: 'TOKEN' }
const signal = { name: 'SIGNAL' }
const form = { name: 'FORMDATA' }

const calls = [
  ['auction.create', () => auctionApi.create(params, cred, form)],
  ['auction.listOpen', () => auctionApi.listOpen(signal)],
  ['auction.listBySeller', () => auctionApi.listBySeller(params, cred, signal)],
  ['auction.listByBidder', () => auctionApi.listByBidder(params, cred, signal)],
  ['auction.read', () => auctionApi.read(params, signal)],
  ['auction.update', () => auctionApi.update(params, cred, form)],
  ['auction.remove', () => auctionApi.remove(params, cred)],
  ['auth.signin', () => authApi.signin({ email: 'a@b.c', password: 'secret' })],
  ['auth.signout', () => authApi.signout()],
  ['order.create', () => orderApi.create(params, cred, { products: [] }, 'tok_visa')],
  ['order.listByShop', () => orderApi.listByShop(params, cred, signal)],
  ['order.update', () => orderApi.update(params, cred, { cartItemId: 'c1', status: 'Shipped' })],
  ['order.cancelProduct', () => orderApi.cancelProduct(params, cred, { cartItemId: 'c1', quantity: 2 })],
  ['order.processCharge', () => orderApi.processCharge(params, cred, { cartItemId: 'c1', amount: 10 })],
  ['order.getStatusValues', () => orderApi.getStatusValues(signal)],
  ['order.listByUser', () => orderApi.listByUser(params, cred, signal)],
  ['order.read', () => orderApi.read(params, cred, signal)],
  ['product.create', () => productApi.create(params, cred, form)],
  ['product.read', () => productApi.read(params, signal)],
  ['product.update', () => productApi.update(params, cred, form)],
  ['product.remove', () => productApi.remove(params, cred)],
  ['product.listByShop', () => productApi.listByShop(params, signal)],
  ['product.listLatest', () => productApi.listLatest(signal)],
  ['product.listRelated', () => productApi.listRelated(params, signal)],
  ['product.listCategories', () => productApi.listCategories(signal)],
  ['product.list', () => productApi.list({ search: 'bike', category: 'All' }, signal)],
  ['shop.create', () => shopApi.create(params, cred, form)],
  ['shop.list', () => shopApi.list(signal)],
  ['shop.listByOwner', () => shopApi.listByOwner(params, cred, signal)],
  ['shop.read', () => shopApi.read(params, signal)],
  ['shop.update', () => shopApi.update(params, cred, form)],
  ['shop.remove', () => shopApi.remove(params, cred)],
  ['user.create', () => userApi.create({ name: 'A', email: 'a@b.c', password: 'secret' })],
  ['user.list', () => userApi.list(cred, signal)],
  ['user.read', () => userApi.read(params, cred, signal)],
  ['user.update', () => userApi.update(params, cred, { name: 'B' })],
  ['user.remove', () => userApi.remove(params, cred)],
  ['user.stripeUpdate', () => userApi.stripeUpdate(params, cred, 'ac_123', signal)]
]

beforeEach(() => {
  global.fetch = jest.fn(async () => ({ json: async () => ({ ok: true }) }))
})

test.each(calls)('%s sends the same request', async (name, call) => {
  await expect(call()).resolves.toEqual({ ok: true })
  expect(global.fetch).toHaveBeenCalledTimes(1)
  const [url, options] = global.fetch.mock.calls[0]
  const headers = options.headers || {}
  const hasBody = options.body !== undefined
  expect({
    url,
    method: options.method,
    authorization: headers.Authorization || null,
    // Content-Type only matters when a body is sent; FormData bodies must have none.
    contentType: hasBody ? headers['Content-Type'] || null : null,
    body: hasBody ? options.body : null,
    signal: options.signal || null,
    cookies: options.credentials || null
  }).toMatchSnapshot()
})

test('a network error is logged and resolves to undefined', async () => {
  global.fetch = jest.fn(async () => { throw new Error('offline') })
  const log = jest.spyOn(console, 'log').mockImplementation(() => {})
  await expect(shopApi.list()).resolves.toBeUndefined()
  expect(log).toHaveBeenCalled()
  log.mockRestore()
})
