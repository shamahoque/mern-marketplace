import React, {useEffect, useState} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Avatar from '@material-ui/core/Avatar'
import auth from '../auth/auth-helper'
import FileUpload from '@material-ui/icons/AddPhotoAlternate'
import { makeStyles } from '@material-ui/core/styles'
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
  error: {
    verticalAlign: 'middle'
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
  },
  input: {
    display: 'none'
  },
  filename:{
    marginLeft:'10px'
  }
}))

export default function EditShop ({match}) {
  const classes = useStyles()
  const [auction, setAuction] = useState({
    itemName: '',
    description: '',
    image: '',
    bidStart: '',
    bidEnd: '',
    startingBid: 0,
  })
  const [redirect, setRedirect] = useState(false)
  const [error, setError] = useState('')
  const getDateString = (date) => {
    let year = date.getFullYear()
    let day = date.getDate().toString().length == 1 ? '0' + date.getDate() : date.getDate()
    let month = date.getMonth().toString().length == 1 ? '0' + (date.getMonth()+1) : date.getMonth() + 1
    let hours = date.getHours().toString().length == 1 ? '0' + date.getHours() : date.getHours()
    let minutes = date.getMinutes().toString().length == 1 ? '0' + date.getMinutes() : date.getMinutes()
    let dateString = `${year}-${month}-${day}T${hours}:${minutes}`
    return dateString
  }
  const jwt = auth.isAuthenticated()
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
      let auctionData = new FormData()
      auction.itemName && auctionData.append('itemName', auction.itemName)
      auction.description && auctionData.append('description', auction.description)
      auction.image && auctionData.append('image', auction.image)
      auction.startingBid && auctionData.append('startingBid', auction.startingBid)
      auction.bidStart && auctionData.append('bidStart', auction.bidStart)
      auction.bidEnd && auctionData.append('bidEnd', auction.bidEnd)
      
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
  const handleChange = name => event => {
    const value = name === 'image'
      ? event.target.files[0]
      : event.target.value
    setAuction({...auction,  [name]: value })
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
              <input accept="image/*" onChange={handleChange('image')} className={classes.input} id="icon-button-file" type="file" />
              <label htmlFor="icon-button-file">
                <Button variant="contained" color="default" component="span">
                  Change Image
                  <FileUpload/>
                </Button>
              </label> <span className={classes.filename}>{auction.image ? auction.image.name : ''}</span><br/>
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
              {
                error && (<Typography component="p" color="error">
                    <Icon color="error" className={classes.error}>error</Icon>
                    {error}
                  </Typography>)
              }
            </CardContent>
            <CardActions>
              <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Update</Button>
            </CardActions>
          </Card>
    </div>)
}
