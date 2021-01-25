const httpStatus = require('http-status');
const { omit, isArguments } = require("lodash");
const _ = require("lodash");


const fsExtra = require("fs-extra");
const APIError = require("../utils/APIError");
const ICETurnServer = require('../../config/ICETurnServer')

const db = require("../../config/db-connection")
const sql = require("../../../sql/index")

const _UserModel = require("../models/user.models")
const _RefreshToken = require("../models/refreshToken.model")
const _RoomModel = require('../models/room.models')
const _LectureModel = require('../models/lms.models')
const _TestModel = require('../models/test_concentration')
const _ChatModel = require('../models/chat.models')
const { jwtExpirationInterval } = require("../../config/vars")
const moment = require("moment");
const user = require('../../../sql/user');
const { checkHostBySocketId } = require("../models/helper.models")

const { meetingRoomMap } = require('../sockets');
const lecture = require('../../../sql/lecture');
/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = _RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * 해당하는 방의 정보를 출력함
 * @public
 */
const getInfoRoom = async (req, res, next) => {
  try {
    const { usr_id, userId } = req.query;
    let [row] = await db.query(sql.room.selectUserRoomByIdAndUserId, [usr_id, userId])
    if (row.length === 1) {
      //host user name array value 0
      let [rows] = await db.query(sql.room.getListUserByRoomId, [row[0].room_id])
      let responseUserList = rows.filter(user => (user.user_tp !== 'T' && user.user_tp !== 'I'))
      res.send({
        result: true,
        data: responseUserList,
        message: '해당하는 유저의 방의 정보를 출력함'
      })
    } else {
      res.send({
        result: true,
        data: [],
        message: '해당하는 유저의 방이 존재하지 않음'
      })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
}

/**
 * 해당하는 강죄를 참여
 * 해당하는 강죄를 있는지 없는 체크필요함
 */
const joinRoom = async (req, res, next) => {
  try {
    const { roomname } = req.body;
    const room = await _RoomModel.getRoomByRoomName(roomname)
    if (room) {
      const [user] = await _UserModel.getUserById(req.user.id);
      //!
      await _RoomModel.insertUserRoom({ roomname, username: user.username, hostroom: 0 })
      return res.status(200).send({
        result: true,
        data: {
          user,
          roomname
        },
        message: '강죄를 참여 성공함'
      })
    } else {
      return res.status(200).send({
        result: false,
        data: null,
        message: '강죄가 없음'
      })
    }

  } catch (error) {
    console.log(error)
    next(error)
  }

}

const upFile = async (req, res, next) => {
  const { user_idx, user_name } = req.user;
  const files = req.files || 'NULL';
  var data = JSON.parse(req.body.params);
  const { userRoomId } = data;
  const { room_id, socket_id } = await _RoomModel.getUserRoomById(userRoomId)
  const _connectedPeers = meetingRoomMap[room_id];

  const { originalname, size, mimetype } = files[0];
  let FileInfo = await _ChatModel.insertUpFile(originalname, `files/${files[0].filename}`, room_id, user_idx, size, mimetype)

  let newMessage = await _ChatModel.insertChatFile(user_idx, "", "file", room_id, FileInfo.id)
  let resMessage = await _ChatModel.convertResponseMessage(newMessage)

  resMessage.sender.username = user_name
  resMessage.data.file = {
    id: FileInfo.id,
    originalname: originalname,
    size: size,
    mimetype: mimetype,
    fileHash: `files/${files[0].filename}`,
  }

  if (checkHostBySocketId(_connectedPeers, socket_id)) {
    for (let [socketID, socket] of _connectedPeers.entries()) {
      socket.emit('res-sent-message', resMessage)
    }
  } else {
    const [_socketID, _socket] = _connectedPeers.entries().next().value
    _socket.emit('res-sent-message', resMessage)
    for (let [socketID, socket] of _connectedPeers.entries()) {
      if (socketID === socket_id) {
        socket.emit('res-sent-message', resMessage)
      }
    }
  }
}

//방의 상태를 체그하고 
/**
 * 강죄를 정보를 받아서
 * 만약에 방을 생성했으면 해당하는 방을 들어감
 * 또는 방을 생성하지 않으면 새로 방을 하나 생성함 
 */
const createRoom = async (req, res, next) => {
  try {
    const { user_idx, user_tp } = req.user;
    const { lec_idx, redirect_key, isMobile } = req.body;

    //강사인 경우에는 새로 방을 만들어짐
    //강의 정보를 출력함
    const lectureInfo = await _LectureModel.getLectureByLecIdx(lec_idx)
    //해당하는 강의는 redirect의 key 맞는지 검삭
    const redirectInfo = await _UserModel.getRedirectUserByKey(redirect_key, lec_idx)
    //! 다시접근할떄 어떻게 예외처리 필요함
    //해당하는 유저는 선생님이나 강사인 경우 및 강의 정보 있고 redirect_key 있음
    if ((user_tp === "T" || user_tp === "I") && lectureInfo && redirectInfo) {
      //강의 체크함
      //접근한 기계를 방을 생성헀는지안 했는지 확인함
      let userRoomAndRoomInfo = await _RoomModel.getUserRoomNearestToday(user_idx, lec_idx)
      //오늘 만든 강으가 있는 경우에는
      if (userRoomAndRoomInfo) {
        const { status } = userRoomAndRoomInfo
        const room = await _RoomModel.getRoomById(userRoomAndRoomInfo.room_id)
        //!MOBILE
        //다름 경우에는
        //강의 질행하고 있는 경우에는
        //유저 방을 다시 보냄
        if (status === '1') {
          return res.status(200).send({
            result: true,
            data: {
              room,
              usr_id: userRoomAndRoomInfo.id
            },
            message: '방을 생성 성공'
          })
        } else {
          //강의는 끝났음
          return res.status(200).send({
            result: false,
            data: [],
            message: '방을 생성 성공'
          })
        }
      } 
      //없으면 생성함
      const room = await _RoomModel.insertRoom(user_idx, lec_idx, lectureInfo.lecture_nm, redirectInfo.id, lectureInfo.stime, lectureInfo.etime)

      //1인경우에는 HOST임
      const userroom = await _RoomModel.insertUserRoom(user_idx, room.id, 1, isMobile)
      return res.status(200).send({
        result: true,
        data: {
          room,
          usr_id: userroom.id,
          isMobile
        },
        message: '방을 생성 성공'
      })
    } else if ((user_tp === "S" || user_tp === "G") && lectureInfo && redirectInfo) {
      //학생이 처음에 들어가거나 나갈떄 처음에 들어감
      let userRoomAndRoomInfo = await _RoomModel.getUserRoomNearestToday(user_idx, lec_idx)
      if (userRoomAndRoomInfo) {
        let room = await _RoomModel.getRoomById(userRoomAndRoomInfo.room_id)
        //해당하는 강죄를 진행중이라고 합니다.
        if (userRoomAndRoomInfo.status === '1') {
          return res.status(200).send({
            result: true,
            data: {
              room,
              usr_id: userRoomAndRoomInfo.id
            },
            message: '방을 참여 성공'
          })
        } else {
          //강의 열어지 않음
          //0라면 수업을 끝났음
          return res.status(200).send({
            result: false,
            data: [],
            message: '강죄를 존재하지 않으니 방 생성 오류'
          })
        }
      } else {
        //하루에 처음에 들어감
        const room = await _RoomModel.getNearestRoom(redirectInfo.id)

        //0인 경우에는 HOST 아님
        let userRoom = await _RoomModel.insertUserRoom(user_idx, room.id, 0, isMobile)
        return res.status(200).send({
          result: true,
          data: {
            room,
            usr_id: userRoom.id
          },
          message: '방을 참여 성공'
        })
      }
    } else {
      return res.status(200).send({
        result: false,
        data: [],
        message: '강죄를 존재하지 않으니 방 생성 오류'
      })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// //방의 상태를 체그하고 
// /**
//  * 강죄를 정보를 받아서
//  * 만약에 방을 생성했으면 해당하는 방을 들어감
//  * 또는 방을 생성하지 않으면 새로 방을 하나 생성함 
//  */
// const createRoom = async (req, res, next) => {
//   try {
//     const { user_idx, user_tp } = req.user;
//     const { lec_idx, redirect_key, isMobile } = req.body;

//     //강사인 경우에는 새로 방을 만들어짐
//     //강의 정보를 출력함
//     const lectureInfo = await _LectureModel.getLectureByLecIdx(lec_idx)

//     //해당하는 강의는 redirect의 key 맞는지 검삭
//     const redirectInfo = await _UserModel.getRedirectUserByKey(redirect_key, lec_idx)

//     //! 다시접근할떄 어떻게 예외처리 필요함
//     //해당하는 유저는 선생님이나 강사인 경우 및 강의 정보 있고 redirect_key 있음
//     if ((user_tp === "T" || user_tp === "I") && lectureInfo && redirectInfo) {

//       //강의 체크함
//       //접근한 기계를 방을 생성헀는지안 했는지 확인함
//       let userRoomAndRoomInfo = await _RoomModel.getUserRoomNearestToday(user_idx, lec_idx, Number(isMobile))
//       //접근한 기계는 해당하는 강의를 이미 생성했음
//       if (userRoomAndRoomInfo) {

//         const { status } = userRoomAndRoomInfo
//         const room = await _RoomModel.getRoomById(userRoomAndRoomInfo.room_id)
//         //!MOBILE
//         //다름 경우에는
//         //강의 질행하고 있는 경우에는
//         if (status === '1') {
//           return res.status(200).send({
//             result: true,
//             data: {
//               room,
//               usr_id: userRoomAndRoomInfo.id
//             },
//             message: '방을 생성 성공'
//           })
//         } else {
//           //강의는 끝났음
//           return res.status(200).send({
//             result: false,
//             data: [],
//             message: '방을 생성 성공'
//           })
//         }
//       } else {
//         //!접근한 기계를 해당하는 강의는 없습니다.
//         //!다른 기계를 들어가면 유저 하나 더 추가할 예정함
//         //!진행중 이라면 해당하는 방을 들어감
//         //!유저의 방을 생성했는지 안 했는지 체크함
//         //!또는 생생했는데 다른 기계를 접근함
//         let userRoomAndRoomInfo = await _RoomModel.getUserRoomNearestToday(user_idx, lec_idx)
//         if(!userRoomAndRoomInfo){
//             const room = await _RoomModel.insertRoom(user_idx, lec_idx, lectureInfo.lecture_nm, redirectInfo.id, lectureInfo.stime, lectureInfo.etime)
//             const userroom = await _RoomModel.insertUserRoom(user_idx, room.id, 1, isMobile)
//             return res.status(200).send({
//               result: true,
//               data: {
//                 room,
//                 usr_id: userroom.id,
//                 isMobile
//               },
//               message: '방을 생성 성공'
//             })
//         }else{
//           //생성했는데 다른 기계로 접근함
//           const room = await _RoomModel.getRoomById(userRoomAndRoomInfo.room_id)
//           const userroom = await _RoomModel.insertUserRoom(user_idx, room.id, 1, isMobile)
//           return res.status(200).send({
//             result: true,
//             data: {
//               room,
//               usr_id: userroom.id,
//               isMobile
//             },
//             message: '방을 생성 성공'
//           })
//         }
//       }
//     } else if ((user_tp === "S" || user_tp === "G") && lectureInfo && redirectInfo) {
//       //학생이 처음에 들어가거나 나갈떄 처음에 들어감
//       let userRoomAndRoomInfo = await _RoomModel.getUserRoomNearestCurrentDay(user_idx, lec_idx)
//       if (userRoomAndRoomInfo) {
//         let room = await _RoomModel.getRoomById(userRoomAndRoomInfo.room_id)

//         //해당하는 강죄를 진행중이라고 합니다.
//         if (userRoomAndRoomInfo.status === '1') {
//           return res.status(200).send({
//             result: true,
//             data: {
//               room,
//               usr_id: userRoomAndRoomInfo.id
//             },
//             message: '방을 참여 성공'
//           })
//         } else {
//           //강의 열어지 않음
//           //0라면 수업을 끝났음
//           return res.status(200).send({
//             result: false,
//             data: [],
//             message: '강죄를 존재하지 않으니 방 생성 오류'
//           })
//         }
//       } else {

//         //하루에 처음에 들어감
//         const room = await _RoomModel.getNearestRoom(redirectInfo.id)
//         let userRoom = await _RoomModel.insertUserRoom(user_idx, room.id, 0)
//         return res.status(200).send({
//           result: true,
//           data: {
//             room,
//             usr_id: userRoom.id
//           },
//           message: '방을 참여 성공'
//         })
//       }
//     } else {
//       return res.status(200).send({
//         result: false,
//         data: [],
//         message: '강죄를 존재하지 않으니 방 생성 오류'
//       })
//     }
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// }
//!refactor sql query
const getLectureInfo = async (req, res, next) => {
  const { userroom_id } = req.query
  const { room_id } = await _RoomModel.getUserRoomById(userroom_id)
  const { lec_idx } = await _RoomModel.getRoomById(room_id)
  let lecInfo = await _LectureModel.getLectureByLecIdx(lec_idx)
  if (room_id && lec_idx) {
    const { test_gap } = lecInfo
    let convertTime = test_gap === "01" ? 10 : test_gap === "02" ? 20 : test_gap === "03" ? 30 : 40;
    lecInfo = { ...lecInfo, test_gap_time: convertTime }
    try {
      return res.status(200).send({
        result: false,
        data: lecInfo,
        message: '해당하는 강죄릐 정보를 출력함'
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  } else {
    console.log(error)
    next(error)
  }
}
const upTestConcentration = async (req, res, next) => {
  try {
    const { user_idx, user_name } = req.user;
    const { userRoomId, status } = req.body;
    const { room_id } = await _RoomModel.getUserRoomById(userRoomId)
    const _connectedPeers = meetingRoomMap[room_id];
    const [_socketID, _socket] = _connectedPeers.entries().next().value
    let newMessage = await _ChatModel.insertChat(user_idx, "", "test_Concentration", room_id)
    const test = await _TestModel.insertTestConcentration(user_idx, room_id, status, newMessage.id)
    if (!status) {
      let resMessage = await _ChatModel.convertResponseMessage(newMessage)
      resMessage.sender.username = user_name
      resMessage.type = "test-concentration-fail";
      _socket.emit('alert-host-test-concentration-fail', resMessage)
    }
    return res.status(200).send({
      result: false,
      data: [],
      message: '집중 테스트 입력 완료'
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

const iceServerList = async (req, res, next) => {
  ICETurnServer()
    .then((iceServer) => res.json({ ice: iceServer }))
    .catch((err) => next(err));
}

module.exports = {
  getInfoRoom,
  createRoom,
  iceServerList,
  upFile,
  getLectureInfo,
  upTestConcentration
}
