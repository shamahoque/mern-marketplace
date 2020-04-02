import express from 'express'
import userCtrl from '../controllers/user.controller'
import authCtrl from '../controllers/auth.controller'
import auctionCtrl from '../controllers/auction.controller'

const router = express.Router()

router.route('/api/auctions')
  .get(auctionCtrl.listOpen)

router.route('/api/auctions/bid/:userId')
  .get(auctionCtrl.listByBidder)

router.route('/api/auction/:auctionId')
  .get(auctionCtrl.read)

router.route('/api/auctions/by/:userId')
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.isSeller, auctionCtrl.create)
  .get(authCtrl.requireSignin, authCtrl.hasAuthorization, auctionCtrl.listBySeller)

router.route('/api/auctions/:auctionId')
  .put(authCtrl.requireSignin, auctionCtrl.isSeller, auctionCtrl.update)
  .delete(authCtrl.requireSignin, auctionCtrl.isSeller, auctionCtrl.remove)

router.route('/api/auctions/image/:auctionId')
  .get(auctionCtrl.photo, auctionCtrl.defaultPhoto)

router.route('/api/auctions/defaultphoto')
  .get(auctionCtrl.defaultPhoto)

router.param('auctionId', auctionCtrl.auctionByID)
router.param('userId', userCtrl.userByID)

export default router
