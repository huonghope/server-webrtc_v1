const httpStatus = require('http-status');
const { omit, isArguments } = require("lodash");
const _ = require("lodash");
const multer = require("multer");
const request = require('request');

const fsExtra = require("fs-extra");
const APIError = require("../utils/APIError");
const ICETurnServer = require('../../config/ICETurnServer')

const db = require("../../config/db-connection")
const sql = require("../../../sql/index")

const _UserModel = require("../models/user.models")
const _RefreshToken = require("../models/refreshToken.model")
const _RoomModel = require('../models/room.models')
const { jwtExpirationInterval } = require("../../config/vars")
const moment = require("moment");
const compression = require('compression');

const _LmsModel = require("../models/lms.models")
const uuidv4 = require("uuid/v4");

/**
 * 강의를 개설할때 LMS부터 받은 정보들을 데이트베이서에서 자장함
 * URL를 생성한 후에 LMS를 다시 전달함
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

//!처음에 접근할떄 유저의 정보를 없으면 저장함
const getOpenSource = async (req, res, next) => {
  try {
    return res.send({
      result: true,
      data: req.querry,
      message: 'GET 데이터 전송 성공함'
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
const openCourse = async (req, res, next) => {
  const { KEY: key ,TYPE: type, USER_IDX:  user_idx,SC_CODE:  sc_code, SCHUL_CODE: schul_code, LEC_IDX: lec_idx} = req.query;

  const userResponse = await _LmsModel.requestUserInfo(user_idx, key)

  //유저 정보를 저장함
  let userInfo;
  let redirectUser;

  if(userResponse.msg === "성공")
  {
    const user = await _UserModel.getUserByUserIdx(user_idx)
    const {USER_IDX , NAME, STATUS , SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM} = userResponse.map;
    if(user){
      //유저의 정보를 이미 들어갔음
      //새 강의를 개살할 뿐만이지
      redirectUser = await _UserModel.getRedirectUserByLecIdxAndUserIdx(lec_idx, user_idx)
      if(!redirectUser){
        const redirectKey = uuidv4()
        redirectUser = await _UserModel.insertRedirectUser(lec_idx, user_idx, redirectKey)
      }
      userInfo = await _UserModel.updateUser({USER_IDX , NAME, STATUS , SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM, APP_KEY: key })

    }else{
      //!처음에 들어갈때 접근할 키를 생성하여 
      //강사는 처음 강의를 개설할때 데이터 추가함
      const redirectKey = uuidv4()
      redirectUser = await _UserModel.insertRedirectUser(lec_idx, user_idx, redirectKey)
      userInfo = await _UserModel.insertUser({USER_IDX , NAME, STATUS , SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM, APP_KEY: key})
    }
  }

  //해당하는 강의으 정보를 가져오기
  const lectureResponse = await _LmsModel.requestLectureInfo(lec_idx, key)
  let lecInfo;
  if(lectureResponse.msg === "성공")
  {
    const lecture = await _LmsModel.getLectureByLecIdx(lec_idx)
    const {SL_IDX , CLASS_TP, GRADE , CLASS_NM, LEC_TP, STU_CNT, SUBJECT_NM, LECTURE_NM, LECTURE_CNT, LECTURE_DATE, STIME, ETIME, STATUS, TEST_TP, TEST_GAP} = lectureResponse.map;
    if(!lecture){
      lecInfo = await _LmsModel.insertLecture({SL_IDX , CLASS_TP, GRADE , CLASS_NM, LEC_TP, STU_CNT, SUBJECT_NM, LECTURE_NM, LECTURE_CNT, LECTURE_DATE, STIME, ETIME, STATUS, TEST_TP, TEST_GAP, APP_KEY: key})
    }else{
      lecInfo = await _LmsModel.getLectureByLecIdx(lec_idx)
    }
  }
  try {
    if(redirectUser){
      return res.send({
        result: true,
        data: {
          url: "https://rtc.lecplanet.com",
          redirect_key : redirectUser.redirect_key,
          user_idx: userInfo.user_idx,
          sl_idx: lec_idx
          //`redirect_key=${redirectUser.redirect_key}&user_idx=${userInfo.user_idx}&sl_idx=${lec_idx}`
        },
        message: 'success'
      })
    }else{
      return res.send({
        result: false,
        data: [],
        message: '데이터 전달 실패. 전달 된 정보의 양식이 맞는 지 확인하세요'
      })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
};

module.exports = {
  getOpenSource,
  openCourse,
}