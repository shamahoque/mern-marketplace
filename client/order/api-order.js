import request from './../lib/api-client'

const create = (params, credentials, order, token) =>
  request('/api/orders/' + params.userId, {method: 'POST', credentials, json: {order: order, token: token}})

const listByShop = (params, credentials, signal) =>
  request('/api/orders/shop/' + params.shopId, {credentials, signal})

const update = (params, credentials, product) =>
  request('/api/order/status/' + params.shopId, {method: 'PUT', credentials, json: product})

const cancelProduct = (params, credentials, product) =>
  request('/api/order/' + params.shopId + '/cancel/' + params.productId, {method: 'PUT', credentials, json: product})

const processCharge = (params, credentials, product) =>
  request('/api/order/' + params.orderId + '/charge/' + params.userId + '/' + params.shopId, {method: 'PUT', credentials, json: product})

const getStatusValues = (signal) =>
  request('/api/order/status_values', {signal})

const listByUser = (params, credentials, signal) =>
  request('/api/orders/user/' + params.userId, {credentials, signal})

const read = (params, credentials, signal) =>
  request('/api/order/' + params.orderId, {credentials, signal})

export {
  create,
  listByShop,
  update,
  cancelProduct,
  processCharge,
  getStatusValues,
  listByUser,
  read
}
