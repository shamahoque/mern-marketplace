import fs from 'fs'
import Shop from '../server/models/shop.model'
import Product from '../server/models/product.model'
import { api, signedInUser, bearer } from './helpers'

jest.mock('../client/assets/images/default.png', () => '/client/assets/images/default.png')
const image = 'client/assets/images/default.png'
const fixture = (shop, overrides = {}) => Product.create({ name: 'Product', description: 'Description', category: 'Books', quantity: 10, price: 12, shop, ...overrides })

describe('product API characterization', () => {
  test('owner creates products with and without an image; other sellers cannot create', async () => {
    const owner = await signedInUser({ seller: true })
    const stranger = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Shop', owner: owner.user._id })
    const create = token => api().post(`/api/products/by/${shop._id}`).set(bearer(token))
      .field('name', 'New product').field('description', 'Description').field('category', 'Books')
      .field('quantity', '4').field('price', '15')
    await create(stranger.token).expect(403, { error: 'User is not authorized' })
    const plain = await create(owner.token).expect(200)
    expect(plain.body).toMatchObject({ name: 'New product', quantity: 4, price: 15 })
    const uploaded = await create(owner.token).attach('image', image).expect(200)
    const photo = await api().get(`/api/product/image/${uploaded.body._id}`).expect(200).expect('Content-Type', /image\/png/)
    expect(photo.body).toEqual(fs.readFileSync(image))
    expect(Buffer.from((await Product.findById(uploaded.body._id)).image.data)).toEqual(fs.readFileSync(image))
  })

  test('catalogue, category search, latest and related preserve filters and limits', async () => {
    const shop = await Shop.create({ name: 'Book shop' })
    const otherShop = await Shop.create({ name: 'Other shop' })
    const products = []
    for (let i = 0; i < 7; i++) {
      products.push(await fixture(shop._id, { name: `Novel ${i}`, created: new Date(2020, 0, i + 1) }))
    }
    const other = await fixture(otherShop._id, { name: 'NOVEL game', category: 'Games', created: new Date(2019, 0, 1) })
    const byShop = await api().get(`/api/products/by/${shop._id}`).expect(200)
    expect(byShop.body).toHaveLength(7)
    byShop.body.forEach(p => {
      expect(p.image).toBeUndefined()
      expect(p.shop).toEqual({ _id: String(shop._id), name: shop.name })
    })
    const latest = await api().get('/api/products/latest').expect(200)
    expect(latest.body.map(p => p._id)).toEqual(products.slice(-5).reverse().map(p => String(p._id)))
    const related = await api().get(`/api/products/related/${products[0]._id}`).expect(200)
    expect(related.body).toHaveLength(5)
    related.body.forEach(p => {
      expect(p.category).toBe('Books')
      expect(p._id).not.toBe(String(products[0]._id))
    })
    const categories = await api().get('/api/products/categories').expect(200)
    expect(categories.body.sort()).toEqual(['Books', 'Games'])
    const books = await api().get('/api/products').query({ search: 'nOvEl', category: 'Books' }).expect(200)
    expect(books.body).toHaveLength(7)
    const all = await api().get('/api/products').query({ search: 'novel', category: 'All' }).expect(200)
    expect(all.body).toHaveLength(8)
    expect(all.body.some(p => p._id === String(other._id))).toBe(true)
    expect((await api().get('/api/products').query({ search: 'absent' }).expect(200)).body).toEqual([])
    const read = await api().get(`/api/products/${products[0]._id}`).expect(200)
    expect(read.body.image).toBeUndefined()
    expect(read.body.shop).toEqual({ _id: String(shop._id), name: shop.name })
  })

  test('owner updates and deletes a product', async () => {
    const owner = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Shop', owner: owner.user._id })
    const product = await fixture(shop._id)
    const updated = await api().put(`/api/product/${shop._id}/${product._id}`).set(bearer(owner.token))
      .field('name', 'Updated').expect(200)
    expect(updated.body.name).toBe('Updated')
    const removed = await api().delete(`/api/product/${shop._id}/${product._id}`).set(bearer(owner.token)).expect(200)
    expect(removed.body).toMatchObject({ _id: String(product._id), name: 'Updated' })
    expect(await Product.findById(product._id)).toBeNull()
  })

  test('missing images and the explicit default route return the default photo', async () => {
    const product = await fixture(undefined)
    for (const path of [`/api/product/image/${product._id}`, '/api/product/defaultphoto']) {
      const res = await api().get(path).expect(200).expect('Content-Type', /image\/png/)
      expect(res.body).toEqual(fs.readFileSync(image))
    }
  })

  test('shop ownership alone permits updating another shop product', async () => {
    const sellerA = await signedInUser({ seller: true })
    const sellerB = await signedInUser({ seller: true })
    const shopA = await Shop.create({ name: 'A', owner: sellerA.user._id })
    const shopB = await Shop.create({ name: 'B', owner: sellerB.user._id })
    const product = await fixture(shopB._id)
    // characterization: D-14, product ownership is not checked against :shopId
    await api().put(`/api/product/${shopA._id}/${product._id}`).set(bearer(sellerA.token))
      .field('name', 'Changed across shops').expect(200)
    expect((await Product.findById(product._id)).name).toBe('Changed across shops')
  })
})
