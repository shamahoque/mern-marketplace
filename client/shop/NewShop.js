import React from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import {useAuth} from './../auth/AuthContext'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import {useFormValues, toFormData} from './../lib/form'
import ImageUpload from './../components/ImageUpload'
import FormError from './../components/FormError'
import {create} from './api-shop.js'
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
    fontSize: '1em'
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

export default function NewShop() {
  const classes = useStyles()
  const [values, setValues, handleChange] = useFormValues({
      name: '',
      description: '',
      image: '',
      redirect: false,
      error: ''
  })
  const {jwt} = useAuth()

  const clickSubmit = () => {
    const shopData = toFormData(values, ['name', 'description', 'image'])
    create({
      userId: jwt.user._id
    }, {
      t: jwt.token
    }, shopData).then((data) => {
      if (data.error) {
        setValues({...values, error: data.error})
      } else {
        setValues({...values, error: '', redirect: true})
      }
    })
  }

    if (values.redirect) {
      return (<Redirect to={'/seller/shops'}/>)
    }
    return (<div>
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" component="h2" className={classes.title}>
            New Shop
          </Typography>
          <br/>
          <ImageUpload label="Upload Logo" color="secondary" file={values.image} onChange={handleChange('image')}/>
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
          /><br/> {values.error && <FormError message={values.error}/>}
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
          <Link to='/seller/shops' className={classes.submit}><Button variant="contained">Cancel</Button></Link>
        </CardActions>
      </Card>
    </div>)
}
