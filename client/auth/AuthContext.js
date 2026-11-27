// One shared source of "who is signed in" for the whole client (D-11).
// Before this, 21 components read sessionStorage directly through
// auth.isAuthenticated(), 34 times in total, and the Menu only noticed a
// sign-in or sign-out because it happened to re-render on navigation.
// Components now call useAuth() and re-render whenever the signed-in user changes.
import React, {createContext, useContext, useState} from 'react'
import auth from './auth-helper'

const AuthContext = createContext(null)

export function AuthProvider({children}) {
  // false when nobody is signed in, otherwise {token, user}. During server-side
  // rendering there is no sessionStorage, so this starts as false, as before.
  const [jwt, setJwt] = useState(() => auth.isAuthenticated())

  const value = {
    jwt,
    signin: (data, cb) => auth.authenticate(data, () => {
      setJwt(auth.isAuthenticated())
      cb()
    }),
    signout: (cb) => auth.clearJWT(() => {
      setJwt(false)
      cb()
    }),
    updateUser: (user, cb) => auth.updateUser(user, () => {
      setJwt(auth.isAuthenticated())
      cb()
    })
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth() must be used inside <AuthProvider>')
  return context
}
