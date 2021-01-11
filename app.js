Promise = require('bluebird')
const { port, env } =  require('./src/config/vars')
const logger = require('./src/config/logger')
const server = require('./src/config/express')
const mysql = require('./src/config/db-connection')

//open db connection
mysql.getConnection((err) => {
  if(err) console.log("Database connect failed")
})

server.listen(port, () => logger.info(`server started on port ${port} - env ${env}`))


