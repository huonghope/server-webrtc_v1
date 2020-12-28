const db = require("../../config/db-connection")
const sql = require("../../../sql")

const insertTestConcentration = async (user_idx, room_id, status, message_id) => {
  try {
    const [row] = await db.query(sql.test.insertTestConcentration, [user_idx, room_id, status, message_id])
    if(row.length !== 0)
      return getTestConcentrationById(row.insertId)
  } catch (error) {
    console.log(error)
  }
}
const getTestConcentrationById = async (id) => {
  try {
    const [row] = await db.query(sql.test.getTestConcentrationById, [id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  insertTestConcentration,
}