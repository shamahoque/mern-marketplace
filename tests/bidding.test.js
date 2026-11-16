import http from 'http'
import Auction from '../server/models/auction.model'
import bidding from '../server/sockets/bidding.socket'
import { signedInUser } from './helpers'

const ioClient = jest.requireActual('socket.io-client')
const event = (socket, name, timeout = 2000) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { socket.removeListener(name, receive); reject(new Error(`Timed out waiting for ${name}`)) }, timeout)
  const receive = data => { clearTimeout(timer); resolve(data) }
  socket.once(name, receive)
})
const noEvent = (socket, name) => new Promise((resolve, reject) => {
  const receive = () => { clearTimeout(timer); reject(new Error(`Unexpected ${name}`)) }
  const timer = setTimeout(() => { socket.removeListener(name, receive); resolve() }, 300)
  socket.once(name, receive)
})

let server
let clients
beforeEach(async () => {
  clients = []
  server = http.createServer()
  bidding(server)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
})
afterEach(async () => {
  clients.forEach(client => client.close())
  await new Promise(resolve => server.close(resolve))
})
const connect = async () => {
  const socket = ioClient(`http://127.0.0.1:${server.address().port}`, { transports: ['websocket'], forceNew: true, reconnection: false })
  clients.push(socket)
  await event(socket, 'connect')
  return socket
}
const join = async (socket, room) => {
  socket.emit('join auction room', { room })
  await new Promise(resolve => setTimeout(resolve, 40))
}

test('room subscribers receive increasing populated bids, while a departed client receives none', async () => {
  const seller = await signedInUser({ seller: true })
  const bidder = await signedInUser()
  const auction = await Auction.create({ itemName: 'Clock', seller: seller.user._id, startingBid: 10,
    bidStart: new Date(Date.now() - 60000), bidEnd: new Date(Date.now() + 600000) })
  const room = String(auction._id)
  const first = await connect()
  const second = await connect()
  await join(first, room)
  await join(second, room)
  const send = async amount => {
    const received = Promise.all([event(first, 'new bid'), event(second, 'new bid')])
    first.emit('new bid', { room, bidInfo: { bid: amount, time: new Date().toISOString(), bidder: bidder.user._id } })
    return received
  }
  const initial = await send(11)
  initial.forEach(result => {
    expect(result.bids[0].bid).toBe(11)
    expect(result.bids[0].bidder).toEqual({ _id: bidder.user._id, name: bidder.user.name })
  })
  const higher = await send(12)
  higher.forEach(result => expect(result.bids.map(bid => bid.bid)).toEqual([12, 11]))
  second.emit('leave auction room', { room })
  await new Promise(resolve => setTimeout(resolve, 40))
  const silent = noEvent(second, 'new bid')
  const received = event(first, 'new bid')
  first.emit('new bid', { room, bidInfo: { bid: 13, time: new Date().toISOString(), bidder: bidder.user._id } })
  expect((await received).bids[0].bid).toBe(13)
  await silent
})

test('a rejected lower bid notifies only the sender without broadcasting an auction', async () => {
  const seller = await signedInUser({ seller: true })
  const bidder = await signedInUser()
  const auction = await Auction.create({ itemName: 'Clock', seller: seller.user._id, bidEnd: new Date(Date.now() + 600000),
    bids: [{ bid: 20, bidder: bidder.user._id, time: new Date() }] })
  const room = String(auction._id)
  const first = await connect()
  const second = await connect()
  await join(first, room)
  await join(second, room)
  const rejected = event(first, 'bid rejected')
  const silent = Promise.all([noEvent(first, 'new bid'), noEvent(second, 'new bid'), noEvent(second, 'bid rejected')])
  first.emit('new bid', { room, bidInfo: { bid: 19, time: new Date().toISOString(), bidder: bidder.user._id } })
  // BUG-4 fixed: rejected bids never replace the room's auction with null.
  expect(await rejected).toEqual({ room, reason: 'Bid must be higher than the current highest bid' })
  await silent
  expect((await Auction.findById(auction._id)).bids).toHaveLength(1)
})
