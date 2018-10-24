import express from 'express'
import userCtrl from '../controllers/user.controller'
import authCtrl from '../controllers/auth.controller'
import shopCtrl from '../controllers/shop.controller'

const router = express.Router()

router.route('/api/shops')
  .get(shopCtrl.list)

router.route('/api/shop/:shopId')
  .get(shopCtrl.read)

router.route('/api/shops/by/:userId')
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.isSeller, shopCtrl.create)
  .get(authCtrl.requireSignin, authCtrl.hasAuthorization, shopCtrl.listByOwner)

router.route('/api/shops/:shopId')
  .put(authCtrl.requireSignin, shopCtrl.isOwner, shopCtrl.update)
  .delete(authCtrl.requireSignin, shopCtrl.isOwner, shopCtrl.remove)

router.route('/api/shops/logo/:shopId')
  .get(shopCtrl.photo, shopCtrl.defaultPhoto)

router.route('/api/shops/defaultphoto')
  .get(shopCtrl.defaultPhoto)

router.param('shopId', shopCtrl.shopByID)
router.param('userId', userCtrl.userByID)

export default router
