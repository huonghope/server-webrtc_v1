const _ChatModel = require('../../models/chat.models')

const chatSocketController = {
  //!데이티 베이스에다가 저장할 필요함
  sentMessage:  async (mainSocket, data, meetingRoomMap, user, room_id) => {
      let { type } = data;
      let { uid } = data.message.sender;
      let { text: message } = data.message.data;
      const newMessage = await _ChatModel.insertChat(uid, message, type, room_id )
      data.message.data.timestamp = newMessage.timestamp
      const _connectedPeers = meetingRoomMap
      for (const [socketID, socket] of _connectedPeers.entries()) {
        socket.emit('res-sent-message', data)
      }
  },
  actionUserDisableChatting: (mainSocket, data, meetingRoomMap, user) => {
    const _connectedPeers = meetingRoomMap
    for (const [socketID, _socket] of _connectedPeers.entries()) 
    {
        if (socketID === data.socketID.remoteSocketId) {
            _socket.emit('action_user_disable_chatting', socketID)
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