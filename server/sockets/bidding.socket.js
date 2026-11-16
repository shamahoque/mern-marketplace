// Handles auction room membership and bid events over Socket.io.
import auctionService from '../services/auction.service'

export default (server) => {
  const io = require('socket.io').listen(server)
  io.on('connection', function(socket){
    socket.on('join auction room', data => {
      socket.join(data.room)
    })
    socket.on('leave auction room', data => {
      socket.leave(data.room)
    })
    socket.on('new bid', data => {
      bid(data.bidInfo, data.room, socket)
    })
  })
  const bid = async (bid, auction, socket) => {
    try {
      let result = await auctionService.placeBid(auction, bid)
      if (result === null) {
        return socket.emit('bid rejected', {
          room: auction,
          reason: 'Bid must be higher than the current highest bid'
        })
      }
      io
        .to(auction)
        .emit('new bid', result)
    } catch(err) {
      console.log(err)
    }
  }
  return io
}
