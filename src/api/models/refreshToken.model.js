const crypto = require('crypto');
const moment = require('moment-timezone');
const db = require("../../config/db-connection")
const sql = require("../../../sql")


const insertRefreshToken = async ({token, userId, expires}) => {
  try {
    const [row] = await db.query(sql.user.insertRefreshToken,[token, userId, expires])
    if(row.length !== 0)
      return row
    return null
  } catch (error) {
    console.log(error)
  }
}

/**
 * Refresh Token Schema
 * @private
 */
const generate = (user) => {
  // const userId = user.id;
  // const userEmail = user.email;
  // const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
  // const expires = moment().add(30, 'days').toDate();
  // const tokenObject = new RefreshToken({
  //   token, userId, userEmail, expires,
  // });
  // tokenObject.save();
  const token = `${user.userId}.${crypto.randomBytes(40).toString('hex')}`;
  const expires = moment().add(30, 'days').toDate();
  const tokenObject = {
    token, 
    userId: user.userId, 
    expires,
  };
  // insertRefreshToken(tokenObject)
  return tokenObject;
}

module.exports = {
  generate
}