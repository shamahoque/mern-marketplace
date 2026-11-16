import fs from 'fs'
import mongoose from 'mongoose'
import Shop from '../server/models/shop.model'
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

  test('owner deletion responds before the removal promise is serialized', async () => {
    const owner = await signedInUser({ seller: true })
    const shop = await Shop.create({ name: 'Remove me', owner: owner.user._id })
    const res = await api().delete(`/api/shops/${shop._id}`).set(bearer(owner.token)).expect(200)
    // characterization: BUG-1, body is {} because shop.remove() is not awaited
    expect(res.body).toEqual({})
    const deadline = Date.now() + 500
    while (await Shop.exists({ _id: shop._id }) && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    expect(await Shop.findById(shop._id)).toBeNull()
  })

  test('missing images use the default photo', async () => {
    const shop = await Shop.create({ name: 'No logo' })
    for (const path of [`/api/shops/logo/${shop._id}`, '/api/shops/defaultphoto']) {
      const res = await api().get(path).expect(200).expect('Content-Type', /image\/png/)
      expect(res.body).toEqual(fs.readFileSync(image))
    }
  })

  test('missing and malformed shop ids preserve their distinct errors', async () => {
    await api().get(`/api/shop/${new mongoose.Types.ObjectId()}`).expect(400, { error: 'Shop not found' })
    await api().get('/api/shop/not-an-id').expect(400, { error: 'Could not retrieve shop' })
  })
})
