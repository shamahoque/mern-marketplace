import { signout } from './api-auth.js'
import { session } from './../lib/storage'

const JWT = 'jwt'

const auth = {
  // The stored {token, user}, or false when nobody is signed in.
  isAuthenticated() {
    return session.read(JWT, false)
  },
  authenticate(jwt, cb) {
    session.write(JWT, jwt)
    cb()
  },
  clearJWT(cb) {
    session.remove(JWT)
    cb()
    //optional
    signout().then((data) => {
      document.cookie = "t=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    })
  },
  updateUser(user, cb) {
    const jwt = session.read(JWT, false)
    if (jwt) {
      jwt.user = user
      session.write(JWT, jwt)
      cb()
    }
  }
}

export default auth
