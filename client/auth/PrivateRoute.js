import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from './AuthContext'

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { jwt } = useAuth()
  return (
    <Route {...rest} render={props => (
      jwt ? (
        <Component {...props}/>
      ) : (
        <Redirect to={{
          pathname: '/signin',
          state: { from: props.location }
        }}/>
      )
    )}/>
  )
}

export default PrivateRoute
