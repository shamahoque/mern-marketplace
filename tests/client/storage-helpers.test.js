// Characterization test for D-12. Pins down how the cart (localStorage) and sign-in
// (sessionStorage) helpers behave, in the browser and during server-side rendering,
// so the shared storage helper can replace their repeated code safely.
import cart from '../../client/cart/cart-helper'
import auth from '../../client/auth/auth-helper'
import { signout } from '../../client/auth/api-auth'

jest.mock('../../client/auth/api-auth', () => ({ signout: jest.fn(() => Promise.resolve({})) }))

class MemoryStorage {
  constructor () { this.data = {} }
  getItem (key) { return key in this.data ? this.data[key] : null }
  setItem (key, value) { this.data[key] = String(value) }
  removeItem (key) { delete this.data[key] }
}

const product = { _id: 'p1', name: 'Bike', price: 100, shop: { _id: 's1', name: 'Shop' } }
const jwt = { token: 'TOKEN', user: { _id: 'u1', name: 'Ann', email: 'a@b.c', seller: true } }

const inBrowser = () => {
  global.window = {}
  global.document = { cookie: 'x' }
  global.localStorage = new MemoryStorage()
  global.sessionStorage = new MemoryStorage()
}
const onServer = () => {
  delete global.window
  delete global.document
  delete global.localStorage
  delete global.sessionStorage
}

afterEach(onServer)

describe('cart helper in the browser', () => {
  beforeEach(inBrowser)

  test('an empty cart has no items', () => {
    expect(cart.itemTotal()).toBe(0)
    expect(cart.getCart()).toEqual([])
  })

  test('addItem stores the product with quantity 1 and its shop id, then calls back', () => {
    const cb = jest.fn()
    cart.addItem(product, cb)
    cart.addItem(product, cb)
    expect(cb).toHaveBeenCalledTimes(2)
    expect(cart.itemTotal()).toBe(2)
    expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
      { product, quantity: 1, shop: 's1' },
      { product, quantity: 1, shop: 's1' }
    ])
  })

  test('updateCart changes one item quantity', () => {
    cart.addItem(product, () => {})
    cart.updateCart(0, 5)
    expect(cart.getCart()[0].quantity).toBe(5)
  })

  test('updateCart on an empty cart throws, as before', () => {
    expect(() => cart.updateCart(0, 5)).toThrow(TypeError)
  })

  test('removeItem removes by index and returns the remaining items', () => {
    cart.addItem(product, () => {})
    cart.addItem({ ...product, _id: 'p2' }, () => {})
    const left = cart.removeItem(0)
    expect(left.map(i => i.product._id)).toEqual(['p2'])
    expect(cart.getCart()).toEqual(left)
  })

  test('removeItem on an empty cart returns an empty list', () => {
    expect(cart.removeItem(0)).toEqual([])
  })

  test('emptyCart clears storage and calls back', () => {
    const cb = jest.fn()
    cart.addItem(product, () => {})
    cart.emptyCart(cb)
    expect(localStorage.getItem('cart')).toBeNull()
    expect(cb).toHaveBeenCalledTimes(1)
  })
})

describe('cart helper during server-side rendering', () => {
  beforeEach(onServer)

  test('reads return empty values and writes do nothing', () => {
    const cb = jest.fn()
    expect(cart.itemTotal()).toBe(0)
    expect(cart.getCart()).toEqual([])
    expect(cart.removeItem(0)).toEqual([])
    cart.addItem(product, cb)
    cart.updateCart(0, 2)
    cart.emptyCart(cb)
    expect(cb).not.toHaveBeenCalled()
  })
})

describe('auth helper in the browser', () => {
  beforeEach(inBrowser)

  test('isAuthenticated is false until someone signs in', () => {
    expect(auth.isAuthenticated()).toBe(false)
  })

  test('authenticate stores the token and user, then calls back', () => {
    const cb = jest.fn()
    auth.authenticate(jwt, cb)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(auth.isAuthenticated()).toEqual(jwt)
    expect(JSON.parse(sessionStorage.getItem('jwt'))).toEqual(jwt)
  })

  test('updateUser replaces the stored user and calls back', () => {
    const cb = jest.fn()
    auth.authenticate(jwt, () => {})
    auth.updateUser({ _id: 'u1', name: 'Bea' }, cb)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(auth.isAuthenticated()).toEqual({ token: 'TOKEN', user: { _id: 'u1', name: 'Bea' } })
  })

  test('updateUser does nothing when nobody is signed in', () => {
    const cb = jest.fn()
    auth.updateUser({ name: 'Bea' }, cb)
    expect(cb).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('jwt')).toBeNull()
  })

  test('clearJWT removes the token, calls back, signs out and expires the cookie', async () => {
    const cb = jest.fn()
    auth.authenticate(jwt, () => {})
    auth.clearJWT(cb)
    expect(sessionStorage.getItem('jwt')).toBeNull()
    expect(cb).toHaveBeenCalledTimes(1)
    expect(signout).toHaveBeenCalled()
    await Promise.resolve()
    await Promise.resolve()
    expect(document.cookie).toBe('t=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;')
  })
})

describe('auth helper during server-side rendering', () => {
  beforeEach(onServer)

  test('nobody is signed in, and authenticate still calls back', () => {
    const cb = jest.fn()
    expect(auth.isAuthenticated()).toBe(false)
    auth.authenticate(jwt, cb)
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
