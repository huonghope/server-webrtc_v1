var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({
    meetting: '방문 활영합니다.'
  })
});
module.exports = router;
