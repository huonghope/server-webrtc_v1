const express = require('express')
const roomController = require('../../controllers/room.controller')
const { authorize, LOGGED_USER } = require('../../middlewares/auth')

const router = express.Router()

var multer = require('multer'); 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'update/') 
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        console.log(file)
        // cb(null, makeid(10) + "." + extension);
        cb(null, file.originalname);
    }
})

// var upload = multer({storage});
var upload = multer({ storage: storage });


// router.route('/')
//     .get(controller.createRoom)
router.route('/')
    .post(authorize(LOGGED_USER), roomController.createRoom)

router.route('/getinfo')
    .get(authorize(LOGGED_USER), roomController.getInfoRoom)

router.route('/upfile')
    .post(authorize(LOGGED_USER), upload.array('file'), roomController.upFile)

router.route('/lecture')
    .get(authorize(LOGGED_USER), roomController.getLectureInfo)

// router.route('/join')   
//     .put(authorize(LOGGED_USER), roomController.joinRoom)


module.exports = router;