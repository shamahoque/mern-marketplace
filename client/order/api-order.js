const create = (params, credentials, order, token) => {
  return fetch('/api/orders/'+params.userId, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      },
      body: JSON.stringify({order: order, token:token})
    })
    .then((response) => {
      return response.json()
    }).catch((err) => console.log(err))
}

const listByShop = (params, credentials) => {
  return fetch('/api/orders/shop/'+params.shopId, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    }
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const update = (params, credentials, product) => {
  return fetch('/api/order/status/' + params.shopId, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    },
    body: JSON.stringify(product)
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const cancelProduct = (params, credentials, product) => {
  return fetch('/api/order/'+params.shopId+'/cancel/'+params.productId, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    },
    body: JSON.stringify(product)
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const processCharge = (params, credentials, product) => {
  return fetch('/api/order/'+params.orderId+'/charge/'+params.userId+'/'+params.shopId, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    },
    body: JSON.stringify(product)
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const getStatusValues = () => {
  return fetch('/api/order/status_values', {
    method: 'GET'
  }).then((response) => {
    return response.json()
  }).catch((err) => console.log(err))
}

const listByUser = (params, credentials) => {
  return fetch('/api/orders/user/'+params.userId, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    }
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const read = (params, credentials) => {
  return fetch('/api/order/' + params.orderId, {
    method: 'GET'
  }).then((response) => {
    return response.json()
  }).catch((err) => console.log(err))
}

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
