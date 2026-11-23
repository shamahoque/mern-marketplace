import { requireOwner } from '../middleware/ownership'
import auctionService from '../services/auction.service'
import errorHandler from '../helpers/dbErrorHandler'
import { asyncHandler, HttpError } from '../helpers/errors'
import { photoHandler, defaultPhoto, readWithoutImage } from '../helpers/image'

const create = async (req, res) => {
  try {
    let result = await auctionService.create(req.fields, req.profile, req.files)
    res.status(200).json(result)
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const auctionByID = asyncHandler(async (req, res, next, id) => {
  const auction = await auctionService.getById(id)
  if (!auction) throw new HttpError(400, 'Auction not found')
  req.auction = auction
  next()
}, new HttpError(400, 'Could not retrieve auction'))

const update = async (req, res) => {
  try {
    let result = await auctionService.update(req.auction, req.fields, req.files)
    res.json(result)
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let deletedAuction = await auctionService.remove(req.auction)
    res.json(deletedAuction)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }  
}

const listOpen = async (req, res) => {
  try {
    let auctions = await auctionService.listOpen()
    res.json(auctions)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


const listBySeller = async (req, res) => {
  try {
    let auctions = await auctionService.listBySeller(req.profile._id)
    res.json(auctions)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}
const listByBidder = async (req, res) => {
  try {
    let auctions = await auctionService.listByBidder(req.profile._id)
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
