import Shop from '../models/shop.model'
import extend from 'lodash/extend'
import { applyImage } from '../helpers/image'
import productService from './product.service'

const create = async (fields, owner, files) => {
  let shop = new Shop(fields)
  shop.owner = owner
  applyImage(shop, files)
  return await shop.save()
}

const getById = id => Shop.findById(id).populate('owner', '_id name').exec()

const update = async (shop, fields, files) => {
  shop = extend(shop, fields)
  shop.updated = Date.now()
  applyImage(shop, files)
  return await shop.save()
}

const remove = async shop => {
  const deletedShop = await shop.remove()
  await productService.removeByShop(shop._id)
  return deletedShop
}

const list = () => Shop.find()

const listByOwner = userId => Shop.find({owner: userId}).populate('owner', '_id name')

export default { create, getById, update, remove, list, listByOwner }
