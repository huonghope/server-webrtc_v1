const express = require('express')
const lmsController = require('../../controllers/lms.controller')
const { authorize, LOGGED_USER } = require('../../middlewares/auth')

const router = express.Router()

// router.route('/')
//     .get(controller.createRoom)
router.route('/')
    .post(lmsController.openCourse)


module.exports = router