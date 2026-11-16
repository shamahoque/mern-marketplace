// Persists auction data independently of the transport layer.
import Auction from '../models/auction.model'

// The auction service layer grows in D-04.
const placeBid = (auctionId, bid) => {
  return Auction.findOneAndUpdate(
    { _id: auctionId, $or: [{ 'bids.0.bid': { $lt: bid.bid } }, { bids: { $eq: [] } }] },
    { $push: { bids: { $each: [bid], $position: 0 } } },
    { new: true })
    .populate('bids.bidder', '_id name')
    .populate('seller', '_id name')
    .exec()
}

export default { placeBid }
