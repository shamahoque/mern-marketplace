import request from './../lib/api-client'

const create = (params, credentials, shop) =>
  request('/api/shops/by/' + params.userId, {method: 'POST', credentials, formData: shop})

const list = (signal) =>
  request('/api/shops', {signal})

const listByOwner = (params, credentials, signal) =>
  request('/api/shops/by/' + params.userId, {credentials, signal})

const read = (params, signal) =>
  request('/api/shop/' + params.shopId, {signal})

const update = (params, credentials, shop) =>
  request('/api/shops/' + params.shopId, {method: 'PUT', credentials, formData: shop})

const remove = (params, credentials) =>
  request('/api/shops/' + params.shopId, {method: 'DELETE', credentials})

export {
  create,
  list,
  listByOwner,
  read,
  update,
  remove
}
