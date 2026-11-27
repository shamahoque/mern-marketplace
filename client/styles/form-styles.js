// Style rules repeated across the sign-in, sign-up, profile, shop, product and
// auction forms (D-13). Each form's makeStyles still names its own classes
// (card, textField, submit, bigAvatar) but builds them from these rules.

// The centred card used by the create and account forms.
export const formCard = theme => ({
  maxWidth: 600,
  margin: 'auto',
  textAlign: 'center',
  marginTop: theme.spacing(5),
  paddingBottom: theme.spacing(2)
})

// Text inputs: 300px on create/account forms, 400px on edit forms.
export const textField = (theme, width) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  width
})

export const submitButton = theme => ({
  margin: 'auto',
  marginBottom: theme.spacing(2)
})

// The current image shown on edit forms.
export const bigAvatar = {
  width: 60,
  height: 60,
  margin: 'auto'
}
