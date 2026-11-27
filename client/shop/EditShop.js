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
import {useFormValues, toFormData} from './../lib/form'
import ImageUpload from './../components/ImageUpload'
import FormError from './../components/FormError'
import {read, update} from './api-shop.js'
import {Redirect} from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import MyProducts from './../product/MyProducts'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  card: {
    textAlign: 'center',
    paddingBottom: theme.spacing(2)
  },
  title: {
    margin: theme.spacing(2),
    color: theme.palette.protectedTitle,
    fontSize: '1.2em'
  },
  subheading: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle
  },
  textField: textField(theme, 400),
  submit: submitButton(theme),
  bigAvatar
}))

export default function EditShop ({match}) {
  const classes = useStyles()
  const [values, setValues, handleChange] = useFormValues({
      name: '',
      description: '',
      image: '',
      redirect: false,
      error: '',
      id: ''
  })
  const {jwt} = useAuth()
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal
    read({
      shopId: match.params.shopId
    }, signal).then((data) => {
      if (data.error) {
        setValues({...values, error: data.error})
      } else {
        setValues({...values, id: data._id, name: data.name, description: data.description, owner: data.owner.name})
      }
    })
    return function cleanup(){
      abortController.abort()
    }
  }, [])

  const clickSubmit = () => {
    const shopData = toFormData(values, ['name', 'description', 'image'])
    update({
      shopId: match.params.shopId
    }, {
      t: jwt.token
    }, shopData).then((data) => {
      if (data.error) {
        setValues({...values, error: data.error})
      } else {
        setValues({...values, 'redirect': true})
      }
    })
  }

    const logoUrl = values.id
          ? `/api/shops/logo/${values.id}?${new Date().getTime()}`
          : '/api/shops/defaultphoto'
    if (values.redirect) {
      return (<Redirect to={'/seller/shops'}/>)
    }
    return (<div className={classes.root}>
      <Grid container spacing={8}>
        <Grid item xs={6} sm={6}>
          <Card className={classes.card}>
            <CardContent>
              <Typography type="headline" component="h2" className={classes.title}>
                Edit Shop
              </Typography>
              <br/>
              <Avatar src={logoUrl} className={classes.bigAvatar}/><br/>
              <ImageUpload label="Change Logo" color="default" file={values.image} onChange={handleChange('image')}/>
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
              <Typography type="subheading" component="h4" className={classes.subheading}>
                Owner: {values.owner}
              </Typography><br/>
              {values.error && <FormError message={values.error}/>}
            </CardContent>
            <CardActions>
              <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Update</Button>
            </CardActions>
          </Card>
          </Grid>
          <Grid item xs={6} sm={6}>
            <MyProducts shopId={match.params.shopId}/>
          </Grid>
        </Grid>
    </div>)
}
