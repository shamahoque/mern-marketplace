import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import Icon from 'material-ui/Icon'
import auth from './../auth/auth-helper'
import cart from './cart-helper.js'
import {CardElement, injectStripe} from 'react-stripe-elements'
import {create} from './../order/api-order.js'
import {Redirect} from 'react-router-dom'

const styles = theme => ({
  subheading: {
    color: 'rgba(88, 114, 128, 0.87)',
    marginTop: "20px",
  },
  checkout: {
    float: 'right',
    margin: '20px 30px'
  },
  error: {
    display: 'inline',
    padding: "0px 10px"
  },
  errorIcon: {
    verticalAlign: 'middle'
  },
  StripeElement: {
    display: 'block',
    margin: '24px 0 10px 10px',
    maxWidth: '408px',
    padding: '10px 14px',
    boxShadow: 'rgba(50, 50, 93, 0.14902) 0px 1px 3px, rgba(0, 0, 0, 0.0196078) 0px 1px 0px',
    borderRadius: '4px',
    background: 'white'
  }
})

class PlaceOrder extends Component {
  state = {
    order: {},
    error: '',
    redirect: false
  }

  placeOrder = ()=>{
    this.props.stripe.createToken().then(payload => {
      if(payload.error){
        this.setState({error: payload.error.message})
      }else{
        const jwt = auth.isAuthenticated()
        create({userId:jwt.user._id}, {
          t: jwt.token
        }, this.props.checkoutDetails, payload.token.id).then((data) => {
          if (data.error) {
            this.setState({error: data.error})
          } else {
            cart.emptyCart(()=> {
              this.setState({'orderId':data._id,'redirect': true})
            })
          }
        })
      }
  })
}

render() {
    const {classes} = this.props
    if (this.state.redirect) {
      return (<Redirect to={'/order/' + this.state.orderId}/>)
    }
    return (
    <span>
      <Typography type="subheading" component="h3" className={classes.subheading}>
        Card details
      </Typography>
      <CardElement
        className={classes.StripeElement}
          {...{style: {
                        base: {
                          color: '#424770',
                          letterSpacing: '0.025em',
                          fontFamily: 'Source Code Pro, Menlo, monospace',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      }
          }}
      />
      <div className={classes.checkout}>
        { this.state.error &&
          (<Typography component="span" color="error" className={classes.error}>
            <Icon color="error" className={classes.errorIcon}>error</Icon>
              {this.state.error}
          </Typography>)
        }
        <Button color="secondary" variant="raised" onClick={this.placeOrder}>Place Order</Button>
      </div>
    </span>)
  }
}
PlaceOrder.propTypes = {
  classes: PropTypes.object.isRequired,
  checkoutDetails: PropTypes.object.isRequired
}

export default injectStripe(withStyles(styles)(PlaceOrder))
