const _WarningModel = require('../models/warning.models.js')
const _RoomModel = require('../models/room.models.js')
const Logger = require('../../config/logger')
const logger = new Logger('warning')

const getWarningInfo = async (req, res, next) => {
  try {
    const { userId, userRoomId } = req.query
    const { room_id } = await _RoomModel.getUserRoomById(userRoomId)
    const rows =  await _WarningModel.getWarningInfo(userId, room_id)
    
    //log write
    logger.setLogData({ userId, userRoomId })
    logger.info('request to /info',{ userId, userRoomId })
    logger.info("return response /info",{
      result: true,
      data: rows,
      message: '해당하는 유저 경고 정보'
    })

    return res.status(200).send({
      result: true,
      data: rows,
      message: '해당하는 유저 경고 정보'
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
}
module.exports = {
  getWarningInfo,
}