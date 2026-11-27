import React, {useEffect, useState} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import {useAuth} from '../auth/AuthContext'
import { makeStyles } from '@material-ui/core/styles'
import {useFormValues, toFormData} from './../lib/form'
import ImageUpload from './../components/ImageUpload'
import FormError from './../components/FormError'
import {getDateString} from './auction-time'
import {read, update} from './api-auction.js'
import {Redirect} from 'react-router-dom'

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
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 400
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  },
  bigAvatar: {
    width: 60,
    height: 60,
    margin: 'auto'
  }
}))

export default function EditAuction ({match}) {
  const classes = useStyles()
  const [auction, setAuction, handleChange] = useFormValues({
    itemName: '',
    description: '',
    image: '',
    bidStart: '',
    bidEnd: '',
    startingBid: 0,
  })
  const [redirect, setRedirect] = useState(false)
  const [error, setError] = useState('')
  const {jwt} = useAuth()
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal
    read({
      auctionId: match.params.auctionId
    }, signal).then((data) => {
      if (data.error) {
        setError(data.error)
      } else {
        data.bidEnd = getDateString(new Date(data.bidEnd))
        data.bidStart = getDateString(new Date(data.bidStart))
        setAuction(data)
      }
    })
    return function cleanup(){
      abortController.abort()
    }
  }, [])

  const clickSubmit = () => {
    if(auction.bidEnd < auction.bidStart){
      setError("Auction cannot end before it starts")
    }else{
      const auctionData = toFormData(auction, ['itemName', 'description', 'image', 'startingBid', 'bidStart', 'bidEnd'])
      update({
        auctionId: match.params.auctionId
      }, {
        t: jwt.token
      }, auctionData).then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setRedirect(true)
        }
      })
    }
  }

    const logoUrl = auction._id
          ? `/api/auctions/image/${auction._id}?${new Date().getTime()}`
          : '/api/auctions/defaultphoto'
    if (redirect) {
      return (<Redirect to={'/myauctions'}/>)
    }
    return (<div className={classes.root}>
          <Card className={classes.card}>
            <CardContent>
              <Typography type="headline" component="h2" className={classes.title}>
                Edit Auction
              </Typography>
              <br/>
              <Avatar src={logoUrl} className={classes.bigAvatar}/><br/>
              <ImageUpload label="Change Image" color="default" file={auction.image} onChange={handleChange('image')}/>
              <TextField id="name" label="Name" className={classes.textField} value={auction.itemName} onChange={handleChange('itemName')} margin="normal"/><br/>
              <TextField
                id="multiline-flexible"
                label="Description"
                multiline
                rows="3"
                value={auction.description}
                onChange={handleChange('description')}
                className={classes.textField}
                margin="normal"
              /><br/>
              <TextField id="startingBid" label="Starting Bid ($)" className={classes.textField} value={auction.startingBid} onChange={handleChange('startingBid')} margin="normal"/><br/>
              <br/>
              <TextField
                id="datetime-local"
                label="Auction Start Time"
                type="datetime-local"
                value={auction.bidStart}
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
                value={auction.bidEnd}
                className={classes.textField}
                onChange={handleChange('bidEnd')}
                InputLabelProps={{
                  shrink: true,
                }}
              /><br/> <br/>
              {error && <FormError message={error}/>}
            </CardContent>
            <CardActions>
              <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Update</Button>
            </CardActions>
          </Card>
    </div>)
}
