import queryString from 'query-string'
const create = (params, credentials, product) => {
  return fetch('/api/products/by/'+ params.shopId, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      },
      body: product
    })
    .then((response) => {
      return response.json()
    }).catch((err) => console.log(err))
}

const read = (params) => {
  return fetch('/api/products/' + params.productId, {
    method: 'GET'
  }).then((response) => {
    return response.json()
  }).catch((err) => console.log(err))
}

const update = (params, credentials, product) => {
  return fetch('/api/product/' + params.shopId +'/'+params.productId, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    },
    body: product
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const remove = (params, credentials) => {
  return fetch('/api/product/' + params.shopId +'/'+params.productId, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + credentials.t
    }
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const listByShop = (params) => {
  return fetch('/api/products/by/'+params.shopId, {
    method: 'GET'
  }).then((response) => {
    return response.json()
  }).catch((err) => {
    console.log(err)
  })
}

const listLatest = () => {
  return fetch('/api/products/latest', {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).catch((err) => console.log(err))
}

const listRelated = (params) => {
  return fetch('/api/products/related/'+params.productId, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).catch((err) => console.log(err))
}

const listCategories = () => {
  return fetch('/api/products/categories', {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).catch((err) => console.log(err))
}

const list = (params) => {
  const query = queryString.stringify(params)
  return fetch('/api/products?'+query, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).catch((err) => console.log(err))
}

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
