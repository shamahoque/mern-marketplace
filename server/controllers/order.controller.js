import {Order, CartItem} from '../models/order.model'
import Shop from '../models/shop.model'
import errorHandler from './../helpers/dbErrorHandler'
import { asyncHandler, HttpError } from '../helpers/errors'

const create = async (req, res) => {
  try {
    req.body.order.user = req.profile
    let order = new Order(req.body.order)
    let result = await order.save()
    res.status(200).json(result)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByShop = async (req, res) => {
  try {
    let orders = await Order.find({"products.shop": req.shop._id})
      .populate({path: 'products.product', select: '_id name price'})
      .sort('-created')
      .exec()
    res.json(orders)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let order = await Order.updateOne({'products._id':req.body.cartItemId}, {
        'products.$.status': req.body.status
    })
      res.json(order)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const getStatusValues = (req, res) => {
  res.json(CartItem.schema.path('status').enumValues)
}

const orderByID = async (req, res, next, id) => {
  try {
    let order = await Order.findById(id).populate('products.product', 'name price').populate('products.shop', 'name').exec()
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
    let orders = await Order.find({ "user": req.profile._id })
        .sort('-created')
        .exec()
    res.json(orders)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

// D-08: only the buyer, or a seller owning a shop in the order, may read it.
const isBuyerOrSeller = asyncHandler(async (req, res, next) => {
  if (String(req.order.user) === req.auth._id) return next()
  const shopIds = req.order.products.map(item => item.shop && item.shop._id)
  if (await Shop.exists({ _id: { $in: shopIds }, owner: req.auth._id })) return next()
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
