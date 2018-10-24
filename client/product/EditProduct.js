import React, {Component} from 'react'
import auth from './../auth/auth-helper'
import Card, {CardActions, CardContent} from 'material-ui/Card'
import Button from 'material-ui/Button'
import FileUpload from 'material-ui-icons/FileUpload'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'
import Icon from 'material-ui/Icon'
import Avatar from 'material-ui/Avatar'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import {read, update} from './api-product.js'
import {Link, Redirect} from 'react-router-dom'

const styles = theme => ({
  card: {
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 2,
    maxWidth: 500,
    paddingBottom: theme.spacing.unit * 2
  },
  title: {
    margin: theme.spacing.unit * 2,
    color: theme.palette.protectedTitle,
    fontSize: '1.2em'
  },
  error: {
    verticalAlign: 'middle'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing.unit * 2
  },
  bigAvatar: {
    width: 60,
    height: 60,
    margin: 'auto'
  },
  input: {
    display: 'none'
  },
  filename:{
    marginLeft:'10px'
  }
})

class EditProduct extends Component {
  constructor({match}) {
    super()
    this.state = {
      name: '',
      description: '',
      image: '',
      category: '',
      quantity: '',
      price: '',
      redirect: false,
      error: ''
    }
    this.match = match
  }

  componentDidMount = () => {
    this.productData = new FormData()
    read({
      productId: this.match.params.productId
    }).then((data) => {
      if (data.error) {
        this.setState({error: data.error})
      } else {
        this.setState({id: data._id, name: data.name, description: data.description, category: data.category, quantity:data.quantity, price: data.price})
      }
    })
  }
  clickSubmit = () => {
    const jwt = auth.isAuthenticated()
    update({
      shopId: this.match.params.shopId,
      productId: this.match.params.productId
    }, {
      t: jwt.token
    }, this.productData).then((data) => {
      if (data.error) {
        this.setState({error: data.error})
      } else {
        this.setState({'redirect': true})
      }
    })
  }
  handleChange = name => event => {
    const value = name === 'image'
      ? event.target.files[0]
      : event.target.value
    this.productData.set(name, value)
    this.setState({ [name]: value })
  }

  render() {
    const imageUrl = this.state.id
          ? `/api/product/image/${this.state.id}?${new Date().getTime()}`
          : '/api/product/defaultphoto'
    if (this.state.redirect) {
      return (<Redirect to={'/seller/shop/edit/'+this.match.params.shopId}/>)
    }
    const {classes} = this.props
    return (<div>
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" component="h2" className={classes.title}>
            Edit Product
          </Typography><br/>
          <Avatar src={imageUrl} className={classes.bigAvatar}/><br/>
          <input accept="image/*" onChange={this.handleChange('image')} className={classes.input} id="icon-button-file" type="file" />
          <label htmlFor="icon-button-file">
            <Button variant="raised" color="secondary" component="span">
              Change Image
              <FileUpload/>
            </Button>
          </label> <span className={classes.filename}>{this.state.image ? this.state.image.name : ''}</span><br/>
          <TextField id="name" label="Name" className={classes.textField} value={this.state.name} onChange={this.handleChange('name')} margin="normal"/><br/>
          <TextField
            id="multiline-flexible"
            label="Description"
            multiline
            rows="3"
            value={this.state.description}
            onChange={this.handleChange('description')}
            className={classes.textField}
            margin="normal"
          /><br/>
          <TextField id="category" label="Category" className={classes.textField} value={this.state.category} onChange={this.handleChange('category')} margin="normal"/><br/>
          <TextField id="quantity" label="Quantity" className={classes.textField} value={this.state.quantity} onChange={this.handleChange('quantity')} type="number" margin="normal"/><br/>
          <TextField id="price" label="Price" className={classes.textField} value={this.state.price} onChange={this.handleChange('price')} type="number" margin="normal"/><br/>
          {
            this.state.error && (<Typography component="p" color="error">
              <Icon color="error" className={classes.error}>error</Icon>
              {this.state.error}</Typography>)
          }
        </CardContent>
        <CardActions>
          <Button color="primary" variant="raised" onClick={this.clickSubmit} className={classes.submit}>Update</Button>
          <Link to={'/seller/shops/edit/'+this.match.params.shopId} className={classes.submit}><Button variant="raised">Cancel</Button></Link>
        </CardActions>
      </Card>
    </div>)
  }
}

EditProduct.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(EditProduct)
