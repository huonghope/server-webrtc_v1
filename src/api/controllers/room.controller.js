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
const { jwtExpirationInterval } = require("../../config/vars")
const moment = require("moment");
const user = require('../../../sql/user');


const { meetingRoomMap } = require ('../sockets')
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
 * 강죄를 생성함
 * @public
 */

//새로 Token를 생성함
//Tokens 저장함
//! 유저를 정보를 뭘 다시 보내는지 정할 필요함
const test = async (req, res, next) => {
  



    // //강사또는 0 이상 접근한 학생
    // if(userInfo){
    //   const lecInfo = await _LectureModel.getLectureByLecIdx(sl_idx)
    //   if(lecInfo)
    //   {
    //     const { user_tp, user_idx } = userInfo;
    //     if(user_tp === "T"){
    //       //강사인 경우에는 처음에 방이 없으면 방이 생성함  
    //       const [roomInfo] = await _RoomModel.getRoomByLecIdxAndUserIdx(lecInfo.lex_idx, user_idx)
    //       if(roomInfo.length !== 0){
    //         const insertRoom = await _RoomModel.insertRoom(user_idx, lecInfo.lex_idx, lecInfo.lecture_nm)
    //         const insertUserRoom = await _RoomModel.insertUserRoom(user_idx, insertRoom.id, 1)
    //         console.log(insertUserRoom)
    //       }
    //       else{
    //         const insertUserRoom = await _RoomModel.insertUserRoom(user_idx, roomInfo[0].id, 1)
    //         console.log(insertUserRoom)
    //       }
    //     }else{
    //       const insertUserRoom = await _RoomModel.insertUserRoom(user_idx, roomInfo[0].id, 0)
    //     }
    
    //     //insert room
    
    //     //insert user-room
    //     // await _RoomModel.insertUserRoom({roomname, username, hostroom: 1})
    
    //     const userInfoToken = {
    //       userId: userInfo.user_idx,
    //       userName: userInfo.user_name,
    //       userTp: userInfo.user_tp
    //     }
    //     const token = generateTokenResponse(userInfoToken, await _UserModel.signJwtToken(userInfoToken));
    
    
    //     return res.send({
    //       result: true,
    //       data: { token, userInfoToken, roomInfo},
    //       message: '미팅 방 만들기 성공함 '
    //     })

    //   }else{
    //     return res.send({
    //       result: true,
    //       data: [],
    //       message: '강의가 존재하지 않음'
    //     })
    //   }

    // }else{  
    //   //처음 접근한 학생이 또는 틀린정보




    //   return res.send({
    //     result: false,
    //     data: [],
    //     message: '유저 인증 실패합니다'
    //   })
    // }
  
};

/**
 * 해당하는 방의 정보를 출력함
 * @public
 */
const getInfoRoom = async(req, res, next) => {
  try {
    const { usr_id , userId } = req.query;
    let [row] = await db.query(sql.room.selectUserRoomByIdAndUserId, [usr_id, userId])
    if(row.length === 1){
        //host user name array value 0
        let [rows] = await db.query(sql.room.getListUserByRoomId, [row[0].room_id])
        res.send({
            result: true,
            data: rows,
            message: '해당하는 유저는 '
        })
    }else{
        res.send({
            result: true,
            data: [],
            message: '해당하는 유저는 방에 존재하지 않음'
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
const joinRoom = async(req, res, next) =>
{
  try {
    const { roomname } = req.body;
    const room = await _RoomModel.getRoomByRoomName(roomname)
    if(room){
      const [user] = await _UserModel.getUserById(req.user.id);

      //!
      await _RoomModel.insertUserRoom({roomname, username:  user.username, hostroom: 0})
      return res.status(200).send({
        result: true,
        data: {
          user,
          roomname
        },
        message: '강죄를 참여 성공함'
      })
    }else{
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

const upFile =  async(req, res, next) => {

  const { user_idx, user_name } = req.user;
  console.log(user_idx)
  const files  = req.files || 'NULL';
  var data = JSON.parse(req.body.params);
  const { userRoomId } = data;
  const { room_id }  = await _RoomModel.getUserRoomById(userRoomId)
  const _connectedPeers = meetingRoomMap[room_id];
  const {originalname, size, mimetype } = files[0];
  for (const [socketID, _socket] of _connectedPeers.entries()) {
      _socket.emit('res-sent-files', {
          senderId: user_idx, 
          senderName: user_name,
          originalname: originalname,
          size: size,
          mimetype: mimetype,
          fileHash: `files/${files[0].filename}`, 
      })
  }
}
const createRoom = async (req, res, next) => {
  try {
    const { user_idx, user_tp  } = req.user;
    const { lec_idx, redirect_key } = req.body;
    //강사인 경우에는 새로 방을 만들어짐
    const lectureInfo = await _LectureModel.getLectureByLecIdx(lec_idx)
    const redirectInfo = await _UserModel.getRedirectUserByKey(redirect_key, lec_idx)

    //! 다시접근할떄 어떻게 예외처리 필요함
    if(user_tp === "T" && lectureInfo && redirectInfo){ 
      //!3개 추가해야 함 - 컴퓨터 2개 및 모바일 1개
      //강사라면 방을 생성하고 User-room 추가함 
      const room = await _RoomModel.insertRoom(user_idx, lec_idx, lectureInfo.lecture_nm, redirectInfo.id)
      const userroom = await _RoomModel.insertUserRoom(user_idx, room.id, 1)
      return res.status(200).send({
        result: true,
        data:  { 
          room,
          usr_id: userroom.id
        },
        message: '방을 생성 성공'
      })
    }else if (user_tp === "S" && lectureInfo && redirectInfo){ 
      //학생인 경우에는
      //가장 최근에 해당하는 강의를 만들 강좌를 추가함
      //!room는 강사의 정보임
      const room = await _RoomModel.getNearestRoom(redirectInfo.id)
      let userRoom = await _RoomModel.getUserRoomByRoomIdAndUserId(room.id, user_idx)
      if(!userRoom)
      {
        userRoom = await _RoomModel.insertUserRoom(user_idx, room.id, 0)
      }
      return res.status(200).send({
        result: true,
        data:  { 
          room,
          usr_id: userRoom.id
        },
        message: '방을 참여 성공'
      })
    }else{
      return res.status(200).send({
        result: false,
        data: room,
        message: '강죄를 존재하지 않으니 방 생성 오류'
      })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
}
//!refactor sql query
const getLectureInfo = async (req, res, next) => {
  const { userroom_id } = req.query
  const { room_id } = await _RoomModel.getUserRoomById(userroom_id)
  const { lec_idx } = await _RoomModel.getRoomById(room_id)
  const lecInfo = await _LectureModel.getLectureByLecIdx(lec_idx)
  try{
    return res.status(200).send({
      result: false,
      data: lecInfo,
      message: '해당하는 방의 강의 리스트'
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
  getLectureInfo
}