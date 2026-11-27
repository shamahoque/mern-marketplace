import queryString from 'query-string'
import request from './../lib/api-client'

const create = (params, credentials, product) =>
  request('/api/products/by/' + params.shopId, {method: 'POST', credentials, formData: product})

const read = (params, signal) =>
  request('/api/products/' + params.productId, {signal})

const update = (params, credentials, product) =>
  request('/api/product/' + params.shopId + '/' + params.productId, {method: 'PUT', credentials, formData: product})

const remove = (params, credentials) =>
  request('/api/product/' + params.shopId + '/' + params.productId, {method: 'DELETE', credentials})

const listByShop = (params, signal) =>
  request('/api/products/by/' + params.shopId, {signal})

const listLatest = (signal) =>
  request('/api/products/latest', {signal})

const listRelated = (params, signal) =>
  request('/api/products/related/' + params.productId, {signal})

const listCategories = (signal) =>
  request('/api/products/categories', {signal})

const list = (params, signal) =>
  request('/api/products?' + queryString.stringify(params), {signal})

export {
  create,
  read,
  update,
  remove,
  listByShop,
  listLatest,
  listRelated,
  listCategories,
  list
}
