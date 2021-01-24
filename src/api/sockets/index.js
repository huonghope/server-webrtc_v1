const socketioJwt = require('socketio-jwt')
const { jwtSecret } = require('../../config/vars');
const chatSocketController = require('./chatting');
const webRTCSocketController = require('./webrtc')
const courseSocketController = require('./course')

const db = require("../../config/db-connection")
const sql = require("../../../sql")

const {
  getUserInfo,
  getUserRoomById,
  insertSocketIdToUserRoom,
  updateSocketId,
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
      //접근한 유저 정보
      const user = await getUserInfo(socket.decoded_token.sub);

      //접근한 룸의Idd
      const { roomId } = socket.handshake.query

      //접근한 유저룸의 정보
      const userRoom = await getUserRoomById(roomId)
      const { id, room_id, host_user } = userRoom;

      console.log("socket connected", user.user_name)

      //유저를 존재하면 유저룸테이블에서 Socket Id를 업데이트
      if (user) {
        await insertSocketIdToUserRoom(socket.id, id)
      }

      //해당하는 유저롬의 Map의 키를 설정
      let userRoomKey = room_id;
      if (!meetingRoomMap[userRoomKey]) {
        meetingRoomMap[userRoomKey] = new Map();
        meetingRoomMap[userRoomKey].set(socket.id, socket)
      }
      
      //Socket Id는 Map에서 업데이트
      meetingRoomMap[userRoomKey] = await updateSocketId(meetingRoomMap[userRoomKey], socket, host_user)

      const currentUserRoomMap = meetingRoomMap[userRoomKey];

      //!확인필요함
      updateStateForUserRoom(id, 1)
      socket.emit('user-role', { userRole: (user.user_tp === 'T' || user.user_tp === 'I') ? true : false })
      socket.on('join-room', () => {
        socket.emit('connection-success', {
          isHost: (user.user_tp === 'T' || user.user_tp === 'I') ? socket.id === currentUserRoomMap.entries().next().value[0] : false,
          success: socket.id,
          peerCount: currentUserRoomMap.size, //맞지 않은 경우가 있음
        })
      })

      socket.on('disconnect', () => {
        currentUserRoomMap.delete(socket.id)
        updateStateForUserRoom(id, 0)
        disconnectedPeer(socket.id)
        console.log("delete user", user.user_name)
      })

      //webRTC socket on handling
      socket.on('onlinePeers', (data) => webRTCSocketController.onlinePeers(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('offer', (data) => webRTCSocketController.offer(socket, data, currentUserRoomMap, user))
      socket.on('answer', (data) => webRTCSocketController.sdpAnswer(socket, data, currentUserRoomMap, user))
      socket.on('candidate', (data) => webRTCSocketController.sendCandidate(socket, data, currentUserRoomMap, user))

      //chat component socket on handling
      //! 채팅금지 확인
      socket.on('sent-message', (data) => chatSocketController.sentMessage(socket, data, currentUserRoomMap, user, room_id))
      socket.on('action_user_disable_chatting', (data) => chatSocketController.actionUserDisableChatting(socket, data, currentUserRoomMap, user))
      socket.on('host-req-user-disable-chat', (data) => chatSocketController.actionUserDisableChatting(socket, data, currentUserRoomMap, user, room_id))
      // socket.on('host-req-user-enable-chat', (data) => chatSocketController.actionUserEnableChatting(socket, data, currentUserRoomMap, user, room_id))
      // socket.on('sent-message', (data) => chatSocketController.sendMessage(socket, data, currentUserRoomMap, user))

      //course component socket on handling
      socket.on('user-request-question', (data) => courseSocketController.userRequestQuestion(socket, data, currentUserRoomMap, user))
      socket.on('user-cancel-request-question', (data) => courseSocketController.userCancelRequestQuestion(socket, data, currentUserRoomMap, user))
      socket.on('user-request-lecOut', (data) => courseSocketController.userRequestOut(socket, data, currentUserRoomMap, user))
      socket.on('user-cancel-request-lecOut', (data) => courseSocketController.userCancelRequestLecOut(socket, data, currentUserRoomMap, user))
      socket.on('user-test-concentration', (data) => courseSocketController.testConcentration(socket, data, currentUserRoomMap, user))

      socket.on('host-send-process-request', (data) => courseSocketController.actionForUserRequest(socket, data, currentUserRoomMap, user))
      socket.on('host-send-warning', (data) => courseSocketController.actionWarningUser(socket, data, currentUserRoomMap, user))
      socket.on('host-send-mute-mic-all', (data) => courseSocketController.stateMicAllStudent(socket, data, currentUserRoomMap, user))
      // socket.on('user-send-comeback-lec', (data) => courseSocketController.testConcentration(socket, data, currentUserRoomMap, user))

      const disconnectedPeer = (socketID) => {
        const _connectedPeers = currentUserRoomMap
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
module.exports = { initSockets, meetingRoomMap };
