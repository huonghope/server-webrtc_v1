const socketioJwt = require('socketio-jwt')
const { jwtSecret } = require('../../config/vars');
const chatSocketController = require('./chatting');
const webRTCSocketController = require('./webrtc')
const courseSocketController = require('./course')

const db = require("../../config/db-connection")
const sql = require("../../../sql")

const {
  pushSocketToRoomMap,
  emitNotifyToArray,
  removeSocketIdToArray,
  getUserInfo,
  getUserRoomById,
  insertSocketIdToUserRoom,
  pushSocketToRoomMapHost,
  updateSocketId,
  displayMapSocket,
  updateStateForUserRoom
} = require('./helper');

/**
 * @param {*} io from socket.io library
 */

let meetingRoomMap = {};
const initSockets = (io) => {
  io.use(socketioJwt.authorize({
    secret: jwtSecret,
    handshake: true,
  }));

  io.on('connection', async (socket) => {
    try {
      //! 확인함
      //socket에서 담은 값기준으로 user 정보를 받음
      //userroom 테이블부터 유저정보를 읽어옴
      const user = await getUserInfo(socket.decoded_token.sub);
      const { roomId } = socket.handshake.query
      const { user_name, user_idx } = user
      const userRoom = await getUserRoomById(roomId)
      const { id, room_id, host_user } = userRoom;
      
      console.log("socket connected", user.user_name)
      //update socket_id
      if(user){
        //!insert socket to roomuser
        //해당하는 유저방에서 Socket_id 업데이트
        await insertSocketIdToUserRoom(socket.id, id)
      }

    let roomname = room_id;
    if(!meetingRoomMap[roomname]){
        meetingRoomMap[roomname] = new Map();
        meetingRoomMap[roomname].set(socket.id, socket)
      }
      //update socket id with map
      meetingRoomMap[roomname] = await updateSocketId(meetingRoomMap[roomname], socket, host_user )

      const roomByName = meetingRoomMap[roomname]
      updateStateForUserRoom(id, 1)
      socket.emit('user-role',{ userRole :  (user.user_tp === 'T' || user.user_tp === 'I') ? true : false })
      socket.emit('user-role',{ userRole :  (user.user_tp === 'T' || user.user_tp === 'I') ? true : false })
      socket.emit('user-role',{ userRole :  (user.user_tp === 'T' || user.user_tp === 'I') ? true : false })
      socket.on('join-room',  () => {
        socket.emit('connection-success', {
            isHost: (user.user_tp === 'T' || user.user_tp === 'I') ? socket.id === meetingRoomMap[roomname].entries().next().value[0] : false,
            success: socket.id,
            peerCount: meetingRoomMap[roomname].size,
            // messages: messages[room],
        })
      })

      socket.on('disconnect',  () => {
        // connectedPeers.delete(socket.id)
        meetingRoomMap[roomname].delete(socket.id)
        updateStateForUserRoom(id, 0)
        console.log("delete socket id", socket.id)
        console.log("delete user", user.user_name)
        // messages[room] = meetingRoomMap[room].size === 0 ? null : messages[room]
        disconnectedPeer(socket.id)
      })

      //webRTC socket on handling
      socket.on('onlinePeers', (data) => webRTCSocketController.onlinePeers(socket, data, meetingRoomMap[roomname], user, userRoom))
      socket.on('offer', (data) => webRTCSocketController.offer(socket, data, meetingRoomMap[roomname], user))
      socket.on('answer', (data) => webRTCSocketController.sdpAnswer(socket, data, meetingRoomMap[roomname], user))
      socket.on('candidate', (data) => webRTCSocketController.sendCandidate(socket, data, meetingRoomMap[roomname], user))

      //chat component socket on handling
      //! 채팅금지 확인
      socket.on('sent-message', (data) => chatSocketController.sentMessage(socket, data, meetingRoomMap[roomname], user, room_id))
      socket.on('action_user_disable_chatting', (data) => chatSocketController.actionUserDisableChatting(socket, data, meetingRoomMap[roomname], user))
      socket.on('host-req-user-disable-chat', (data) => chatSocketController.actionUserDisableChatting(socket, data, meetingRoomMap[roomname], user, room_id))
      // socket.on('host-req-user-enable-chat', (data) => chatSocketController.actionUserEnableChatting(socket, data, meetingRoomMap[roomname], user, room_id))
      // socket.on('sent-message', (data) => chatSocketController.sendMessage(socket, data, meetingRoomMap[roomname], user))

      //course component socket on handling
      socket.on('user-request-question', (data) => courseSocketController.userRequestQuestion(socket, data, meetingRoomMap[roomname], user))
      socket.on('user-cancel-request-question', (data) => courseSocketController.userCancelRequestQuestion(socket, data, meetingRoomMap[roomname], user))
      socket.on('user-request-lecOut', (data) => courseSocketController.userRequestOut(socket, data, meetingRoomMap[roomname], user))
      socket.on('user-cancel-request-lecOut', (data) => courseSocketController.userCancelRequestLecOut(socket, data, meetingRoomMap[roomname], user))
      socket.on('host-send-process-request', (data) => courseSocketController.actionForUserRequest(socket, data, meetingRoomMap[roomname], user))
      socket.on('host-send-warning', (data) => courseSocketController.actionWarningUser(socket, data, meetingRoomMap[roomname], user))
      socket.on('user-test-concentration', (data) => courseSocketController.testConcentration(socket, data, meetingRoomMap[roomname], user))
      socket.on('host-send-mute-mic-all', (data) => courseSocketController.stateMicAllStudent(socket, data, meetingRoomMap[roomname], user))
      // socket.on('user-send-comeback-lec', (data) => courseSocketController.testConcentration(socket, data, meetingRoomMap[roomname], user))
      
      const disconnectedPeer = (socketID) => {
        const _connectedPeers = meetingRoomMap[roomname]
        for (const [_socketID, _socket] of _connectedPeers.entries()) {
          _socket.emit('peer-disconnected', {
                socketID
            })
        }
      }
      
    } catch (error) {
      console.log("socket handle error: ", error)
    }
  })
}
// module.exports = meetingRoomMap;
module.exports = { initSockets, meetingRoomMap};
