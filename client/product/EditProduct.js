import React, {useEffect} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import {useAuth} from './../auth/AuthContext'
import { makeStyles } from '@material-ui/core/styles'
import {submitButton, textField, bigAvatar} from './../styles/form-styles'
import {read, update} from './api-product.js'
import {useFormValues, toFormData} from './../lib/form'
import ImageUpload from './../components/ImageUpload'
import FormError from './../components/FormError'
import {Link, Redirect} from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  card: {
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    maxWidth: 500,
    paddingBottom: theme.spacing(2)
  },
  title: {
    margin: theme.spacing(2),
    color: theme.palette.protectedTitle,
    fontSize: '1.2em'
  },
  textField: textField(theme, 400),
  submit: submitButton(theme),
  bigAvatar
}))

export default function EditProduct ({match}) {
  const classes = useStyles()
  const [values, setValues, handleChange] = useFormValues({
      name: '',
      description: '',
      image: '',
      category: '',
      quantity: '',
      price: '',
      redirect: false,
      error: ''
    })

    const {jwt} = useAuth()
    useEffect(() => {
      const abortController = new AbortController()
      const signal = abortController.signal
      read({
        productId: match.params.productId
      }, signal).then((data) => {
        if (data.error) {
          setValues({...values, error: data.error})
        } else {
          setValues({...values, id: data._id, name: data.name, description: data.description, category: data.category, quantity:data.quantity, price: data.price})
        }
      })
    return function cleanup(){
      abortController.abort()
    }
  }, [])
  const clickSubmit = () => {
    const productData = toFormData(values, ['name', 'description', 'image', 'category', 'quantity', 'price'])
    update({
      shopId: match.params.shopId,
      productId: match.params.productId
    }, {
      t: jwt.token
    }, productData).then((data) => {
      if (data.error) {
        setValues({...values, error: data.error})
      } else {
        setValues({...values, 'redirect': true})
      }
    })
  }
    const imageUrl = values.id
          ? `/api/product/image/${values.id}?${new Date().getTime()}`
          : '/api/product/defaultphoto'
    if (values.redirect) {
      return (<Redirect to={'/seller/shop/edit/'+match.params.shopId}/>)
    }
    return (<div>
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" component="h2" className={classes.title}>
            Edit Product
          </Typography><br/>
          <Avatar src={imageUrl} className={classes.bigAvatar}/><br/>
          <ImageUpload label="Change Image" color="secondary" file={values.image} onChange={handleChange('image')}/>
          <TextField id="name" label="Name" className={classes.textField} value={values.name} onChange={handleChange('name')} margin="normal"/><br/>
          <TextField
            id="multiline-flexible"
            label="Description"
            multiline
            rows="3"
            value={values.description}
            onChange={handleChange('description')}
            className={classes.textField}
            margin="normal"
          /><br/>
          <TextField id="category" label="Category" className={classes.textField} value={values.category} onChange={handleChange('category')} margin="normal"/><br/>
          <TextField id="quantity" label="Quantity" className={classes.textField} value={values.quantity} onChange={handleChange('quantity')} type="number" margin="normal"/><br/>
          <TextField id="price" label="Price" className={classes.textField} value={values.price} onChange={handleChange('price')} type="number" margin="normal"/><br/>
          {values.error && <FormError message={values.error}/>}
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Update</Button>
          <Link to={'/seller/shops/edit/'+match.params.shopId} className={classes.submit}><Button variant="contained">Cancel</Button></Link>
        </CardActions>
      </Card>
    </div>)
}
