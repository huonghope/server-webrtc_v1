const socketioJwt = require('socketio-jwt')
const { jwtSecret } = require('../../config/vars');
const chatSocketController = require('./chatting');
const webRTCSocketController = require('./webrtc')
const courseSocketController = require('./course')
const Logger = require('../../config/logger')
const logger = new Logger('main-socket')
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
// setTimeout(() => {
//   console.log("null meeting Roommap")
//   meetingRoomMap = {}
// }, 2000);
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

      logger.info('collect to socket', {user, userRoom})
      if(!userRoom) return;
      const { id, room_id, host_user } = userRoom;
      // console.log("socket connected", user.user_name)

      //유저를 존재하면 유저룸테이블에서 Socket Id를 업데이트
      
      //해당하는 유저롬의 Map의 키를 설정
      let userRoomKey = room_id;
      
      
      if (!meetingRoomMap[userRoomKey]) {
        meetingRoomMap[userRoomKey] = new Map();
        // meetingRoomMap[userRoomKey].set(socket.id, socket)
      }
      
      //Socket Id는 Map에서 업데이트
      meetingRoomMap[userRoomKey] = await updateSocketId(meetingRoomMap[userRoomKey], socket, host_user)
      
      let currentUserRoomMap = meetingRoomMap[userRoomKey];
      
      if (user) {
        await insertSocketIdToUserRoom(socket.id, id)
        // const rows = await _RoomModel.getListUserByRoomId(userRoomKey)
        // console.log(user.user_name)
        // !문제가 있음
        // for (const [_socketID, _socket] of currentUserRoomMap.entries()) {
        //   const filter = rows.filter(e => e.socket_id === _socketID)
        //   if(filter.length === 0){
        //     currentUserRoomMap.delete(_socketID)
        //   }
        // }
      }
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
        let peerCount = currentUserRoomMap.size
        logger.info('disconnect to socket', {user, userRoom})
        if(peerCount === 5 || peerCount === 16){
            const [socketID, socket] = currentUserRoomMap.entries().next().value;
            for (const [__socketID, __socket] of currentUserRoomMap.entries()) {
                if(__socketID !== socketID){
                    __socket.emit("alert-edit-scream", { levelConstraints: peerCount === 5 ? "VGA" : "QVGA" })
                }
            }
        }
      })
      

      //webRTC socket on handling
      socket.on('onlinePeers', (data) => webRTCSocketController.onlinePeers(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('offer', (data) => webRTCSocketController.offer(socket, data, currentUserRoomMap, user))
      socket.on('answer', (data) => webRTCSocketController.sdpAnswer(socket, data, currentUserRoomMap, user))
      socket.on('candidate', (data) => webRTCSocketController.sendCandidate(socket, data, currentUserRoomMap, user))
      socket.on('share-scream', (data) => webRTCSocketController.shareScream(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('edit-stream', (data) => webRTCSocketController.editStream(socket, data, currentUserRoomMap, user, userRoom))

      //chat component socket on handling
      socket.on('sent-message', (data) => chatSocketController.sentMessage(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('host-req-user-disable-chat', (data) => chatSocketController.actionUserDisableChatting(socket, data, currentUserRoomMap, user, userRoom))
      
      //course component socket on handling
      socket.on('user-request-question', (data) => courseSocketController.userRequestQuestion(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('user-cancel-request-question', (data) => courseSocketController.userCancelRequestQuestion(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('user-request-lecOut', (data) => courseSocketController.userRequestOut(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('user-cancel-request-lecOut', (data) => courseSocketController.userCancelRequestLecOut(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('user-test-concentration', (data) => courseSocketController.testConcentration(socket, data, currentUserRoomMap, user, userRoom))

      socket.on('host-send-process-request', (data) => courseSocketController.actionForUserRequest(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('host-send-warning', (data) => courseSocketController.actionWarningUser(socket, data, currentUserRoomMap, user, userRoom))
      socket.on('host-send-mute-mic-all', (data) => courseSocketController.stateMicAllStudent(socket, data, currentUserRoomMap, user, userRoom))

      const disconnectedPeer = (socketID) => {
        for (const [_socketID, _socket] of currentUserRoomMap.entries()) {
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
