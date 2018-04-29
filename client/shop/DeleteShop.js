import React, {Component} from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'
import DeleteIcon from 'material-ui-icons/Delete'
import Dialog, {DialogActions, DialogContent, DialogContentText, DialogTitle} from 'material-ui/Dialog'
import auth from './../auth/auth-helper'
import {remove} from './api-shop.js'

class DeleteShop extends Component {
  state = {
    open: false
  }
  clickButton = () => {
    this.setState({open: true})
  }
  deleteShop = () => {
    const jwt = auth.isAuthenticated()
    remove({
      shopId: this.props.shop._id
    }, {t: jwt.token}).then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        this.setState({open: false}, () => {
          this.props.onRemove(this.props.shop)
        })
      }
    })
  }
  handleRequestClose = () => {
    this.setState({open: false})
  }
  render() {
    return (<span>
      <IconButton aria-label="Delete" onClick={this.clickButton} color="secondary">
        <DeleteIcon/>
      </IconButton>

      <Dialog open={this.state.open} onClose={this.handleRequestClose}>
        <DialogTitle>{"Delete "+this.props.shop.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirm to delete your shop {this.props.shop.name}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleRequestClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.deleteShop} color="secondary" autoFocus="autoFocus">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </span>)
  }
}
DeleteShop.propTypes = {
  shop: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired
}
export default DeleteShop
