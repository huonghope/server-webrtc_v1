const _ChatModel = require('../../models/chat.models')
const _UserModel = require('../../models/user.models')
const _RoomModel = require('../../models/room.models')
const { checkHostBySocketId } = require('../../models/helper.models')
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
  sentMessage:  async (mainSocket, data, meetingRoomMap, user, room_id) => {
      let { type } = data;
      let { uid } = data.message.sender;
      let { text: message } = data.message.data;
      const newMessage = await _ChatModel.insertChat(uid, message, type, room_id )
      const _connectedPeers = meetingRoomMap

      let resMessage = await _ChatModel.convertResponseMessage(newMessage)
      resMessage.sender.username = user.user_name

      if(checkHostBySocketId(_connectedPeers, mainSocket.id)){
        for (let [socketID, socket] of _connectedPeers.entries()) {
          socket.emit('res-sent-message', resMessage)
        }
      }else{
        const [_socketID, _socket] =  _connectedPeers.entries().next().value
        mainSocket.emit('res-sent-message', resMessage)
        _socket.emit('res-sent-message', resMessage)
      }
  },
  //메시지 같이 전달함?
  actionUserDisableChatting: async (mainSocket, data, meetingRoomMap, user, room_id) => {
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
            let newMessage = await _ChatModel.insertChat(userId, "", "disable-chat",room_id)
            let resMessage = await _ChatModel.convertResponseMessage(newMessage)
            let userInfo = await _UserModel.getUserByUserIdx(userId)
            resMessage.sender.username = userInfo.user_name
            // newMessage.username = userInfo.user_name
            _socket.emit('action_user_disable_chat', socketID)
            _socket.emit('alert_user_disable_chat', resMessage)
        }
    }
  },
  actionHostChat: (mainSocket, data, meetingRoomMap, user) => {
    const _connectedPeers = meetingRoomMap
      for (const [socketID, _socket] of _connectedPeers.entries()) {
        // don't send to self
        if (socketID !== data.socketID.local) {
          _socket.emit('action_host_chat', socketID)
        }
      }
  }
}

module.exports =  chatSocketController;