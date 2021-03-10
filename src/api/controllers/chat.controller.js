const _UserModel = require("../models/user.models")
const _RoomModel = require('../models/room.models')
const _ChatModel = require('../models/chat.models')

// const { jwtExpirationInterval } = require("../../config/vars")
/**
 * 강의를 개설할때 LMS부터 받은 정보들을 데이트베이서에서 자장함
 * URL를 생성한 후에 LMS를 다시 전달함
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

//강사 및 일단 유저에따라 출력 다름
const getListMessageByUserIAndRoomId = async (req, res, next) => {
  const { userRoomId } = req.query;
  const { user_idx, user_tp } = req.user;
  let userRoomInfo = await _RoomModel.getUserRoomById(userRoomId)
  let listResMessage = []
  let listMessage = []
  if(user_tp === 'T' || user_tp === 'I'){
    listMessage = await _ChatModel.getListMessageByRoomId(userRoomInfo.room_id)
  }else if(user_tp === 'S' || user_tp === 'G'){
    //Host 및 자기Id를 전달해서 메시지를 출력함
    let hostUserRoomInfo = await _RoomModel.getHostUserRoomInfo(userRoomInfo.room_id)
    listMessage = await _ChatModel.getListMessageByRoomIdForStudent(userRoomInfo.room_id, user_idx, hostUserRoomInfo.user_idx)
  }

  for(let i = 0; i < listMessage.length; i++){
    let resMessage = await _ChatModel.convertResponseMessage(listMessage[i])
    const {type, user_idx } = listMessage[i]
    let UserInfo = await _UserModel.getUserByUserIdx(user_idx);

    resMessage.sender.username = UserInfo.user_name
    if(type === 'file'){
      let FileInfo = await _ChatModel.getFileInfoById(listMessage[i].file_id)
      resMessage.data.file = {
        id: FileInfo.id,
        originalname: FileInfo.filename,
        size: FileInfo.size,
        mimetype: FileInfo.mimetype,
        fileHash: `files/${FileInfo.filename}`,
      } 
    }
    listResMessage.push(resMessage)
  }
  try {
    return res.send({
      result: true,
      data: listResMessage,
      message: '전체 메시지를 리스트'
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
};

module.exports = {
  getListMessageByUserIAndRoomId,
}