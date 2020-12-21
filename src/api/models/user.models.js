const httpStatus = require("http-status")
const { omitBy, isNil } = require("lodash")
const moment = require("moment-timezone")
const jwt = require('jsonwebtoken')
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');
const db = require("../../config/db-connection")
const sql = require("../../../sql")
const roles = ['user', 'admin'];

const transform = (user) => {
  const transformed = {};
    const fields = [
      'id',
      'firstname',
      'lastname',
    ];

    fields.forEach((field) => {
      transformed[field] = user[field];
    });

    return transformed;
}
const publicInfoTransform = (user) => {
  const transformed = {};
  const fields = ['id', 'firstname', 'lastname', 'picture'];

  fields.forEach((field) => {
    transformed[field] = user[field];
  });

  return transformed;
}
const findAndGenerateToken = async(options) =>  {
  const { email, password, refreshObject } = options;
  if (!email) {
    throw new APIError({
      message: 'An email is required to generate a token',
    });
  }

  const user = await user.findOne({ email }).exec();
  const err = {
    status: httpStatus.BAD_REQUEST,
    isPublic: true,
  };
  if (password) {
    if (user && (await user.passwordMatches(password))) {
      return { user, accessToken: user.token() };
    }
    err.message = 'Incorrect email or password';
  } else if (refreshObject && refreshObject.userEmail === email) {
    if (moment(refreshObject.expires).isBefore()) {
      err.message = 'Invalid refresh token.';
    } else {
      return { user, accessToken: user.token() };
    }
  } else {
    err.message = 'Incorrect email or refreshToken';
  }
  throw new APIError(err);
}
//이동해해 됨
const signJwtToken = (user) => {

  return new Promise((resolve, reject) => {
    const payload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: user.userId,
    };
    jwt.sign(payload, jwtSecret, (err, token) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });
}

const verifyJwtToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}
const getUserByRedirectKeyAndUserId = async (redirect_key, user_idx) => {
  const [row] = await db.query(sql.user.getUserByRedirectKeyAndUserIdx, [redirect_key, user_idx])
  if(row.length !== 0)
    return row[0]
  return null
}

const getUserByRedirectKey = async (redirect_key) => {
  const [row] = await db.query(sql.user.getUserByRedirectKey, [redirect_key])
  if(row.length !== 0)
    return row[0]
  return null
}
const getRedirectUserByLecIdxAndRedirectKey = async(lec_idx, redirect_key) => {
  const [row] = await db.query(sql.user.getRedirectUserByLecIdxAndRedirectKey, [lec_idx, redirect_key])
  if(row.length !== 0)
    return row[0]
  return null
}
const getRedirectUserByKey = async(key, lec_idx) => {
  const [row] = await db.query(sql.user.getRedirectUserByKey, [key, lec_idx])
  if(row.length !== 0)
    return row[0]
  return null
}

const getUserById = async (id) => {
  const [row] = await db.query(sql.user.getUserById, [id])
  if(row.length !== 0)
    return row[0]
  return null
}
const insertUser = async ({USER_IDX, NAME, STATUS, USER_TP, SCHUL_NM, GRADE,CLASS_NM , CLASS_NO, SC_CODE, SCHUL_CODE, APP_KEY}) => {
  try {
    const [row] = await db.query(sql.user.insertUser, [USER_IDX, NAME, STATUS, USER_TP, SCHUL_NM, GRADE,CLASS_NM , CLASS_NO, SC_CODE, SCHUL_CODE, APP_KEY])
    if(row.length !== 0)
      return getUserById(row.insertId)
    return null
  } catch (error) {
    console.log(error)    
  }
}
const insertRedirectUser = async (lec_idx, user_idx, key) => {
  try {
    const [row] = await db.query(sql.user.insertRedirectUser, [lec_idx, user_idx, key])
    if(row.length !== 0)
      return getRedirectUserByLecIdxAndUserIdx(lec_idx, user_idx)
    return null
  } catch (error) {
    console.log(error)    
  }
}
const getRedirectUserByLecIdxAndUserIdx = async (lec_idx, user_idx) => {
  try {
    const [row] = await db.query(sql.user.getRedirectUserByLecIdxAndUserIdx, [lec_idx, user_idx])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}


const updateUser = async ({USER_IDX, NAME, STATUS, USER_TP, SCHUL_NM, GRADE,CLASS_NM , CLASS_NO, SC_CODE, SCHUL_CODE, APP_KEY}) => {
  const [row] = await db.query(sql.user.updateUser, [NAME, STATUS, USER_TP, SCHUL_NM, GRADE,CLASS_NM , CLASS_NO, SC_CODE, SCHUL_CODE, APP_KEY, USER_IDX])
  if(row.length !== 0)
    return getUserByUserIdx(USER_IDX)
  return null
}

const getUserByUserIdx = async (user_idx) => {
  try {
    const [row] = await db.query(sql.user.selectUserByUserIdx, [user_idx])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}
module.exports = {
  roles,
  findAndGenerateToken,
  publicInfoTransform,
  signJwtToken,
  verifyJwtToken,
  updateUser,
  getUserByUserIdx,
  insertUser,
  getUserByRedirectKeyAndUserId,
  getUserByRedirectKey,
  insertRedirectUser,
  getRedirectUserByLecIdxAndUserIdx,
  getRedirectUserByLecIdxAndRedirectKey,
  getRedirectUserByKey
}
