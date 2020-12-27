const db = require("../../config/db-connection")
const sql = require("../../../sql")

const insertRequestQuestion = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.request.insertRequestQuestion, [user_idx, room_id, status])
    if(row.length !== 0)
      return getRequestQuestionById(row.insertId)
  } catch (error) {
    console.log(error)
  }
}
const updateRequestQuestionNearest = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.request.updateRequestQuestionNearest, [status, user_idx, room_id])
    if(row.length !== 0)
      return getRequestQuestionNearest(user_idx, room_id)
  } catch (error) {
    console.log(error)
  }
}

const insertRequestLecOut = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.request.insertRequestLecOut, [user_idx, room_id, status])
    if(row.length !== 0)
      return getRequestLecOutById(row.insertId)
  } catch (error) {
    console.log(error)
  }
}
const updateRequestLecOutNearest = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.request.updateRequestLecOutNearest, [status, user_idx, room_id])
    if(row.length !== 0)
      return getRequestLecOutNearest(user_idx, room_id)
  } catch (error) {
    console.log(error)
  }
}

//Get DATA
const getRequestLecOutById = async (id) => {
  try {
    const [row] = await db.query(sql.request.getRequestLecOutById, [id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const getRequestQuestionById = async (id) => {
  try {
    const [row] = await db.query(sql.request.getRequestQuestionById, [id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const getRequestQuestionNearest = async (user_idx, room_id) => {
  try {
    const [row] = await db.query(sql.request.getRequestQuestionNearest, [user_idx, room_id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
} 

const getRequestLecOutNearest = async (user_idx, room_id) => {
  try {
    const [row] = await db.query(sql.request.getRequestLecOutNearest, [user_idx, room_id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  insertRequestQuestion,
  updateRequestQuestionNearest,
  insertRequestLecOut,
  updateRequestLecOutNearest
}