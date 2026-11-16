import Shop from '../models/shop.model'
import extend from 'lodash/extend'
import { applyImage } from '../helpers/image'

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

const remove = async shop => await shop.remove()

const list = () => Shop.find()

const listByOwner = userId => Shop.find({owner: userId}).populate('owner', '_id name')

export default { create, getById, update, remove, list, listByOwner }
