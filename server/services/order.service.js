import {Order, CartItem} from '../models/order.model'
import Shop from '../models/shop.model'

const create = async (orderData, user) => {
  orderData.user = user
  let order = new Order(orderData)
  return await order.save()
}

const listByShop = shopId => Order.find({"products.shop": shopId})
  .populate({path: 'products.product', select: '_id name price'})
  .sort('-created')
  .exec()

const updateItemStatus = (cartItemId, status, shopId) => Order.updateOne({
  products: { $elemMatch: { _id: cartItemId, shop: shopId } }
}, {
  'products.$.status': status
})

const statusValues = () => CartItem.schema.path('status').enumValues

const getById = id => Order.findById(id).populate('products.product', 'name price').populate('products.shop', 'name').exec()

const listByUser = userId => Order.find({ "user": userId })
  .sort('-created')
  .exec()

const isBuyerOrSeller = async (order, userId) => {
  if (String(order.user) === userId) return true
  const shopIds = order.products.map(item => item.shop && item.shop._id)
  return Boolean(await Shop.exists({ _id: { $in: shopIds }, owner: userId }))
}

export default { create, listByShop, updateItemStatus, statusValues, getById, listByUser, isBuyerOrSeller }
