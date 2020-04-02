import React, {useState, useEffect}  from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import {makeStyles} from '@material-ui/core/styles'
import {read} from './api-auction.js'
import {Link} from 'react-router-dom'
import auth from '../auth/auth-helper'
import Timer from './Timer'
import Bidding from './Bidding'

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    margin: 60,
  },
  flex:{
    display:'flex'
  },
  card: {
    padding:'24px 40px 40px'
  },
  subheading: {
    margin: '16px',
    color: theme.palette.openTitle
  },
  description: {
    margin: '16px',
    fontSize: '0.9em',
    color: '#4f4f4f'
  },
  price: {
    padding: '16px',
    margin: '16px 0px',
    display: 'flex',
    backgroundColor: '#93c5ae3d',
    fontSize: '1.3em',
    color: '#375a53',
  },
  media: {
    height: 300,
    display: 'inline-block',
    width: '100%',
  },
  icon: {
    verticalAlign: 'sub'
  },
  link:{
    color: '#3e4c54b3',
    fontSize: '0.9em'
  },
  itemInfo:{
      width: '35%',
      margin: '16px'
  },
  bidSection: {
      margin: '20px',
      minWidth: '50%'
  },
  lastBid: {
    color: '#303030',
    margin: '16px',
  }
}))

export default function Auction ({match}) {
  const classes = useStyles()
  const [auction, setAuction] = useState({})
  const [error, setError] = useState('')
  const [justEnded, setJustEnded] = useState(false)

    useEffect(() => {
      const abortController = new AbortController()
      const signal = abortController.signal
  
      read({auctionId: match.params.auctionId}, signal).then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setAuction(data)
        }
      })
    return function cleanup(){
      abortController.abort()
    }
  }, [match.params.auctionId])
  const updateBids = (updatedAuction) => {
    setAuction(updatedAuction)
  }
  const update = () => {
    setJustEnded(true)
  }
  const imageUrl = auction._id
          ? `/api/auctions/image/${auction._id}?${new Date().getTime()}`
          : '/api/auctions/defaultphoto'
  const currentDate = new Date()
    return (
        <div className={classes.root}>
              <Card className={classes.card}>
                <CardHeader
                  title={auction.itemName}
                  subheader={<span>
                    {currentDate < new Date(auction.bidStart) && 'Auction Not Started'}
                    {currentDate > new Date(auction.bidStart) && currentDate < new Date(auction.bidEnd) && 'Auction Live'}
                    {currentDate > new Date(auction.bidEnd) && 'Auction Ended'}
                    </span>}
                />
                <Grid container spacing={6}>
                  <Grid item xs={5} sm={5}>
                    <CardMedia
                        className={classes.media}
                        image={imageUrl}
                        title={auction.itemName}
                    />
                    <Typography component="p" variant="subtitle1" className={classes.subheading}>
                    About Item</Typography>
                    <Typography component="p" className={classes.description}>
                    {auction.description}</Typography>
                  </Grid>
                  
                  <Grid item xs={7} sm={7}>
                    {currentDate > new Date(auction.bidStart) 
                    ? (<>
                        <Timer endTime={auction.bidEnd} update={update}/> 
                        { auction.bids.length > 0 &&  
                            <Typography component="p" variant="subtitle1" className={classes.lastBid}>
                                {` Last bid: $ ${auction.bids[0].bid}`}
                            </Typography>
                        }
                        { !auth.isAuthenticated() && <Typography>Please, <Link to='/signin'>sign in</Link> to place your bid.</Typography> }
                        { auth.isAuthenticated() && <Bidding auction={auction} justEnded={justEnded} updateBids={updateBids}/> }
                      </>)
                    : <Typography component="p" variant="h6">{`Auction Starts at ${new Date(auction.bidStart).toLocaleString()}`}</Typography>}
                  </Grid>
           
                </Grid>
                
              </Card>

        </div>)
}
