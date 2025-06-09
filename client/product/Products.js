import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import GridListTileBar from '@material-ui/core/GridListTileBar'
import {Link} from 'react-router-dom'
import AddToCart from './../cart/AddToCart'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    background: theme.palette.background.paper,
    textAlign: 'left',
    padding: '0 8px'
  },
  container: {
    minWidth: '100%',
    paddingBottom: '14px'
  },
  gridList: {
    width: '100%',
    minHeight: 200,
    padding: '16px 0 10px'
  },
  title: {
    padding:`${theme.spacing(3)}px ${theme.spacing(2.5)}px ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
    width: '100%'
  },
  tile: {
    textAlign: 'center'
  },
  image: {
    height: '100%'
  },
  tileBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    textAlign: 'left'
  },
  tileTitle: {
    fontSize:'1.1em',
    marginBottom:'5px',
    color:'rgb(189, 222, 219)',
    display:'block'
  },
  sortSelect: {
    margin: theme.spacing(2),
    minWidth: 150
  }
}))

export default function Products(props){
  const classes = useStyles()
  const [sortOrder, setSortOrder] = useState('default')

  const sortProducts = (products, sortBy) => {
    const sortedProducts = [...products]
    switch(sortBy) {
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price)
      case 'name':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return sortedProducts
    }
  }

  const displayProducts = sortProducts(props.products, sortOrder)

  return (
    <div className={classes.root}>
      {props.products.length > 0 ? (
        <div className={classes.container}>
          <FormControl className={classes.sortSelect}>
            <InputLabel id="sort-select-label">Sort by</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
          <GridList cellHeight={200} className={classes.gridList} cols={3}>
            {displayProducts.map((product, i) => (
              <GridListTile key={i} className={classes.tile}>
                <Link to={"/product/"+product._id}><img className={classes.image} src={'/api/product/image/'+product._id} alt={product.name} /></Link>
                <GridListTileBar className={classes.tileBar}
                  title={<Link to={"/product/"+product._id} className={classes.tileTitle}>{product.name}</Link>}
                  subtitle={<span>$ {product.price}</span>}
                  actionIcon={
                    <AddToCart item={product}/>
                  }
                />
              </GridListTile>
            ))}
          </GridList>
        </div>
      ) : props.searched && (
        <Typography variant="subheading" component="h4" className={classes.title}>
          No products found! :(
        </Typography>
      )}
    </div>
  )
}

Products.propTypes = {
  products: PropTypes.array.isRequired,
  searched: PropTypes.bool.isRequired
}
