import orderService from '../services/order.service'
import errorHandler from './../helpers/dbErrorHandler'
import { asyncHandler, HttpError } from '../helpers/errors'

const create = async (req, res) => {
  try {
    let result = await orderService.create(req.body.order, req.profile)
    res.status(200).json(result)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByShop = async (req, res) => {
  try {
    let orders = await orderService.listByShop(req.shop._id)
    res.json(orders)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let order = await orderService.updateItemStatus(req.body.cartItemId, req.body.status)
      res.json(order)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const getStatusValues = (req, res) => {
  res.json(orderService.statusValues())
}

const orderByID = async (req, res, next, id) => {
  try {
    let order = await orderService.getById(id)
    if (!order)
      return res.status('400').json({
        error: "Order not found"
      })
    req.order = order
    next()
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByUser = async (req, res) => {
  try{
    let orders = await orderService.listByUser(req.profile._id)
    res.json(orders)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

// D-08: only the buyer, or a seller owning a shop in the order, may read it.
const isBuyerOrSeller = asyncHandler(async (req, res, next) => {
  if (await orderService.isBuyerOrSeller(req.order, req.auth._id)) return next()
  throw new HttpError(403, 'User is not authorized')
})

const read = (req, res) => {
  return res.json(req.order)
}

export default {
  isBuyerOrSeller,
  create,
  listByShop,
  update,
  getStatusValues,
  orderByID,
  listByUser,
  read
}
