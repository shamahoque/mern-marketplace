import fs from 'fs'
import formidable from 'formidable'
import path from 'path'
import Auction from '../server/models/auction.model'
import { api, signedInUser, bearer } from './helpers'

jest.mock('../client/assets/images/default.png', () => '/client/assets/images/default.png')

const image = path.resolve('client/assets/images/default.png')
const fields = () => ({ itemName: 'Clock', description: 'Old clock', startingBid: 10,
  bidStart: new Date(Date.now() - 60000).toISOString(), bidEnd: new Date(Date.now() + 600000).toISOString() })
const upload = (request, data) => Object.entries(data).reduce((req, [key, value]) => req.field(key, String(value)), request)

describe('auction APIs', () => {
  test.each([false, true])('seller creates an auction (image: %s)', async withImage => {
    const seller = await signedInUser({ seller: true })
    let request = upload(api().post(`/api/auctions/by/${seller.user._id}`).set(bearer(seller.token)), fields())
    if (withImage) request = request.attach('image', image)
    const res = await request.expect(200)
    expect(res.body.itemName).toBe('Clock')
    expect(await Auction.findById(res.body._id)).not.toBeNull()
    const photo = await api().get(`/api/auctions/image/${res.body._id}`).expect(200)
    expect(photo.headers['content-type']).toMatch(/image\//)
    if (withImage) expect(photo.body).toEqual(fs.readFileSync(image))
    const read = await api().get(`/api/auction/${res.body._id}`).expect(200)
    expect(read.body).not.toHaveProperty('image')
  })

  test('open list filters and sorts, and seller and bidder lists populate users', async () => {
    const seller = await signedInUser({ seller: true })
    const bidder = await signedInUser()
    const early = await Auction.create({ ...fields(), seller: seller.user._id,
      bidStart: new Date(Date.now() - 120000), bids: [{ bidder: bidder.user._id, bid: 11, time: new Date() }] })
    const later = await Auction.create({ ...fields(), seller: seller.user._id })
    await Auction.create({ ...fields(), seller: seller.user._id, bidEnd: new Date(Date.now() - 10000) })
    const open = await api().get('/api/auctions').expect(200)
    expect(open.body.map(a => a._id)).toEqual([String(early._id), String(later._id)])
    expect(open.body[0].seller).toEqual({ _id: seller.user._id, name: seller.user.name })
    expect(open.body[0].bids[0].bidder).toEqual({ _id: bidder.user._id, name: bidder.user.name })
    const owned = await api().get(`/api/auctions/by/${seller.user._id}`).set(bearer(seller.token)).expect(200)
    expect(owned.body).toHaveLength(3)
    // characterization: bidder listing is public
    const bidOn = await api().get(`/api/auctions/bid/${bidder.user._id}`).expect(200)
    expect(bidOn.body.map(a => a._id)).toEqual([String(early._id)])
  })

  test('only the auction seller can update', async () => {
    const seller = await signedInUser({ seller: true })
    const other = await signedInUser({ seller: true })
    const auction = await Auction.create({ ...fields(), seller: seller.user._id })
    const res = await api().put(`/api/auctions/${auction._id}`).set(bearer(seller.token)).field('itemName', 'Updated').expect(200)
    expect(res.body.itemName).toBe('Updated')
    const denied = await api().put(`/api/auctions/${auction._id}`).set(bearer(other.token)).field('itemName', 'Denied').expect(403)
    expect(denied.body).toEqual({ error: 'User is not authorized' })
  })

  test('delete returns the deleted auction after removal', async () => {
    const seller = await signedInUser({ seller: true })
    const auction = await Auction.create({ ...fields(), seller: seller.user._id })
    const res = await api().delete(`/api/auctions/${auction._id}`).set(bearer(seller.token)).expect(200)
    // BUG-1 fixed: the deleted document is returned
    expect(res.body).toMatchObject({ _id: String(auction._id), itemName: auction.itemName })
    expect(await Auction.findById(auction._id)).toBeNull()
  })

  test('default photo is available', async () => {
    const res = await api().get('/api/auctions/defaultphoto').expect(200)
    expect(res.headers['content-type']).toMatch(/image\//)
  })
})

describe('auction upload parse failures', () => {
  beforeEach(() => {
    jest.spyOn(formidable.IncomingForm.prototype, 'parse').mockImplementation(function (req, cb) {
      // Drain the multipart stream before responding so the request finishes cleanly.
      req.on('end', () => cb(new Error('boom'), {}, {}))
      req.resume()
    })
  })

  afterEach(() => jest.restoreAllMocks())

  test('create returns the upload error without saving an auction', async () => {
    const seller = await signedInUser({ seller: true })
    const save = jest.spyOn(Auction.prototype, 'save')
    await upload(api().post(`/api/auctions/by/${seller.user._id}`).set(bearer(seller.token)), fields())
      .expect(400, { error: 'Image could not be uploaded' })
    expect(save).not.toHaveBeenCalled()
    expect(await Auction.countDocuments()).toBe(0)
  })

  test('update returns the upload error without modifying an auction', async () => {
    const seller = await signedInUser({ seller: true })
    const auction = await Auction.create({ ...fields(), seller: seller.user._id })
    const before = auction.toObject()
    const save = jest.spyOn(Auction.prototype, 'save')
    await api().put(`/api/auctions/${auction._id}`).set(bearer(seller.token))
      .field('itemName', 'Not saved').expect(400, { error: 'Photo could not be uploaded' })
    expect(save).not.toHaveBeenCalled()
    expect((await Auction.findById(auction._id)).toObject()).toEqual(before)
  })
})
