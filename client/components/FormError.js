// The red error line shown under a form when the server rejects it (D-10).
import React from 'react'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles({
  error: {
    verticalAlign: 'middle'
  }
})

export default function FormError({message}) {
  const classes = useStyles()
  return (<Typography component="p" color="error">
    <Icon color="error" className={classes.error}>error</Icon>
    {message}
  </Typography>)
}
