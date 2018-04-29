import React, {Component} from 'react'
import {withStyles} from 'material-ui/styles'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import AddCartIcon from 'material-ui-icons/AddShoppingCart'
import DisabledCartIcon from 'material-ui-icons/RemoveShoppingCart'
import cart from './cart-helper.js'
import { Redirect } from 'react-router-dom'

const styles = theme => ({
  iconButton: {
    width: '28px',
    height: '28px'
  },
  disabledIconButton: {
    color: '#7f7563',
    width: '28px',
    height: '28px'
  }
})

class AddToCart extends Component {
  state = {
    redirect: false
  }
  addToCart = () => {
    cart.addItem(this.props.item, () => {
      this.setState({redirect:true})
    })
  }
  render() {
    if (this.state.redirect) {
      return (<Redirect to={'/cart'}/>)
    }
    const {classes} = this.props
    return (<span>
      {this.props.item.quantity >= 0 ?
        <IconButton color="secondary" dense="dense" onClick={this.addToCart}>
          <AddCartIcon className={this.props.cartStyle || classes.iconButton}/>
        </IconButton> :
        <IconButton disabled={true} color="secondary" dense="dense">
          <DisabledCartIcon className={this.props.cartStyle || classes.disabledIconButton}/>
        </IconButton>}
      </span>)
  }
}

AddToCart.propTypes = {
  classes: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  cartStyle: PropTypes.string
}

export default withStyles(styles)(AddToCart)
