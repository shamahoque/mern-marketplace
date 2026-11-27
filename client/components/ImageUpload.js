// Hidden file input with an upload button and the chosen file's name (D-10).
// Used by the create and edit pages for shops, products and auctions.
import React from 'react'
import Button from '@material-ui/core/Button'
import FileUpload from '@material-ui/icons/AddPhotoAlternate'
import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles({
  input: {
    display: 'none'
  },
  filename: {
    marginLeft: '10px'
  }
})

export default function ImageUpload({label, color, file, onChange}) {
  const classes = useStyles()
  // React.Fragment rather than <>: es6-plato 1.2.3 cannot parse the short form.
  return (<React.Fragment>
    <input accept="image/*" onChange={onChange} className={classes.input} id="icon-button-file" type="file" />
    <label htmlFor="icon-button-file">
      <Button variant="contained" color={color} component="span">
        {label}
        <FileUpload/>
      </Button>
    </label> <span className={classes.filename}>{file ? file.name : ''}</span><br/>
  </React.Fragment>)
}
