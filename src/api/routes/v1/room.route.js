const express = require('express')
const roomController = require('../../controllers/room.controller')
const { authorize, LOGGED_USER } = require('../../middlewares/auth')

const router = express.Router()

// router.route('/')
//     .get(controller.createRoom)
router.route('/')
    .post(authorize(LOGGED_USER), roomController.createRoom)

router.route('/getinfo')
    .get(authorize(LOGGED_USER), roomController.getInfoRoom)

// router.route('/join')   
//     .put(authorize(LOGGED_USER), roomController.joinRoom)


module.exports = router;