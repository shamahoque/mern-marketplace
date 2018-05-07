import React, {Component} from 'react'
import Grid from 'material-ui/Grid'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import CartItems from './CartItems'
import {StripeProvider} from 'react-stripe-elements'
import config from './../../config/config'
import Checkout from './Checkout'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  }
})

class Cart extends Component {
  state = {
    checkout: false,
    stripe: null
  }

  componentDidMount = () => {
    if (window.Stripe) {
      this.setState({stripe: window.Stripe(config.stripe_test_api_key)})
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({stripe: window.Stripe(config.stripe_test_api_key)})
      })
    }
  }

  setCheckout = val =>{
    this.setState({checkout: val})
  }

  render() {
    const {classes} = this.props
    return (<div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={6} sm={6}>
          <CartItems checkout={this.state.checkout}
                     setCheckout={this.setCheckout}/>
        </Grid>
        {this.state.checkout &&
          <Grid item xs={6} sm={6}>
            <StripeProvider stripe={this.state.stripe}>
              <Checkout/>
            </StripeProvider>
          </Grid>}
        </Grid>
      </div>)
  }
}

Cart.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Cart)
