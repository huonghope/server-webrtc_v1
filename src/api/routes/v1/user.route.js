const express = require('express');
const controller = require('../../controllers/user.controller');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

// router.route('/iceserver').get(controller.iceServerList);

router.route('/')
  .get(controller.configUser)

router
  .route('/current')
  .get(authorize(LOGGED_USER), controller.getCurrentUser);

module.exports = router;
