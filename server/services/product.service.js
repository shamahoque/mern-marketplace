import Product from '../models/product.model'
import extend from 'lodash/extend'
import { applyImage } from '../helpers/image'

const create = async (fields, shop, files) => {
  let product = new Product(fields)
  product.shop = shop
  applyImage(product, files)
  return await product.save()
}

const getById = id => Product.findById(id).populate('shop', '_id name').exec()

const update = async (product, fields, files) => {
  product = extend(product, fields)
  product.updated = Date.now()
  applyImage(product, files)
  return await product.save()
}

const remove = async product => await product.remove()

const listByShop = shopId => Product.find({shop: shopId}).populate('shop', '_id name').select('-image')

const listLatest = () => Product.find({}).sort('-created').limit(5).populate('shop', '_id name').exec()

const listRelated = product => Product.find({ "_id": { "$ne": product }, "category": product.category}).limit(5).populate('shop', '_id name').exec()

const listCategories = () => Product.distinct('category',{})

const search = ({ search, category }) => {
  const query = {}
  if(search)
    query.name = {'$regex': search, '$options': "i"}
  if(category && category != 'All')
    query.category = category
  return Product.find(query).populate('shop', '_id name').select('-image').exec()
}

const decreaseStock = orderProducts => {
  let bulkOps = orderProducts.map((item) => {
    return {
      "updateOne": {
        "filter": { "_id": item.product._id },
        "update": { "$inc": {"quantity": -item.quantity} }
      }
    }
  })
  return Product.bulkWrite(bulkOps, {})
}

const increaseStock = (productId, quantity) => Product.findByIdAndUpdate(productId, {$inc: {"quantity": quantity}}, {new: true}).exec()

export default {
  create,
  getById,
  update,
  remove,
  listByShop,
  listLatest,
  listRelated,
  listCategories,
  search,
  decreaseStock,
  increaseStock
}
