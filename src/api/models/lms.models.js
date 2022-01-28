const httpStatus = require("http-status")
const { omitBy, isNil } = require("lodash")
const moment = require("moment-timezone")
const jwt = require('jsonwebtoken')
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');
const db = require("../../config/db-connection")
const sql = require("../../../sql")
const roles = ['user', 'admin'];
const request = require("request");
const { LMS_URL } = process.env
const requestUserInfo = (userIdx, key) => new Promise(async (resolve, reject) => {
    const o = {
      format: 'urls',
    };
    const bodyString = JSON.stringify(o);
    const host = LMS_URL;
    const path = '/LoginInfoGet.php';
    const options = {
      url: `${host}${path}`,
      method: 'get',
      qs: {
        TYPE: 'json',
        KEY: key,
        USER_IDX: userIdx
      },
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': bodyString.length,
      },
    };
      // call request to get ICE list of TURN server
    request(options, (error, res, body) => {
      if (error) {
        console.log(`Error when get User info: ${error}`);
        return reject(error);
      }
      try {
        const bodyJson = JSON.parse(body);
        resolve(bodyJson);
      } catch (error) {
        console.log(error)        
      }
    });
})

const requestLectureInfo = (lec_idx, key) => new Promise(async (resolve, reject) => {
  const o = {
    format: 'urls',
  };
  const bodyString = JSON.stringify(o);
  const host = LMS_URL;
  const path = '/LecterInfoGet.php';

  const options = {
    url: `${host}${path}`,
    method: 'get',
    qs: {
      TYPE: 'json',
      KEY: key,
      LEC_IDX: lec_idx
    },
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': bodyString.length,
    },
  };
    // call request to get ICE list of TURN server
  request(options, (error, res, body) => {
    try {
      if (error) {
        console.log(`Error when get User info: ${error}`);
        return reject(error);
      } 
      const bodyJson = JSON.parse(body);
      resolve(bodyJson);
    } catch (error) {
      return reject(error);
    }
  });
})

const insertLecture = async({SL_IDX , CLASS_TP, GRADE , CLASS_NM, LEC_TP, STU_CNT, SUBJECT_NM, LECTURE_NM, LECTURE_CNT, LECTURE_DATE, STIME, ETIME, STATUS, TEST_TP, TEST_GAP, APP_KEY}) => {
  try {
    
    const [row] = await db.query(sql.lecture.insertLecture, [SL_IDX , CLASS_TP, GRADE , CLASS_NM, LEC_TP, STU_CNT, SUBJECT_NM, LECTURE_NM, LECTURE_CNT, LECTURE_DATE, STIME, ETIME, STATUS, TEST_TP, TEST_GAP, APP_KEY])
    if(row.length !== 0)
      return getLectureByLecIdx(SL_IDX)
    return null
  } catch (error) {
    console.log(error)    
  }
}


const getLectureByLecIdx = async (lec_idx) => {
  try {
    const [row] = await db.query(sql.lecture.getLectureByLecIdx, [lec_idx])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
} 
module.exports = {
  requestUserInfo,
  requestLectureInfo,
  getLectureByLecIdx,
  insertLecture
}
