import React from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import {useAuth} from './../auth/AuthContext'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import {useFormValues, toFormData} from './../lib/form'
import ImageUpload from './../components/ImageUpload'
import FormError from './../components/FormError'
import {create} from './api-product.js'
import {Link, Redirect} from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle,
    fontSize: '1.2em'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

export default function NewProduct({match}) {
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

  const clickSubmit = () => {
    const productData = toFormData(values, ['name', 'description', 'image', 'category', 'quantity', 'price'])
    create({
      shopId: match.params.shopId
    }, {
      t: jwt.token
    }, productData).then((data) => {
      if (data.error) {
        setValues({...values, error: data.error})
      } else {
        setValues({...values, error: '', redirect: true})
      }
    })
  }

    if (values.redirect) {
      return (<Redirect to={'/seller/shop/edit/'+match.params.shopId}/>)
    }
    return (<div>
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" component="h2" className={classes.title}>
            New Product
          </Typography><br/>
          <ImageUpload label="Upload Photo" color="secondary" file={values.image} onChange={handleChange('image')}/>
          <TextField id="name" label="Name" className={classes.textField} value={values.name} onChange={handleChange('name')} margin="normal"/><br/>
          <TextField
            id="multiline-flexible"
            label="Description"
            multiline
            rows="2"
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
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
          <Link to={'/seller/shop/edit/'+match.params.shopId} className={classes.submit}><Button variant="contained">Cancel</Button></Link>
        </CardActions>
      </Card>
    </div>)
}
