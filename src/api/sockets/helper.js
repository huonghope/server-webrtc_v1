const _UserModel = require("../models/user.models")
const _RoomModel = require("../models/room.models");
const { convertResponseMessage } = require("../models/chat.models");



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

const getFirstValueMap = async (map, roomId = null) => {
  try {
    if(map){
      const [socketID, socket] = map.entries().next().value;
      const userRoomHost = await _RoomModel.getHostUserRoomInfo(roomId)
      if(userRoomHost.socket_id === socketID){
        return map.entries().next().value
      }else{
        return null
      }
    }
    return null
  } catch (error) {
    console.log(error)    
  }
}
const getFirstValueKeyMap = async (map, roomId = null) => {
  if (map) {
    const userRoomHost = await _RoomModel.getHostUserRoomInfo(roomId);
    for (const [_socketID, _socket] of map.entries()) {
      if (userRoomHost.socket_id === _socketID) {
        return {_socket, _socketID};
      }
    }
    return null;
  }
  return null;
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
  //!재접속문제 될수있음.
  if(role) //host user
  {
    // console.log("HOST SOCKET ID", socket.id)
    // meetingRoomMap = new Map([[socket.id, socket], ...meetingRoomMap]);
    // for (const [_socketID, _socket] of meetingRoomMap.entries()) {
    //   console.log(_socketID)
    // }
    meetingRoomMap = new Map();
    meetingRoomMap.set(socket.id, socket)
    return meetingRoomMap;
  }else{
    return meetingRoomMap.set(socket.id, socket);
  }
}
const displayMapSocket = (map) => {
  for (const [_socketID, _socket] of map.entries()) {
  }
}

const sleep = async (ms) => {
  return new Promise((r) => setTimeout(() => r(), ms));
}
module.exports = {
  getFirstValueMap,
  getFirstValueKeyMap,
  getUserInfo,
  insertSocketIdToUserRoom,
  updateSocketId,
  displayMapSocket,
  getUserRoomById,
  updateStateForUserRoom,
  sleep
};
