const _UserModel = require("../models/user.models")
const _RoomModel = require("../models/room.models")



const getUserInfo = async (user_idx) => {
  try {
    const user = await _UserModel.getUserByUserIdx(user_idx);
    if (user) return user;
    return null;
  } catch (error) {
    throw error;
  }
};

const getUserRoomById = async(id) => {
  try {
    const user = await _RoomModel.getUserRoomById(id);
    if (user) return user;
    return null;
  } catch (error) {
    throw error;
  }
}

const insertSocketIdToUserRoom = async(socketId, id) => {
  try {
    const insertRow = await _RoomModel.insertSocketId(socketId, id);
    if (insertRow) return insertRow;
    return null;
  } catch (error) {
    throw error;
  }
}

const getFirstValueMap = (map) => {
    if(map){
      return map.entries().next().value
    }
    return null
}

const updateStateForUserRoom = async(userRoomId, state) => {
  try {
    await _RoomModel.updateStateForUserRoom(userRoomId, state);
    return null;
  } catch (error) {
    throw error;
  }
}
//first value
const updateSocketId = async (meetingRoomMap, socket, role) => {
  //이사람을 host인지 검사
  if(role) //host user
    return meetingRoomMap = new Map([[socket.id, socket], ...meetingRoomMap]);
  return meetingRoomMap.set(socket.id, socket);
}
const displayMapSocket = (map) => {
  for (const [_socketID, _socket] of map.entries()) {
  }
}


module.exports = {
  getFirstValueMap,
  getUserInfo,
  insertSocketIdToUserRoom,
  updateSocketId,
  displayMapSocket,
  getUserRoomById,
  updateStateForUserRoom
};
