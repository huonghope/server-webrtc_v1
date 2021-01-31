const express = require('express');
const controller = require('../../controllers/waring.controller');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

router.route('/info')
  .get(authorize(LOGGED_USER), controller.getWarningInfo)

module.exports = router;
