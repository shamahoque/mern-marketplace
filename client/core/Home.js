import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import Suggestions from './../product/Suggestions'
import {listLatest} from './../product/api-product.js'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  }
})

class Home extends Component {
  state={
    suggestionTitle: "Latest Products",
    suggestions: []
  }
  componentDidMount = () => {
    listLatest().then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        this.setState({suggestions: data})
      }
    })
  }
  render() {
    const {classes} = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={8} sm={8}>
            Search
          </Grid>
          <Grid item xs={4} sm={4}>
            <Suggestions products={this.state.suggestions} title={this.state.suggestionTitle}/>
          </Grid>
        </Grid>
      </div>
    )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home)
