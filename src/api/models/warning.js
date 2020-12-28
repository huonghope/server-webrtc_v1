const db = require("../../config/db-connection")
const sql = require("../../../sql")

const insertWarning = async (user_idx, room_id, message_id) => {
  try {
    const [row] = await db.query(sql.warning.insertWarning, [user_idx, room_id, message_id])
    if(row.length !== 0)
      return getWarningById(row.insertId)
  } catch (error) {
    console.log(error)
  }
}

const getWarningById = async (id) => {
  try {
    const [row] = await db.query(sql.warning.getWarningById, [id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error) 
  }
}

module.exports = {
  insertWarning,
}