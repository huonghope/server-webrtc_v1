const chatSocketController = {
  sentMessage: (mainSocket, data, meetingRoomMap, user) => {
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