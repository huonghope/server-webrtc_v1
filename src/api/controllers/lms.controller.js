const httpStatus = require('http-status');
const { omit, isArguments } = require("lodash");
const _ = require("lodash");
const _UserModel = require("../models/user.models")
const _LmsModel = require("../models/lms.models")
const uuidv4 = require("uuid/v4");


const Logger = require('../../config/logger')
const logger = new Logger('lms-controller')
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
    logger.setLogData(req.querry)
    logger.info('request to get /lms - get open source')

    logger.info('return response to get/lms', {
      result: true,
      data: req.querry,
      message: 'GET 데이터 전송 성공함'
    })

    return res.send({
      result: true,
      data: req.querry,
      message: 'GET 데이터 전송 성공함'
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
}
const openCourse = async (req, res, next) => {
  try {
    const { KEY: key, TYPE: type, USER_IDX: user_idx, SC_CODE: sc_code, SCHUL_CODE: schul_code, LEC_IDX: lec_idx } = req.query;
    logger.setLogData(req.query)
    logger.info('request to /lms - open course', req.querry)

    const userResponse = await _LmsModel.requestUserInfo(user_idx, key)

    logger.setLogData(userResponse)
    logger.info('request to /lms - userinfo', userResponse)

    //유저 정보를 저장함
    let userInfo;
    let redirectUser;

    if (userResponse.msg === "성공") {
      const user = await _UserModel.getUserByUserIdx(user_idx)
      const { USER_IDX, NAME, STATUS, SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM } = userResponse.map;
      logger.info('request to /lms - user', user)
      if (user) {

        //유저의 정보를 이미 들어갔음
        //새 강의를 개살할 뿐만이지
        redirectUser = await _UserModel.getRedirectUserByLecIdxAndUserIdx(lec_idx, user_idx)
        if (!redirectUser) {
          const redirectKey = uuidv4()
          redirectUser = await _UserModel.insertRedirectUser(lec_idx, user_idx, redirectKey)
        }
        logger.info('request to /lms - redirectUser', redirectUser)
        userInfo = await _UserModel.updateUser({ USER_IDX, NAME, STATUS, SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM, APP_KEY: key })

      } else {
        //!처음에 들어갈때 접근할 키를 생성하여 
        //강사는 처음 강의를 개설할때 데이터 추가함
        const redirectKey = uuidv4()
        redirectUser = await _UserModel.insertRedirectUser(lec_idx, user_idx, redirectKey)
        userInfo = await _UserModel.insertUser({ USER_IDX, NAME, STATUS, SC_CODE, SCHUL_CODE, GRADE, CLASS_NM, CLASS_NO, USER_TP, SCHUL_NM, APP_KEY: key })
        logger.info('request to /lms - redirectUser', redirectUser)
      }
    }

    //해당하는 강의으 정보를 가져오기
    const lectureResponse = await _LmsModel.requestLectureInfo(lec_idx, key)
    logger.info('request to /lmn - lectureResponse', lectureResponse)
    let lecInfo;
    if (lectureResponse.msg === "성공") {
      const lecture = await _LmsModel.getLectureByLecIdx(lec_idx)
      logger.setLogData(lecture)
      const { SL_IDX, CLASS_TP, GRADE, CLASS_NM, LEC_TP, STU_CNT, SUBJECT_NM, LECTURE_NM, LECTURE_CNT, LECTURE_DATE, STIME, ETIME, STATUS, TEST_TP, TEST_GAP } = lectureResponse.map;
      
      if (!lecture) {
        lecInfo = await _LmsModel.insertLecture({ SL_IDX, CLASS_TP, GRADE, CLASS_NM, LEC_TP, STU_CNT, SUBJECT_NM, LECTURE_NM, LECTURE_CNT, LECTURE_DATE, STIME, ETIME, STATUS, TEST_TP, TEST_GAP, APP_KEY: key })
      } else {
        lecInfo = await _LmsModel.getLectureByLecIdx(lec_idx)
      }
      logger.info('request to /lms - lecInfo', lecInfo)
    }
    if (redirectUser) {
      logger.info('return response to /lms', {
        result: true,
        data: {
          url: "https://rtc1.just-link.kr",
          redirect_key: redirectUser.redirect_key,
          user_idx: userInfo.user_idx,
          sl_idx: lec_idx
        },
        message: 'success'
      })
      return res.send({
        result: true,
        data: {
          url: "https://rtc1.just-link.kr",
          redirect_key: redirectUser.redirect_key,
          user_idx: userInfo.user_idx,
          sl_idx: lec_idx
          //`redirect_key=${redirectUser.redirect_key}&user_idx=${userInfo.user_idx}&sl_idx=${lec_idx}`
        },
        message: 'success'
      })
    } else {
      logger.info('return response to /lms', {
        result: false,
        data: [],
        message: '데이터 전달 실패. 전달 된 정보의 양식이 맞는 지 확인하세요'
      })
      return res.send({
        result: false,
        data: [],
        message: '데이터 전달 실패. 전달 된 정보의 양식이 맞는 지 확인하세요'
      })
    }
  } catch (error) {
    logger.error(error)
    next(error)
  }
};

module.exports = {
  getOpenSource,
  openCourse,
}