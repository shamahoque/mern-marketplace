import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import Button from '@material-ui/core/Button'
import {useAuth} from './../auth/AuthContext'
import {Link, withRouter} from 'react-router-dom'
import CartIcon from '@material-ui/icons/ShoppingCart'
import Badge from '@material-ui/core/Badge'
import cart from './../cart/cart-helper'
import {useTheme} from '@material-ui/core/styles'

const Menu = withRouter(({history}) => {
  const {jwt, signout} = useAuth()
  // Link colours come from the theme (D-13); one rule now covers both checks.
  const {navigation} = useTheme().palette
  const linkColor = active => ({color: active ? navigation.active : navigation.inactive})
  const isActive = (history, path) => linkColor(history.location.pathname == path)
  const isPartActive = (history, path) => linkColor(history.location.pathname.includes(path))
  return (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        MERN Marketplace
      </Typography>
      <div>
        <Link to="/">
          <IconButton aria-label="Home" style={isActive(history, "/")}>
            <HomeIcon/>
          </IconButton>
        </Link>
        <Link to="/shops/all">
          <Button style={isActive(history, "/shops/all")}>All Shops</Button>
        </Link>
        <Link to="/auctions/all">
          <Button style={isActive(history, "/auctions/all")}>All Auctions</Button>
        </Link>
        <Link to="/cart">
          <Button style={isActive(history, "/cart")}>
            Cart
            <Badge invisible={false} color="secondary" badgeContent={cart.itemTotal()} style={{'marginLeft': '7px'}}>
              <CartIcon />
            </Badge>
          </Button>
        </Link>      
      </div>
      <div style={{'position':'absolute', 'right': '10px'}}><span style={{'float': 'right'}}>
      {
        !jwt && (<span>
          <Link to="/signup">
            <Button style={isActive(history, "/signup")}>Sign up
            </Button>
          </Link>
          <Link to="/signin">
            <Button style={isActive(history, "/signin")}>Sign In
            </Button>
          </Link>
        </span>)
      }
      {
        jwt && (<span>
          {jwt.user.seller && (<>
            <Link to="/seller/shops"><Button style={isPartActive(history, "/seller/")}>My Shops</Button></Link>
            <Link to="/myauctions"><Button style={isPartActive(history, "/myauctions")}>My Auctions</Button></Link>
            </>
          )}
          <Link to={"/user/" + jwt.user._id}>
            <Button style={isActive(history, "/user/" + jwt.user._id)}>My Profile</Button>
          </Link>
          <Button color="inherit" onClick={() => {
              signout(() => history.push('/'))
            }}>Sign out</Button>
        </span>)
      }
      </span></div>
    </Toolbar>
  </AppBar>
  )
})

export default Menu
