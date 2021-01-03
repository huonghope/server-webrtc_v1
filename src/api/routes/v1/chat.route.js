const express = require('express');
const controller = require('../../controllers/chat.controller');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');
const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router.route('/')
  .get(authorize(LOGGED_USER), controller.getListMessageByUserIAndRoomId)



module.exports = router;
