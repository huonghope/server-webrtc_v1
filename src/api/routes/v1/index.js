const express = require('express');
// const userRoutes = require('./user.route');
// const authRoutes = require('./auth.route');
// const contactRoutes = require('./contact.route');
// const messageRoutes = require('./message.route');
// const chatGroupRoutes = require('./chatGroup.route');

const userRoutes = require("./user.route")
const roomRoutes = require("./room.route")
const WarningRoutes = require("./warning.route")
const lmsRouters = require("./lms.route")
const chatRouters = require("./chat.route")

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('Server connection success, OK'));

router.get('/', (req, res, next) => { //default room
  res.sendFile(__dirname + '../../build/index.html')
})

/**
 * GET v1/docs/ - API 리스트
 */
router.use('/docs', express.static('docs'));
router.use('/user', userRoutes);
router.use('/room', roomRoutes);
router.use('/warning', WarningRoutes);
router.use('/lms', lmsRouters);
router.use('/chat', chatRouters);

module.exports = router;
