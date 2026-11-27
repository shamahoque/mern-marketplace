import request from './../lib/api-client'

const signin = (user) =>
  request('/auth/signin/', {method: 'POST', json: user, withCookies: true})

const signout = () =>
  request('/auth/signout/')

export {
  signin,
  signout
}
