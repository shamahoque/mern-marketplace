import request from './../lib/api-client'

const create = (params, credentials, auction) =>
  request('/api/auctions/by/' + params.userId, {method: 'POST', credentials, formData: auction})

const listOpen = (signal) =>
  request('/api/auctions', {signal})

const listBySeller = (params, credentials, signal) =>
  request('/api/auctions/by/' + params.userId, {credentials, signal})

const listByBidder = (params, credentials, signal) =>
  request('/api/auctions/bid/' + params.userId, {credentials, signal})

const read = (params, signal) =>
  request('/api/auction/' + params.auctionId, {signal})

const update = (params, credentials, auction) =>
  request('/api/auctions/' + params.auctionId, {method: 'PUT', credentials, formData: auction})

const remove = (params, credentials) =>
  request('/api/auctions/' + params.auctionId, {method: 'DELETE', credentials})

export {
  create,
  listOpen,
  listBySeller,
  listByBidder,
  read,
  update,
  remove
}
