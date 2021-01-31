
const _WarningModel = require('../models/warning.models.js')
const _RoomModel = require('../models/room.models.js')

const getWarningInfo = async (req, res, next) => {
  try {
    const { userId, userRoomId } = req.query
    const { room_id } = await _RoomModel.getUserRoomById(userRoomId)
    const rows =  await _WarningModel.getWarningInfo(userId, room_id)
    return res.status(200).send({
      result: false,
      data: rows,
      message: '해당하는 유저 경고정보'
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

module.exports = {
  getWarningInfo,
}