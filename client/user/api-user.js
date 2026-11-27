import request from './../lib/api-client'

const create = (user) =>
  request('/api/users/', {method: 'POST', json: user})

const list = (credentials, signal) =>
  request('/api/users/', {credentials, signal})

const read = (params, credentials, signal) =>
  request('/api/users/' + params.userId, {credentials, signal})

const update = (params, credentials, user) =>
  request('/api/users/' + params.userId, {method: 'PUT', credentials, json: user})

const remove = (params, credentials) =>
  request('/api/users/' + params.userId, {method: 'DELETE', credentials})

const stripeUpdate = (params, credentials, auth_code, signal) =>
  request('/api/stripe_auth/' + params.userId, {method: 'PUT', credentials, json: {stripe: auth_code}, signal})

export {
  create,
  list,
  read,
  update,
  remove,
  stripeUpdate
}
