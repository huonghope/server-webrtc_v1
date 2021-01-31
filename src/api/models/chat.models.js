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

const insertChatFile = async (user_idx, message, type, room_id, file_id) => {
  try {
    const [row] = await db.query(sql.chat.insertChatFile, [user_idx, message, type, room_id, file_id])
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
const updateDisableChat = async (user_idx, room_id, status) => {
  try {
    const [row] = await db.query(sql.chat.updateDisableChat, [status, user_idx, room_id])
    if(row.length !== 0)
      return getChatById(row.insertId)
  } catch (error) {
    console.log(error) 
  }
}
const insertUpFile = async(filename, path, room_id, user_idx, size, mimetype) => {
  try {
    const [row] = await db.query(sql.chat.insertUpFile, [filename, path, room_id, user_idx, size, mimetype])
    if(row.length !== 0)
      return getFileInfoById(row.insertId)
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
const getFileInfoById = async (id) => {
  try {
    const [row] = await db.query(sql.chat.getFileInfoById, [id])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const getDisableChat = async(userId, roomId) => {
  try {
    const [row] = await db.query(sql.chat.getDisableChat, [userId, roomId])
    if(row.length !== 0)
      return row[0]
  } catch (error) {
    console.log(error)
  }
}
const getListMessageByRoomIdAndUserId = async(room_id, user_idx) => {
  try {
    const [row] = await db.query(sql.chat.getListMessageByRoomIdAndUserId, [room_id, user_idx])
    return row
  } catch (error) {
    console.log(error)
  }
}
const getListMessageByRoomIdForStudent = async(room_id, user_idx, host_user_id) => {
  try {
    const [row] = await db.query(sql.chat.getListMessageByRoomIdForStudent, [room_id, user_idx, host_user_id])
    return row
  } catch (error) {
    console.log(error)
  }
}
const getListMessageByRoomId = async(room_id) => {
  try {
    const [row] = await db.query(sql.chat.getListMessageByRoomId, [room_id])
    return row
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
  getListMessageByRoomIdAndUserId,
  getListMessageByRoomId,
  insertUpFile,
  insertChatFile,
  getFileInfoById,
  getListMessageByRoomIdForStudent,
  getDisableChat,
  updateDisableChat
}