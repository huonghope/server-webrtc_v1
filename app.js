var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser')

require('dotenv').config();
const io = require('socket.io')


var app = express();
app.io = io({
  path: '/io/webrtc'
});
app.io.set('origins', '*:*');


app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static('update', {fallthrough: false}),); 


//https://expressjs.com/en/guide/writing-middleware.html
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomRouter = require('./routes/room');

//Router API
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/room', roomRouter);


// app.io.on('connection', (socket) => {
//   console.log("connect sucess", socket.id)
// })
//Router socket
roomRouter.joinRoom(app.io.of('/room'))


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};jc

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
