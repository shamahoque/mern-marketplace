// Persists auction data independently of the transport layer.
import Auction from '../models/auction.model'
import extend from 'lodash/extend'
import { applyImage } from '../helpers/image'

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

const create = async (fields, seller, files) => {
  let auction = new Auction(fields)
  auction.seller = seller
  applyImage(auction, files)
  return await auction.save()
}

const getById = id => Auction.findById(id).populate('seller', '_id name').populate('bids.bidder', '_id name').exec()

const update = async (auction, fields, files) => {
  auction = extend(auction, fields)
  auction.updated = Date.now()
  applyImage(auction, files)
  return await auction.save()
}

const remove = async auction => await auction.remove()

const listOpen = () => Auction.find({ 'bidEnd': { $gt: new Date() }}).sort('bidStart').populate('seller', '_id name').populate('bids.bidder', '_id name')

const listBySeller = userId => Auction.find({seller: userId}).populate('seller', '_id name').populate('bids.bidder', '_id name')

const listByBidder = userId => Auction.find({'bids.bidder': userId}).populate('seller', '_id name').populate('bids.bidder', '_id name')

export default { placeBid, create, getById, update, remove, listOpen, listBySeller, listByBidder }
