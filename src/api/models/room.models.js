const db = require("../../config/db-connection")
const sql = require("../../../sql")

const insertRoom = async (user_id, lec_id, room_name, redirect_id, s_time, e_time) => {
  try {
    const [row] = await db.query(sql.room.insertRoom, [user_id, lec_id, room_name,redirect_id, s_time, e_time])
    if(row.length !== 0)
      return getRoomById(row.insertId)
    return null
  } catch (error) {
    console.log(error)    
  }
}
const insertUserRoom = async(user_idx, room_id, host_user, device) => {
  try {
    const [row] = await db.query(sql.room.insertUserRoom, [user_idx, room_id , host_user, device])
    if(row.length !== 0)
      return getUserRoomById(row.insertId)
    return null
  } catch (error) {
    console.log(error)    
  }
}
const selectUserRoomByIdAndUserId = async (userRoomId, userId) => {
  try {
    const [row] = await db.query(sql.room.selectUserRoomByIdAndUserId, [userRoomId, userId])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}

const updateStateForUserRoom = async(userRoomId, state) => {
  try {
    await db.query(sql.room.updateStateForUserRoom, [state, userRoomId])
    return null
  } catch (error) {
    console.log(error)    
  }
}
const getNearestRoom = async(key) => {
  try {
    const [row] = await db.query(sql.room.getNearestRoomByRedirectId, [key])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}

const getUserRoomById = async(id) => {
  try {
    const [row] = await db.query(sql.room.getUserRoomById, [id])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}
const getRoomByRedirectKey = async(key) => {
  try {
    const [row] = await db.query(sql.room.getRoomByRedirectId, [key])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}
const getHostUserRoomInfo = async(room_id) => {
  try {
    const [row] = await db.query(sql.room.getHostUserRoomInfo, [room_id])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}
const getRoomByRoomName = async(roomname) => {
  try {
    const [row] = await db.query(sql.room.getRoomByRoomName, [roomname])
    if(row.length !== 0)
      return row
    return null
  } catch (error) {
    console.log(error)    
  }
}

const getRoomUserByUserName = async(username) => {
  try {
    const [row] = await db.query(sql.room.getRoomUserByUserName, [username])
    if(row.length !== 0)
      return row
    return null
  } catch (error) {
    console.log(error)    
  }
}

const getRoomByLecIdxAndUserIdx = async(lec_idx, user_idx) => {
  try {
    const [row] = await db.query(sql.room.getRoomByLecIdxAndUserIdx, [lec_idx, user_idx])
    if(row.length !== 0)
      return row
    return null
  } catch (error) {
    console.log(error)    
  }
}

const getUserRoomByRoomIdAndUserId = async(room_id, user_idx) => {
  try {
    const [row] = await db.query(sql.room.getUserRoomByRoomIdAndUserId, [room_id, user_idx])
    console.log(row)
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)    
  }
}

const getRoomById = async(id) => {
  try {
    const [row] = await db.query(sql.room.getRoomById, [id])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)
  }
}

const insertSocketId = async(socketId, id) => {
  try {
    const [row] = await db.query(sql.room.insertSocketIdToUserRoom, [socketId, id])
    return row
  } catch (error) {
    console.log(error)
  }
}
const getUseRoomBySocketId = async(socketId) => {
  try {
    const [row] = await db.query(sql.room.getUseRoomBySocketId, [socketId])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)
  }
}

const getUserRoomNearestToday= async (userId, lec_idx, device = null) => {
  try {
    let row
    if(device){
      [row] = await db.query(sql.room.getUserRoomNearestTodayWithDevice, [userId, lec_idx, device])
    }else{  
      [row] = await db.query(sql.room.getUserRoomNearestTodayNoDevice, [userId, lec_idx])
    }
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)
  }
}

const getUserRoomNearestByUserId = async (userId) => {
  try {
    const [row] = await db.query(sql.room.getUserRoomNearestByUserId, [userId])
    if(row.length !== 0)
      return row[0]
    return null
  } catch (error) {
    console.log(error)
  }
}


module.exports = {
  insertRoom,
  getRoomUserByUserName,
  insertUserRoom,
  insertSocketId,
  getRoomByRoomName,
  getRoomByLecIdxAndUserIdx,
  getRoomByRedirectKey,
  getNearestRoom,
  getUserRoomById,
  getRoomById,
  getUserRoomByRoomIdAndUserId,
  selectUserRoomByIdAndUserId,
  getUseRoomBySocketId,
  getHostUserRoomInfo,
  getUserRoomNearestByUserId,
  getUserRoomNearestToday,
  updateStateForUserRoom,
}
