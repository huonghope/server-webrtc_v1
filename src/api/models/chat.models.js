const db = require("../../config/db-connection")
const sql = require("../../../sql")

const insertChat = async (user_idx, message, type, room_id) => {
  try {
    const [row] = await db.query(sql.chat.insertChat, [user_idx, message, type, room_id])
    if(row.length !== 0)
      return getChatById(row.insertId)
  } catch (error) {
    console.log(error)
  }
}
const insertDisableChat = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.chat.insertDisableChat, [user_idx, room_id, status])
    if(row.length !== 0)
      return getChatById(row.insertId)
  } catch (error) {
    console.log(error) 
  }
}

const getChatById = async (id) => {
  try {
    const [row] = await db.query(sql.chat.getChatById, [id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const convertResponseMessage = async (message) => {
  try {
    if(message)
    {
      let resultMessage = {
        type: message.type,
        data: {
          id: message.id,
          message: message.message,
          roomId: message.room_id,
          timestamp: message.timestamp
        }, 
        sender: {
          uid: message.user_idx
        }
      }    

      return resultMessage;
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  insertChat,
  insertDisableChat,
  convertResponseMessage,
}