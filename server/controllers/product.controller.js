import productService from '../services/product.service'
import errorHandler from './../helpers/dbErrorHandler'
import { asyncHandler, HttpError } from '../helpers/errors'
import { photoHandler, defaultPhoto, readWithoutImage } from '../helpers/image'

const create = async (req, res) => {
  try {
    let result = await productService.create(req.fields, req.shop, req.files)
    res.json(result)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const productByID = asyncHandler(async (req, res, next, id) => {
  const product = await productService.getById(id)
  if (!product) throw new HttpError(400, 'Product not found')
  req.product = product
  next()
}, new HttpError(400, 'Could not retrieve product'))

const productBelongsToShop = (req, res, next) => {
  if (String(req.product.shop._id) !== String(req.shop._id)) {
    return next(new HttpError(403, 'User is not authorized'))
  }
  next()
}

const update = async (req, res) => {
  try {
    let result = await productService.update(req.product, req.fields, req.files)
    res.json(result)
  }catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try{
    let deletedProduct = await productService.remove(req.product)
    res.json(deletedProduct)
  
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByShop = async (req, res) => {
  try {
    let products = await productService.listByShop(req.shop._id)
    res.json(products)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listLatest = async (req, res) => {
  try {
    let products = await productService.listLatest()
    res.json(products)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listRelated = async (req, res) => {
  try{
    let products = await productService.listRelated(req.product)
    res.json(products)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listCategories = async (req, res) => {
  try {
    let products = await productService.listCategories()
    res.json(products)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {
  try {
    let products = await productService.search(req.query)
    res.json(products)
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const decreaseQuantity = asyncHandler(async (req, res, next) => {
  await productService.decreaseStock(req.body.order.products)
  next()
}, new HttpError(400, 'Could not update product'))

const increaseQuantity = async (req, res, next) => {
  try {
    await productService.increaseStock(req.product._id, req.body.quantity)
      next()
  } catch (err){
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  productByID,
  productBelongsToShop,
  photo: photoHandler('product'),
  defaultPhoto,
  read: readWithoutImage('product'),
  update,
  remove,
  listByShop,
  listLatest,
  listRelated,
  listCategories,
  list,
  decreaseQuantity,
  increaseQuantity
}
