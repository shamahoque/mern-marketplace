import React from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import {useAuth} from '../auth/AuthContext'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import {useFormValues, toFormData} from './../lib/form'
import ImageUpload from './../components/ImageUpload'
import FormError from './../components/FormError'
import {getDateString} from './auction-time'
import {create} from './api-auction.js'
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

export default function NewAuction() {
  const classes = useStyles()
  const currentDate = new Date()
  const defaultStartTime = getDateString(currentDate)
  const defaultEndTime = getDateString(new Date(currentDate.setHours(currentDate.getHours()+1)))
  
  const [values, setValues, handleChange] = useFormValues({
      itemName: '',
      description: '',
      image: '',
      bidStart: defaultStartTime,
      bidEnd: defaultEndTime,
      startingBid: 0,
      redirect: false,
      error: ''
  })
  const {jwt} = useAuth()

  const clickSubmit = () => {
    if(values.bidEnd < values.bidStart){
      setValues({...values, error: "Auction cannot end before it starts"})
    }
    else{
      const auctionData = toFormData(values, ['itemName', 'description', 'image', 'startingBid', 'bidStart', 'bidEnd'])
      create({
        userId: jwt.user._id
      }, {
        t: jwt.token
      }, auctionData).then((data) => {
        if (data.error) {
          setValues({...values, error: data.error})
        } else {
          setValues({...values, error: '', redirect: true})
        }
      })
    }
  }

    if (values.redirect) {
      return (<Redirect to={'/myauctions'}/>)
    }
    return (<div>
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" component="h2" className={classes.title}>
            New Auction
          </Typography>
          <br/>
          <ImageUpload label="Upload Image" color="secondary" file={values.image} onChange={handleChange('image')}/>
          <TextField id="name" label="Item Name" className={classes.textField} value={values.itemName} onChange={handleChange('itemName')} margin="normal"/><br/>
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
          <TextField id="startingBid" label="Starting Bid ($)" className={classes.textField} value={values.startingBid} onChange={handleChange('startingBid')} margin="normal"/><br/>
          <br/>
          <TextField
            id="datetime-local"
            label="Auction Start Time"
            type="datetime-local"
            defaultValue={defaultStartTime}
            className={classes.textField}
            onChange={handleChange('bidStart')}
            InputLabelProps={{
              shrink: true,
            }}
          /><br/>
          <br/>
          <TextField
            id="datetime-local"
            label="Auction End Time"
            type="datetime-local"
            defaultValue={defaultEndTime}
            className={classes.textField}
            onChange={handleChange('bidEnd')}
            InputLabelProps={{
              shrink: true,
            }}
          /><br/> <br/>
           {values.error && <FormError message={values.error}/>}
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
          <Link to='/myauctions' className={classes.submit}><Button variant="contained">Cancel</Button></Link>
        </CardActions>
      </Card>
    </div>)
}
