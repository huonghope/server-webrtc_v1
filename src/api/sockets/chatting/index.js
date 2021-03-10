const _ChatModel = require('../../models/chat.models')
const _UserModel = require('../../models/user.models')
const _RoomModel = require('../../models/room.models')
const { checkHostBySocketId } = require('../../models/helper.models')

const { getFirstValueMap } = require('../helper')

const Logger = require("../../../config/logger")
const logger = new Logger('chat-socket')
/**
 * 채팅방식
 * - 강사 ~ 모든 학생
 * - 학생 ~ 강사만
 * ! 강사를 보내면 모든학생한테 노출
 * ! 학생이 강사만 노출
 * => 유저기리를 정해함
 */
const chatSocketController = {
  //!데이티 베이스에다가 저장할 필요함
  /**
   * all
   * @param {*} mainSocket:현재 socket 
   * @param {*} data: client부터 같이 보낸 데이터
   * @param {*} meetingRoomMap: 강좌별로 socket 저장하는 Map
   * @param {*} user: 현재 유저
   * @getFirstValueMap {*}: 강사변수
   */

  /**
   * @desc: 메시지를 보낼때 발생하는 이벤트
   * 강사: 모든 학생한테 보냄
   * 학생: 강사한테만 보냄
   */
  sentMessage:  async (mainSocket, data, meetingRoomMap, user, userRoom) => {
    try {
      logger.info('/sent-message', { data, roomId: userRoom.room_id })
      const { type } = data;
      const { uid } = data.message.sender;
      const { text: message } = data.message.data;
      const { room_id } = userRoom
    
      logger.setLogData({data, roomId: room_id})
    
      const newMessage = await _ChatModel.insertChat(uid, message, type, room_id )
      const _connectedPeers = meetingRoomMap
    
      let resMessage = await _ChatModel.convertResponseMessage(newMessage)
      resMessage.sender.username = user.user_name
    
    
      logger.info('return response /sent-message', { resMessage })
      if(checkHostBySocketId(_connectedPeers, mainSocket.id)){
        for (let [socketID, socket] of _connectedPeers.entries()) {
          socket.emit('res-sent-message', resMessage)
        }
      }else{
        const [_socketID, _socket] =  _connectedPeers.entries().next().value
        mainSocket.emit('res-sent-message', resMessage)
        _socket.emit('res-sent-message', resMessage)
      }
    } catch (error) {
      logger.error(error)      
    }
  },
  
  /**
   * @desc: 메시지를 보낼때 발생하는 이벤트
   * 강사: 모든 학생한테 보냄
   * 학생: 강사한테만 보냄
   */
  actionUserDisableChatting: async (mainSocket, data, meetingRoomMap, user, userRoom) => {
    const { room_id } = userRoom
    logger.setLogData(data)
    logger.info('request to /user-disable-chatting', { data, userId: user.user_idx, roomId: room_id})

    const { remoteSocketId, userId } = data
    const _connectedPeers = meetingRoomMap

    //!메시지 전체 학생이 보냄 필요함
    if(remoteSocketId === 'all'){
      for (const [socketID, _socket] of _connectedPeers.entries()) 
      {
          //모든 학생이 채팅을 금지
          if (socketID !== mainSocket.id) {
            let user = await _RoomModel.getUseRoomBySocketId(socketID)
            if(user){
              let { user_idx } = user
              let newMessage = await _ChatModel.insertChat(user_idx, "", "disable-chat",room_id)
              let resMessage = await _ChatModel.convertResponseMessage(newMessage)
              let userInfo = await _UserModel.getUserByUserIdx(user_idx)
              resMessage.sender.username = userInfo.user_name

              logger.info('return response /user-disable-chatting-all', { resMessage })
              _socket.emit('action_user_disable_chat', socketID)
              _socket.emit('alert_user_disable_chat', resMessage)
            }
          }
      }
      return
    }

    for (const [socketID, _socket] of _connectedPeers.entries()) 
    {
        //!다시 확인할 필요함
        if (socketID === remoteSocketId) {
            let disableChat = await _ChatModel.getDisableChat(userId, room_id)
            if(disableChat){
              let { c_status } = disableChat
              c_status = c_status ===  1 ? 0 : 1
              //있으며 디폴드 반대
              await _ChatModel.updateDisableChat(userId, room_id, c_status)
            }else{
              //처음에 없으면 디폴드 true
              await _ChatModel.insertDisableChat(userId, room_id, 1)
            }

            let newMessage = await _ChatModel.insertChat(userId, "", "disable-chat",room_id)
            let resMessage = await _ChatModel.convertResponseMessage(newMessage)
            let userInfo = await _UserModel.getUserByUserIdx(userId)
            resMessage.sender.username = userInfo.user_name
            // newMessage.username = userInfo.user_name
            logger.info('return response /user-disable-chatting', { resMessage })
            _socket.emit('action_user_disable_chat', socketID)
            _socket.emit('alert_user_disable_chat', resMessage)
        }
    }
  },
}

module.exports =  chatSocketController;