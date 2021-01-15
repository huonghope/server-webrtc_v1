const _UserModel = require("../models/user.models")
const _RoomModel = require("../models/room.models")


const pushSocketToRoomMap = (meetingRoomMap, room, socket) => {
  if(!meetingRoomMap[room]){
    meetingRoomMap[room] = new Map();
    meetingRoomMap[room].set(socket.id, socket);
  }else{
    meetingRoomMap[room].set(socket.id, socket);
  }
  return meetingRoomMap
}
const pushSocketToRoomMapHost = (meetingRoomMap, room, socket) => {
  if(!meetingRoomMap[room]){
    meetingRoomMap[room] = new Map();
    meetingRoomMap[room].set(socket.id, socket);
  }else{
    meetingRoomMap[room] = new Map([[socket.id, socket], ...meetingRoomMap[room]]);
  }
  return meetingRoomMap
}

const removeSocketIdToArray = (clients, userId, socket) => {
  clients[userId] = clients[userId].filter(socketId => socketId !== socket.id)
  if(!clients[userId].length){
    delete clients[userId]
  }
  return clients
} 

const getUserInfo = async (user_idx) => {
  try {
    const user = await _UserModel.getUserByUserIdx(user_idx);
    if (user) return user;
    return null;
  } catch (error) {
    throw error;
  }
};

const getRoomUserByUserName = async(username) => {
  try {
    const [user] = await _RoomModel.getRoomUserByUserName(username);
    if (user) return user;
    return null;
  } catch (error) {
    throw error;
  }
}
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
const emitNotifyToArray = (clients, userId, io, eventName, data) => clients[userId].forEach(socketId =>
  io.sockets.connected[socketId].emit(eventName, data));

module.exports = {
  pushSocketToRoomMap,
  removeSocketIdToArray,
  emitNotifyToArray,
  getUserInfo,
  getRoomUserByUserName,
  insertSocketIdToUserRoom,
  pushSocketToRoomMapHost,
  updateSocketId,
  displayMapSocket,
  getUserRoomById,
  updateStateForUserRoom
};
