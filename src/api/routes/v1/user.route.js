const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');
const {
  listUsers,
  updateUser, updatePassword,
} = require('../../validations/user.validation');


const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('userId', controller.load);

router.route('/iceserver').get(controller.iceServerList);

router.route('/')
  .get(controller.configUser)

router
  .route('/current')
  .get(authorize(LOGGED_USER), controller.getCurrentUser);

router
  .route('/:userId')
  // lấy thông tin người dùng theo id
  .get(authorize(LOGGED_USER), controller.get)
  

module.exports = router;
