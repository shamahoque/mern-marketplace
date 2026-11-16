import User from '../models/user.model'
import extend from 'lodash/extend'
import { asyncHandler, HttpError } from '../helpers/errors'

const create = asyncHandler(async (req, res) => {
  const user = new User(req.body)
  await user.save()
  return res.status(200).json({
    message: "Successfully signed up!"
  })
})

/**
 * Load user and append to req.
 */
const userByID = asyncHandler(async (req, res, next, id) => {
  const user = await User.findById(id)
  if (!user) throw new HttpError(400, "User not found")
  req.profile = user
  next()
}, new HttpError(400, "Could not retrieve user"))

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email updated created')
  res.json(users)
})

const update = asyncHandler(async (req, res) => {
  let user = req.profile
  user = extend(user, req.body)
  user.updated = Date.now()
  await user.save()
  user.hashed_password = undefined
  user.salt = undefined
  res.json(user)
})

const remove = asyncHandler(async (req, res) => {
  const deletedUser = await req.profile.remove()
  deletedUser.hashed_password = undefined
  deletedUser.salt = undefined
  res.json(deletedUser)
})

const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller
  if (!isSeller) return next(new HttpError(403, "User is not a seller"))
  next()
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  isSeller
}
