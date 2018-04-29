import React, {Component} from 'react'
import auth from './../auth/auth-helper'
import Card, {CardActions, CardContent, CardMedia} from 'material-ui/Card'
import Button from 'material-ui/Button'
import FileUpload from 'material-ui-icons/FileUpload'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'
import Icon from 'material-ui/Icon'
import Avatar from 'material-ui/Avatar'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import {read, update} from './api-shop.js'
import {Redirect} from 'react-router-dom'
import Grid from 'material-ui/Grid'
import MyProducts from './../product/MyProducts'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  card: {
    textAlign: 'center',
    paddingBottom: theme.spacing.unit * 2
  },
  title: {
    margin: theme.spacing.unit * 2,
    color: theme.palette.protectedTitle,
    fontSize: '1.2em'
  },
  subheading: {
    marginTop: theme.spacing.unit * 2,
    color: theme.palette.openTitle
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

class EditShop extends Component {
  constructor({match}) {
    super()
    this.state = {
      name: '',
      description: '',
      image: '',
      redirect: false,
      error: ''
    }
    this.match = match
  }

  componentDidMount = () => {
    this.shopData = new FormData()
    const jwt = auth.isAuthenticated()
    read({
      shopId: this.match.params.shopId
    }, {t: jwt.token}).then((data) => {
      if (data.error) {
        this.setState({error: data.error})
      } else {
        this.setState({id: data._id, name: data.name, description: data.description, owner: data.owner.name})
      }
    })
  }
  clickSubmit = () => {
    const jwt = auth.isAuthenticated()
    update({
      shopId: this.match.params.shopId
    }, {
      t: jwt.token
    }, this.shopData).then((data) => {
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
    this.shopData.set(name, value)
    this.setState({ [name]: value })
  }

  render() {
    const logoUrl = this.state.id
          ? `/api/shops/logo/${this.state.id}?${new Date().getTime()}`
          : '/api/shops/defaultphoto'
    if (this.state.redirect) {
      return (<Redirect to={'/seller/shops'}/>)
    }
    const {classes} = this.props
    return (<div className={classes.root}>
      <Grid container spacing={24}>
        <Grid item xs={6} sm={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography type="headline" component="h2" className={classes.title}>
                Edit Shop
              </Typography>
              <br/>
              <Avatar src={logoUrl} className={classes.bigAvatar}/><br/>
              <input accept="image/*" onChange={this.handleChange('image')} className={classes.input} id="icon-button-file" type="file" />
              <label htmlFor="icon-button-file">
                <Button variant="raised" color="default" component="span">
                  Change Logo
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
              <Typography type="subheading" component="h4" className={classes.subheading}>
                Owner: {this.state.owner}
              </Typography><br/>
              {
                this.state.error && (<Typography component="p" color="error">
                    <Icon color="error" className={classes.error}>error</Icon>
                    {this.state.error}
                  </Typography>)
              }
            </CardContent>
            <CardActions>
              <Button color="primary" variant="raised" onClick={this.clickSubmit} className={classes.submit}>Update</Button>
            </CardActions>
          </Card>
          </Grid>
          <Grid item xs={6} sm={6}>
            <MyProducts shopId={this.match.params.shopId}/>
          </Grid>
        </Grid>
    </div>)
  }
}

EditShop.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(EditShop)
