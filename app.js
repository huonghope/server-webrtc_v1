Promise = require('bluebird')
const { port, env } =  require('./src/config/vars')
const server = require('./src/config/express')

const Logger = require('./src/config/logger');
const logger = new Logger('app')
server.listen(port, () => logger.info(`server started on port ${port} - env ${env}`))


