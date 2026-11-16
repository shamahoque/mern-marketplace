import fs from 'fs'
import formidable from 'formidable'
import mongoose from 'mongoose'
import Shop from '../server/models/shop.model'
import Product from '../server/models/product.model'
import { api, signedInUser, bearer } from './helpers'

// Resolve the real fixture for sendFile instead of the global image-import stub.
jest.mock('../client/assets/images/default.png', () => '/client/assets/images/default.png')
const image = 'client/assets/images/default.png'

describe('shop API characterization', () => {
  test('seller creates shops with and without an image; public reads omit the image', async () => {
    const { user, token } = await signedInUser({ seller: true })
    const plain = await api().post(`/api/shops/by/${user._id}`).set(bearer(token))
      .field('name', 'Plain shop').field('description', 'Description').expect(200)
    const uploaded = await api().post(`/api/shops/by/${user._id}`).set(bearer(token))
      .field('name', 'Logo shop').field('description', 'Description').attach('image', image).expect(200)
    expect(await Shop.countDocuments()).toBe(2)
    const logo = await api().get(`/api/shops/logo/${uploaded.body._id}`).expect(200).expect('Content-Type', /image\/png/)
    expect(logo.body).toEqual(fs.readFileSync(image))
    const read = await api().get(`/api/shop/${uploaded.body._id}`).expect(200)
    expect(read.body.image).toBeUndefined()
    const all = await api().get('/api/shops').expect(200)
    expect(all.body.map(s => s._id).sort()).toEqual([plain.body._id, uploaded.body._id].sort())
    const owned = await api().get(`/api/shops/by/${user._id}`).set(bearer(token)).expect(200)
    expect(owned.body).toHaveLength(2)
    expect(owned.body[0].owner).toEqual({ _id: user._id, name: user.name })
  })

  test('creation requires seller status and authorization for the user parameter', async () => {
    const buyer = await signedInUser()
    await api().post(`/api/shops/by/${buyer.user._id}`).set(bearer(buyer.token))
      .field('name', 'Denied').expect(403, { error: 'User is not a seller' })
    const seller = await signedInUser({ seller: true })
    await api().post(`/api/shops/by/${seller.user._id}`).set(bearer(buyer.token))
      .field('name', 'Denied').expect(403, { error: 'User is not authorized' })
    expect(await Shop.countDocuments()).toBe(0)
  })

  test('only the owner updates a shop', async () => {
    const owner = await signedInUser({ seller: true })
    const stranger = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Before', owner: owner.user._id })
    await api().put(`/api/shops/${shop._id}`).set(bearer(stranger.token))
      .field('name', 'Denied').expect(403, { error: 'User is not authorized' })
    const updated = await api().put(`/api/shops/${shop._id}`).set(bearer(owner.token))
      .field('name', 'After').expect(200)
    expect(updated.body.name).toBe('After')
    expect((await Shop.findById(shop._id)).name).toBe('After')
  })

  test('owner deletion returns the deleted shop after removal', async () => {
    const owner = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Remove me', owner: owner.user._id })
    const res = await api().delete(`/api/shops/${shop._id}`).set(bearer(owner.token)).expect(200)
    // BUG-1 fixed: the deleted document is returned
    expect(res.body).toMatchObject({ _id: String(shop._id), name: shop.name })
    expect(await Shop.findById(shop._id)).toBeNull()
  })

  test('missing images use the default photo', async () => {
    const shop = await Shop.create({ name: 'No logo' })
    for (const path of [`/api/shops/logo/${shop._id}`, '/api/shops/defaultphoto']) {
      const res = await api().get(path).expect(200).expect('Content-Type', /image\/png/)
      expect(res.body).toEqual(fs.readFileSync(image))
    }
  })

  test('deleting a shop removes only its products from the catalogue', async () => {
    const owner = await signedInUser({ seller: true })
    const first = await Shop.create({ name: 'First', owner: owner.user._id })
    const other = await Shop.create({ name: 'Other', owner: owner.user._id })
    const products = await Product.create([
      { name: 'First product', quantity: 3, price: 5, shop: first._id },
      { name: 'Second product', quantity: 4, price: 6, shop: first._id },
      { name: 'Other product', quantity: 5, price: 7, shop: other._id }
    ])
    const deleted = await api().delete(`/api/shops/${first._id}`).set(bearer(owner.token)).expect(200)
    expect(deleted.body).toMatchObject({ _id: String(first._id), name: first.name })
    expect(await Shop.findById(first._id)).toBeNull()
    expect(await Shop.findById(other._id)).not.toBeNull()
    expect(await Product.countDocuments({ shop: first._id })).toBe(0)
    expect(await Product.countDocuments()).toBe(1)
    const catalogue = await api().get('/api/products').expect(200)
    expect(catalogue.body.map(product => product._id)).toEqual([String(products[2]._id)])
  })

  test('missing and malformed shop ids preserve their distinct errors', async () => {
    await api().get(`/api/shop/${new mongoose.Types.ObjectId()}`).expect(400, { error: 'Shop not found' })
    await api().get('/api/shop/not-an-id').expect(400, { error: 'Could not retrieve shop' })
  })
})

describe('shop upload parse failures', () => {
  beforeEach(() => {
    jest.spyOn(formidable.IncomingForm.prototype, 'parse').mockImplementation(function (req, cb) {
      // Drain the multipart stream before responding so the request finishes cleanly.
      req.on('end', () => cb(new Error('boom'), {}, {}))
      req.resume()
    })
  })

  afterEach(() => jest.restoreAllMocks())

  test('create returns the upload error without saving a shop', async () => {
    const seller = await signedInUser({ seller: true })
    const save = jest.spyOn(Shop.prototype, 'save')
    await api().post(`/api/shops/by/${seller.user._id}`).set(bearer(seller.token))
      .field('name', 'Not saved').expect(400, { error: 'Image could not be uploaded' })
    expect(save).not.toHaveBeenCalled()
    expect(await Shop.countDocuments()).toBe(0)
  })

  test('update returns the upload error without modifying a shop', async () => {
    const seller = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Unchanged', owner: seller.user._id })
    const before = shop.toObject()
    const save = jest.spyOn(Shop.prototype, 'save')
    await api().put(`/api/shops/${shop._id}`).set(bearer(seller.token))
      .field('name', 'Not saved').expect(400, { error: 'Photo could not be uploaded' })
    expect(save).not.toHaveBeenCalled()
    expect((await Shop.findById(shop._id)).toObject()).toEqual(before)
  })
})
