const db = require("../../config/db-connection")
const sql = require("../../../sql")

const insertRequestQuestion = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.request.insertRequestQuestion, [user_idx, room_id, status])
    if (row.length !== 0)
      return getRequestQuestionById(row.insertId)
  } catch (error) {
    console.log(error)
  }
}
const updateRequestQuestionNearest = async (user_idx, room_id, status, endTime) => {
  try {
    const [row] = await db.query(sql.request.updateRequestQuestionNearest, [status, endTime, user_idx, room_id])
    if (row.length !== 0)
      return getRequestQuestionNearest(user_idx, room_id)
  } catch (error) {
    console.log(error)
  }
}

const insertRequestLecOut = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.request.insertRequestLecOut, [user_idx, room_id, status])
    if (row.length !== 0)
      return getRequestLecOutById(row.insertId)
  } catch (error) {
    console.log(error)
  }
}
const updateRequestLecOutNearest = async (user_idx, room_id, status, endTime) => {
  try {
    const [row] = await db.query(sql.request.updateRequestLecOutNearest, [status, endTime, user_idx, room_id])
    if (row.length !== 0)
      return getRequestLecOutNearest(user_idx, room_id)
  } catch (error) {
    console.log(error)
  }
}

//끝나상태를 제외함
const getListUserLecOut = async (room_id) => {
  try {
    const [row] = await db.query(sql.request.getListUserLecOut, [room_id])
    return row
  } catch (error) {
    console.log(error)
  }
}

//Get DATA
const getRequestLecOutById = async (id) => {
  try {
    const [row] = await db.query(sql.request.getRequestLecOutById, [id])
    if (row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const getRequestQuestionById = async (id) => {
  try {
    const [row] = await db.query(sql.request.getRequestQuestionById, [id])
    if (row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const getRequestQuestionNearest = async (user_idx, room_id) => {
  try {
    const [row] = await db.query(sql.request.getRequestQuestionNearest, [user_idx, room_id])
    if (row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}

const getRequestLecOutNearest = async (user_idx, room_id) => {
  try {
    const [row] = await db.query(sql.request.getRequestLecOutNearest, [user_idx, room_id])
    if (row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const getAllRequestLecOut = async (roomId) => {
  try {
    const [rows] = await db.query(sql.request.getAllRequestLecOut, [roomId])
    return rows
  } catch (error) {
    console.log(error)
  }
}
const getAllRequestQuestion = async (roomId) => {
  try {
    const [rows] = await db.query(sql.request.getAllRequestQuestion, [roomId])
    return rows
  } catch (error) {
    console.log(error)
  }
}
//!LIMIT 1 - 최신요청만 출력함
const getRequestQuestionByUser = async (roomId, userId) => {
  try {
    const [row] = await db.query(sql.request.getRequestQuestionNearest, [userId, roomId])
    if (row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)
  }
}
//!LIMIT 1 - 최신요청만 출력함
const getRequestLecOutByUser = async (roomId, userId) => {
  try {
    const [row] = await db.query(sql.request.getRequestLecOutNearest, [userId, roomId])
    if (row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  insertRequestQuestion,
  updateRequestQuestionNearest,
  insertRequestLecOut,
  updateRequestLecOutNearest,
  getListUserLecOut,
  getRequestLecOutNearest,
  getRequestQuestionNearest,
  getAllRequestLecOut,
  getAllRequestQuestion,
  getRequestQuestionByUser,
  getRequestLecOutByUser
}