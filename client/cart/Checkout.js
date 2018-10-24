import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Card from 'material-ui/Card'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'
import Icon from 'material-ui/Icon'
import auth from './../auth/auth-helper'
import cart from './cart-helper.js'
import PlaceOrder from './PlaceOrder'
import {Elements} from 'react-stripe-elements'

const styles = theme => ({
  card: {
    margin: '24px 0px',
    padding: '16px 40px 90px 40px',
    backgroundColor: '#80808017'
  },
  title: {
    margin: '24px 16px 8px 0px',
    color: theme.palette.openTitle
  },
  subheading: {
    color: 'rgba(88, 114, 128, 0.87)',
    marginTop: "20px",
  },
  addressField: {
    marginTop: "4px",
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "45%"
  },
  streetField: {
    marginTop: "4px",
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "93%"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "90%"
  }
})

class Checkout extends Component {
  state = {
    checkoutDetails: {
      customer_name: '',
      customer_email:'',
      delivery_address: { street: '', city: '', state: '', zipcode: '', country:''}
    },
    error: ''
  }
  componentDidMount = () => {
    let user = auth.isAuthenticated().user
    let checkoutDetails = this.state.checkoutDetails
    checkoutDetails.products = cart.getCart()
    checkoutDetails.customer_name = user.name
    checkoutDetails.customer_email = user.email
    this.setState({checkoutDetails: checkoutDetails})
  }

  handleCustomerChange = name => event => {
    let checkoutDetails = this.state.checkoutDetails
    checkoutDetails[name] = event.target.value || undefined
    this.setState({checkoutDetails: checkoutDetails})
  }

  handleAddressChange = name => event => {
    let checkoutDetails = this.state.checkoutDetails
    checkoutDetails.delivery_address[name] = event.target.value || undefined
    this.setState({checkoutDetails: checkoutDetails})
  }

  render() {
    const {classes} = this.props
    return (
      <Card className={classes.card}>
        <Typography type="title" className={classes.title}>
          Checkout
        </Typography>
        <TextField id="name" label="Name" className={classes.textField} value={this.state.checkoutDetails.customer_name} onChange={this.handleCustomerChange('customer_name')} margin="normal"/><br/>
        <TextField id="email" type="email" label="Email" className={classes.textField} value={this.state.checkoutDetails.customer_email} onChange={this.handleCustomerChange('customer_email')} margin="normal"/><br/>
        <Typography type="subheading" component="h3" className={classes.subheading}>
            Delivery Address
        </Typography>
        <TextField id="street" label="Street Address" className={classes.streetField} value={this.state.checkoutDetails.delivery_address.street} onChange={this.handleAddressChange('street')} margin="normal"/><br/>
        <TextField id="city" label="City" className={classes.addressField} value={this.state.checkoutDetails.delivery_address.city} onChange={this.handleAddressChange('city')} margin="normal"/>
        <TextField id="state" label="State" className={classes.addressField} value={this.state.checkoutDetails.delivery_address.state} onChange={this.handleAddressChange('state')} margin="normal"/><br/>
        <TextField id="zipcode" label="Zip Code" className={classes.addressField} value={this.state.checkoutDetails.delivery_address.zipcode} onChange={this.handleAddressChange('zipcode')} margin="normal"/>
        <TextField id="country" label="Country" className={classes.addressField} value={this.state.checkoutDetails.delivery_address.country} onChange={this.handleAddressChange('country')} margin="normal"/>
        <br/> {
            this.state.error && (<Typography component="p" color="error">
                <Icon color="error" className={classes.error}>error</Icon>
                {this.state.error}</Typography>)
          }
        <div>
          <Elements>
            <PlaceOrder checkoutDetails={this.state.checkoutDetails} />
          </Elements>
        </div>
      </Card>)
  }
}

Checkout.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Checkout)
