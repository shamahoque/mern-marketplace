import React from 'react'
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import {Link} from 'react-router-dom'
import ViewIcon from '@material-ui/icons/Visibility'
import Icon from '@material-ui/core/Icon'
import Divider from '@material-ui/core/Divider'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import AddToCart from './../cart/AddToCart'

const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    padding: theme.spacing(1),
    paddingBottom: 24,
    backgroundColor: '#80808024'
  }),
  title: {
    margin: `${theme.spacing(4)}px 0 ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
    fontSize: '1.1em'
  },
  viewButton: {
    verticalAlign: 'middle'
  },
  card: {
    width: '100%',
    display: 'inline-flex'
  },
  details: {
    display: 'inline-block',
    width: "100%"
  },
  content: {
    flex: '1 0 auto',
    padding: '16px 8px 0px'
  },
  cover: {
    width: '65%',
    height: 130,
    margin: '8px'
  },
  controls: {
    marginTop: '8px'
  },
  date: {
    color: 'rgba(0, 0, 0, 0.4)'
  },
  icon: {
    verticalAlign: 'sub'
  },
  iconButton: {
    width: '28px',
    height: '28px'
  },
  productTitle: {
    fontSize: '1.15em',
    marginBottom: '5px'
  },
  subheading: {
    color: 'rgba(88, 114, 128, 0.67)'
  },
  actions: {
    float: 'right',
    marginRight: '6px'
  },
  price: {
    display: 'inline',
    lineHeight: '3',
    paddingLeft: '8px',
    color: theme.palette.text.secondary
  }
}))

export default function Suggestions (props) {
  const classes = useStyles()
    return (<div>
      <Paper className={classes.root} elevation={4}>
        <Typography type="title" className={classes.title}>
          {props.title}
        </Typography>
        {props.products.map((item, i) => {
            return <span key={i}>
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cover}
                  image={'/api/product/image/'+item._id}
                  title={item.name}
                />
                <div className={classes.details}>
                  <CardContent className={classes.content}>
                    <Link to={'/product/'+item._id}><Typography variant="h3" component="h3" className={classes.productTitle} color="primary">{item.name}</Typography></Link>
                    <Link to={'/shops/'+item.shop._id}>
                      <Typography type="subheading" className={classes.subheading}>
                        <Icon className={classes.icon}>shopping_basket</Icon> {item.shop.name}
                      </Typography>
                    </Link>
                    <Typography component="p" className={classes.date}>
                        Added on {(new Date(item.created)).toDateString()}
                    </Typography>
                  </CardContent>
                  <div className={classes.controls}>
                    <Typography type="subheading" component="h3" className={classes.price} color="primary">$ {item.price}</Typography>
                      <span className={classes.actions}>
                        <Link to={'/product/'+item._id}>
                          <IconButton color="secondary" dense="dense">
                            <ViewIcon className={classes.iconButton}/>
                          </IconButton>
                        </Link>
                        <AddToCart item={item}/>
                      </span>
                    </div>
                  </div>
                </Card>
                <Divider/>
              </span>
            })
          }
      </Paper>
    </div>)
}

Suggestions.propTypes = {
  products: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
}
