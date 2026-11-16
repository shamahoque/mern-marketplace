import { requireOwner } from '../middleware/ownership'
import Auction from '../models/auction.model'
import extend from 'lodash/extend'
import errorHandler from '../helpers/dbErrorHandler'
import { applyImage, photoHandler, defaultPhoto, readWithoutImage } from '../helpers/image'

const create = async (req, res) => {
  let auction = new Auction(req.fields)
  auction.seller= req.profile
  applyImage(auction, req.files)
  try {
    let result = await auction.save()
    res.status(200).json(result)
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const auctionByID = async (req, res, next, id) => {
  try {
    let auction = await Auction.findById(id).populate('seller', '_id name').populate('bids.bidder', '_id name').exec()
    if (!auction)
      return res.status('400').json({
        error: "Auction not found"
      })
    req.auction = auction
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve auction"
    })
  }
}

const update = async (req, res) => {
  let auction = req.auction
  auction = extend(auction, req.fields)
  auction.updated = Date.now()
  applyImage(auction, req.files)
  try {
    let result = await auction.save()
    res.json(result)
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let auction = req.auction
    let deletedAuction = await auction.remove()
    res.json(deletedAuction)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }  
}

const listOpen = async (req, res) => {
  try {
    let auctions = await Auction.find({ 'bidEnd': { $gt: new Date() }}).sort('bidStart').populate('seller', '_id name').populate('bids.bidder', '_id name')
    res.json(auctions)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


const listBySeller = async (req, res) => {
  try {
    let auctions = await Auction.find({seller: req.profile._id}).populate('seller', '_id name').populate('bids.bidder', '_id name')
    res.json(auctions)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}
const listByBidder = async (req, res) => {
  try {
    let auctions = await Auction.find({'bids.bidder': req.profile._id}).populate('seller', '_id name').populate('bids.bidder', '_id name')
    res.json(auctions)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


export default {
  create,
  auctionByID,
  photo: photoHandler('auction'),
  defaultPhoto,
  listOpen,
  listBySeller,
  listByBidder,
  read: readWithoutImage('auction'),
  update,
  isSeller: requireOwner('auction', 'seller'),
  remove
}
