import { requireOwner } from '../middleware/ownership'
import shopService from '../services/shop.service'
import errorHandler from './../helpers/dbErrorHandler'
import { asyncHandler, HttpError } from '../helpers/errors'
import { photoHandler, defaultPhoto, readWithoutImage } from '../helpers/image'

const create = async (req, res) => {
  try {
    let result = await shopService.create(req.fields, req.profile, req.files)
    res.status(200).json(result)
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const shopByID = asyncHandler(async (req, res, next, id) => {
  const shop = await shopService.getById(id)
  if (!shop) throw new HttpError(400, 'Shop not found')
  req.shop = shop
  next()
}, new HttpError(400, 'Could not retrieve shop'))

const update = async (req, res) => {
  try {
    let result = await shopService.update(req.shop, req.fields, req.files)
    res.json(result)
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let deletedShop = await shopService.remove(req.shop)
    res.json(deletedShop)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }  
}

const list = async (req, res) => {
  try {
    let shops = await shopService.list()
    res.json(shops)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByOwner = async (req, res) => {
  try {
    let shops = await shopService.listByOwner(req.profile._id)
    res.json(shops)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


export default {
  create,
  shopByID,
  photo: photoHandler('shop'),
  defaultPhoto,
  list,
  listByOwner,
  read: readWithoutImage('shop'),
  update,
  isOwner: requireOwner('shop', 'owner'),
  remove
}
