import User from '../models/user.model'
import payment from '../services/payment.service'
import { asyncHandler, HttpError } from '../helpers/errors'

// PUT /api/stripe_auth/:userId — puts the seller's Stripe account on req.body for userCtrl.update.
const stripeAuth = asyncHandler(async (req, res, next) => {
  const body = await payment.connectSeller(req.body.stripe)
  if (body.error) throw new HttpError(400, body.error_description)
  req.body.stripe_seller = body
  next()
}, new HttpError(400, 'Could not connect Stripe account'))

// POST /api/orders/:userId — saves the buyer's card and records the customer id on the order.
const stripeCustomer = asyncHandler(async (req, res, next) => {
  const isNewCustomer = !req.profile.stripe_customer
  const customerId = await payment.saveCustomer(req.profile, req.body.token)
    .catch(() => { throw new HttpError(400, 'Could not update charge details') })
  if (isNewCustomer) {
    await User.updateOne({ '_id': req.profile._id }, { '$set': { 'stripe_customer': customerId } })
  }
  req.body.order.payment_id = customerId
  next()
})

// PUT /api/order/:orderId/charge/:userId/:shopId — charges the order before its status is updated.
const createCharge = asyncHandler(async (req, res, next) => {
  if (!req.profile.stripe_seller) throw new HttpError(400, 'Please connect your Stripe account')
  await payment.chargeCustomer(req.order.payment_id, req.profile.stripe_seller.stripe_user_id, req.body.amount)
  next()
}, new HttpError(400, 'Could not process charge'))

export default { stripeAuth, stripeCustomer, createCharge }
