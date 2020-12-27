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
  displayMapSocket
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

  //방별로 Socket의 리스트를 저장하는 변수

  io.on('connection', async (socket) => {
    try {
      
      // //유저의 정보를 출력함
      // const user = await getUserInfo(socket.decoded_token.sub);

      // //해당하는 유저이름으로 강좌의 정보를 출력함
      // const room = await getRoomUserByUserName(user.username)

      // const { roomname, host_user} = room

      // //해당하는 강좌의 방이 null
      // //방을 만들때 첫사람
      // if(!meetingRoomMap[roomname]){
      //   meetingRoomMap[roomname] = new Map();
      //   meetingRoomMap[roomname].set(socket.id, socket)
      // }

      // meetingRoomMap[roomname] = updateSocketId(meetingRoomMap[roomname], socket, host_user )
      

      // if(user){
      //   //!insert socket to roomuser
      //   await insertSocketIdToRoomUser(socket.id, user.username)
      // }

      // const room = await getRoomUserByUserName(user.username)
      // if (user) {
      //   //host인 경우에는 첫번째 요수 추가해야됨
      //   if(room.host_user){
      //     console.log("host", room.host_user)
      //     meetingRoomMap = pushSocketToRoomMapHost(meetingRoomMap, room.roomname, socket);
      //   }else{ 
      //     meetingRoomMap = pushSocketToRoomMap(meetingRoomMap, room.roomname, socket);
      //   }
      // }
      /**
       * @desc
       * - socket를 내리다가 다시 연결하면 socket의 id를 디비에 업데이트
       * - Host인 경우에는 Map의 첫원소를 저장함
       */


      const user = await getUserInfo(socket.decoded_token.sub);
      const { roomId } = socket.handshake.query
      const { user_name, user_idx } = user
      const room = await getUserRoomById(roomId)
      const { id, room_id, host_user } = room;

      if(user){
        //!insert socket to roomuser
        console.log(socket.id, user_idx, room.room_id)
        await insertSocketIdToUserRoom(socket.id, user_idx, room.room_id)
      }


    //   if(!meetingRoomMap[roomname]){
    //     meetingRoomMap[roomname] = new Map();
    //     meetingRoomMap[roomname].set(socket.id, socket);
    // }
      
    //   //! 일단 client socket를 유지했으니까 테스트 하고 다시 수정함
    //   const updateSocketId = async () => { 
    //     //!Host
    //     let [row] = await db.query(sql.room.getInformationRoomByName, [roomname, username])
    //     if (row.length === 1) //host user
    //     {
    //       let [row] = await db.query(sql.room.selectRoomByUsername, [roomname, username])
    //        //첫원소의 추가함
    //       meetingRoomMap[roomname] = new Map([[socket.id, socket], ...meetingRoomMap[roomname]]);
    //       if (row.length === 0) {
    //         await db.query(sql.room.insertRoomUser, [username, roomname, 1, socket.id])

    //       } else if (row.length === 1) { //exists update by socket.id for host
    //         await db.query(sql.room.updateSocketId, [socket.id, roomname, username])
    //       }
    //     } else {
    //       //!User
    //       let [row] = await db.query(sql.room.selectRoomByUsername, [roomname, username])
    //       if (row.length === 0) {
    //         await db.query(sql.room.insertRoomUser, [username, roomname, 0, socket.id])
    //       } else if (row.length === 1) {
    //         await db.query(sql.room.updateSocketId, [socket.id, roomname, username])
    //       }
    //       meetingRoomMap[roomname].set(socket.id, socket);
    //     }
    //     //!Host인지
    //     socket.emit('connection-success', {
    //       isHost: socket.id === meetingRoomMap[roomname].entries().next().value[0],
    //       success: socket.id,
    //       peerCount: meetingRoomMap[roomname].size,
    //       // messages: messages[room],
    //     })
    //   }
    let roomname = room_id;
    if(!meetingRoomMap[roomname]){
        meetingRoomMap[roomname] = new Map();
        meetingRoomMap[roomname].set(socket.id, socket)
      }
      meetingRoomMap[roomname] = await updateSocketId(meetingRoomMap[roomname], socket, host_user )

      const roomByName = meetingRoomMap[roomname]
      // await updateSocketId();
      // console.log("socket io",meetingRoomMap)
      // socket.emit('connection-success', {
      //   isHost: socket.id === roomByName.entries().next().value[0],
      //   success: socket.id,
      //   peerCount: roomByName.size,
      // })

      socket.emit('connection-success', {
          isHost: socket.id === meetingRoomMap[roomname].entries().next().value[0],
          success: socket.id,
          peerCount: meetingRoomMap[roomname].size,
          // messages: messages[room],
      })
      // let roomByName = meetingRoomMap[roomname]
      // const broadcast = () => {
      //   const _connectedPeers = roomByName
      //   for (const [socketID, _socket] of _connectedPeers.entries()) {
      //     _socket.emit('joined-peers', {
      //       peerCount: roomByName.size, //connectedPeers.size,
      //     })
      //   }
      // }
      // broadcast()
      socket.on('disconnect',  () => {
        // connectedPeers.delete(socket.id)
        console.log("delete before", roomByName.size)
        meetingRoomMap[roomname].delete(socket.id)
        console.log("delete after", roomByName.size)
        console.log("delete socket id", socket.id)
        // messages[room] = meetingRoomMap[room].size === 0 ? null : messages[room]
        disconnectedPeer(socket.id)
      })

      //webRTC socket on handling
      socket.on('onlinePeers', (data) => webRTCSocketController.onlinePeers(socket, data, meetingRoomMap[roomname], user))
      socket.on('offer', (data) => webRTCSocketController.offer(socket, data, meetingRoomMap[roomname], user))
      socket.on('answer', (data) => webRTCSocketController.sdpAnswer(socket, data, meetingRoomMap[roomname], user))
      socket.on('candidate', (data) => webRTCSocketController.sendCandidate(socket, data, meetingRoomMap[roomname], user))

      //chat component socket on handling
      socket.on('sent-message', (data) => chatSocketController.sentMessage(socket, data, meetingRoomMap[roomname], user, room_id))
      socket.on('action_user_disable_chatting', (data) => chatSocketController.actionUserDisableChatting(socket, data, meetingRoomMap[roomname], user))
      // socket.on('sent-message', (data) => chatSocketController.sendMessage(socket, data, meetingRoomMap[roomname], user))

      //course component socket on handling
      socket.on('user-request-question', (data) => courseSocketController.userRequestQuestion(socket, data, meetingRoomMap[roomname], user))
      socket.on('user-cancel-request-question', (data) => courseSocketController.userCancelRequestQuestion(socket, data, meetingRoomMap[roomname], user))
      socket.on('user-request-lecOut', (data) => courseSocketController.userRequestOut(socket, data, meetingRoomMap[roomname], user))
      socket.on('user-cancel-request-lecOut', (data) => courseSocketController.userCancelRequestLecOut(socket, data, meetingRoomMap[roomname], user))
      socket.on('host-send-process-request', (data) => courseSocketController.actionForUserRequest(socket, data, meetingRoomMap[roomname], user))
      socket.on('host-send-warning', (data) => courseSocketController.actionWarningUser(socket, data, meetingRoomMap[roomname], user))
      socket.on('test-concentration', (data) => courseSocketController.testConcentration(socket, data, meetingRoomMap[roomname], user))
      

      const disconnectedPeer = (socketID) => {
        const _connectedPeers = meetingRoomMap[roomname]
        for (const [_socketID, _socket] of _connectedPeers.entries()) {
          _socket.emit('peer-disconnected', {
                peerCount: meetingRoomMap[roomname].size,
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
