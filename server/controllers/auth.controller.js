import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from './../../config/config'
import { asyncHandler, HttpError } from '../helpers/errors'

const signin = asyncHandler(async (req, res) => {
  const user = await User.findOne({ "email": req.body.email })
  if (!user) throw new HttpError(401, "User not found")
  if (!user.authenticate(req.body.password)) throw new HttpError(401, "Email and password don't match.")
  if (user.isLegacyHash()) { // D-08: upgrade old SHA-1 hash now that we have the plain password
    user.password = req.body.password
    await user.save().catch(err => console.log('Password rehash failed', err))
  }

  const token = jwt.sign({ _id: user._id }, config.jwtSecret)
  res.cookie("t", token, { expire: new Date() + 9999 })
  return res.json({
    token,
    user: {_id: user._id, name: user.name, email: user.email, seller: user.seller}
  })
}, new HttpError(401, "Could not sign in"))

const signout = (req, res) => {
  res.clearCookie("t")
  return res.status(200).json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth'
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!authorized) return next(new HttpError(403, "User is not authorized"))
  next()
}

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}
