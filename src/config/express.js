//IMPORT PACKAGE
const express = require('express')
const morgan = require('morgan') //display logger
const bodyParser = require('body-parser')
const compress = require('compression') //최적화 웹 브라운저
const cors = require('cors')
const rateLimit = require("express-rate-limit") //한 API를 요청을 제함함
const helmet = require('helmet') //HTTP filter
const passport = require('passport');
var cookieParser = require('cookie-parser');
const fs = require('fs')
const path = require('path')
const https = require('https')
const io = require('socket.io')
//IMPORT CONFIG VAR
const routes = require('../api/routes/v1')
const { logs } = require('./vars') 
const strategy = require('./passport') //Only jwt-web-token
const error = require('../api/middlewares/error')
const { initSockets } = require('../api/sockets')

/**
* Express instance
* @public
*/
require('dotenv').config();
var app = express();

// static folder
app.use('/api/files', express.static('update', {fallthrough: false}),); 

app.use(express.static(__dirname + '/../../build'))
app.set('views', __dirname + '/../../build');

app.get('/', (req, res, next) => { //default room
  res.sendFile(__dirname + '/../../build/index.html')
})

// Init server with socket.io and express app
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
const server = https.createServer(options, app);
const socketIo = io(server, {path: '/io/webrtc'})

// request logging, dev: console | production: file
app.use(morgan(logs))

// parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

//gzip compression
app.use(compress())

//secure apps by setting various HTTP headers
app.use(helmet())

//enable CORS - Cross Origin Resource Sharing
app.use(cors())

//enable authentication with jwt-web-token
app.use(passport.initialize())
passport.use('jwt', strategy.jwt)

//mount api v1 to routes
app.use('/api', routes)


//init all sockets
initSockets(socketIo)

//error is not an instance Of APIError,
app.use(error.converter)


// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);


module.exports = server;