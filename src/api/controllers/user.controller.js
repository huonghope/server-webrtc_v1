const httpStatus = require('http-status');
const { omit } = require("lodash");
const _ = require("lodash");
const multer = require("multer");
const fsExtra = require("fs-extra");
const APIError = require("../utils/APIError");
const ICETurnServer = require('../../config/ICETurnServer')

const _UserModel = require('../models/user.models')
const _RefreshToken = require("../models/refreshToken.model")
const _RoomModel = require('../models/room.models')
const _LectureModel = require('../models/lms.models')
const { jwtExpirationInterval } = require("../../config/vars")
const moment = require("moment");
const { checkLectureAPI } = require('../models/helper.models');
const Logger = require("../../config/logger")
const logger = new Logger('user-controller')


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
 * 해당하는 유저의 정보를 출력함
 * @public
 */
exports.getCurrentUser = async (req, res) => {
  const user = await _UserModel.getUserByUserIdx(req.user.user_idx);
  return res.json({
    data: user
  });
};

exports.checkConnecting = async (req, res) => {
  try {
    const { userRoomId } = req.query
    const user = await _RoomModel.getUserRoomById(userRoomId);
    return res.json({
      result: true,
      data: user,
      message: '룸유저의 정보'
    });
  } catch (error) {
    return res.json({
      result: false,
      data: [],
      message: '룸유저의 정보 출력 오류'
    });
  }
}

//처음에 유저를 정보를 보내서 token를 생성함
/**
 * 
 * @param {*} redirect_key: 접근하는키 
 * @param {*} sl_idx: 강의의 일련번호
 * @param {*} user_idx: 유저의 일련번호
 * 
 */
exports.configUser = async (req, res) => {
  try {
    const {redirect_key, sl_idx, user_idx } = req.query;
    logger.setLogData(req.query)
    logger.info('request to /user ', {redirect_key, sl_idx, user_idx})

    let getRedirectUser = await _UserModel.getRedirectUserByLecIdxAndRedirectKey(sl_idx,redirect_key)
    
    //전달 접근키 및 강의일변호 맞는지
    if(getRedirectUser)
    {
      logger.info('request to /user redirect-key', getRedirectUser)
      let userInfo = await _UserModel.getUserByUserIdx(user_idx)
      //!강사 또는 1번이상 접근한 일발 유저
      if(userInfo){
        //유저의 정보를 한번 다시 업데이트
        let app_key = userInfo.app_key

        console.log(user_idx, app_key)
        userInfo = await _LectureModel.requestUserInfo(user_idx, app_key)

        console.log(userInfo)
        const {USER_IDX , NAME, STATUS , SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM} = userInfo.map;
        userInfo = await _UserModel.updateUser({USER_IDX , NAME, STATUS , SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM, APP_KEY: app_key})

        const userInfoToken = {
          userId: userInfo.user_idx,
          userName: userInfo.user_name,
          userTp: userInfo.user_tp
        }

        logger.setLogData(userInfo)
        logger.info('return response /user teacher',{ userInfoToken })
        const token = generateTokenResponse(userInfoToken, await _UserModel.signJwtToken(userInfoToken));
        return res.send({
          result: true,
          data: { token, userInfoToken },
          message: '접근 권한 확인 성공'
        })
        
      }else{ 
        //!학생은 처음에 접근할떄
        const hostUser = await _UserModel.getUserByUserIdx(getRedirectUser.user_idx);
        let userInfo = await _LectureModel.requestUserInfo(user_idx, hostUser.app_key);
        console.log("user Info", userInfo)
        if(checkLectureAPI(userInfo)) //성공함
        {
          console.log("user Info", userInfo)
          const {USER_IDX , NAME, STATUS , SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM} = userInfo.map;
          userInfo = await _UserModel.insertUser({USER_IDX , NAME, STATUS , SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM, APP_KEY: hostUser.app_key})
          logger.setLogData(userInfo)
          if(userInfo){
            const userInfoToken = {
              userId: userInfo.user_idx,
              userName: userInfo.user_name,
              userTp: userInfo.user_tp
            }
            const token = generateTokenResponse(userInfoToken, await _UserModel.signJwtToken(userInfoToken));
            logger.info('return response /user - student', userInfoToken)
            return res.send({
              result: true,
              data: { token, userInfoToken },
              message: '접근 권한 확인 성공'
            })
          }
        }else{
          logger.info('return reponse /user', {message: '접근 권한 확인 실패, 유저 확인 실패'})
          return res.send({
            result: false,
            data: [],
            message: '접근 권한 확인 실패, 유저 확인 실패'
          })
        }
      }
    }else{
      logger.info('return response /user', {
        result: false,
        data: [],
        message: '접근 권한 확인 실패, 접근키 및 강의 일련번호 동일하지 않음'
      })
      return res.send({
        result: false,
        data: [],
        message: '접근 권한 확인 실패, 접근키 및 강의 일련번호 동일하지 않음'
      })
    }
  } catch (error) {
    console.log(error)
    logger.info(error)
    return res.json({
      result: false,
      data: [],
      message: '서버 오류 발생합니다.'
    });
  }
}

exports.iceServerList = async (req, res, next) => {
  ICETurnServer()
    .then((iceServer) => res.json({ ice: iceServer }))
    .catch((err) => next(err));
}
