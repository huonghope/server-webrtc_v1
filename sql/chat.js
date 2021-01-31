module.exports = {
  //INSERT
  insertChat : `insert into plass_chat(user_idx, message, type, room_id) values (?, ?, ?, ?)`,
  insertDisableChat: `insert into plass_chat_disable(user_idx, room_id, c_status) values (?, ?, ?)`,
  insertUpFile: `insert into plass_files(filename, path, room_id, user_idx, size, mimetype) values (?, ?, ?, ?, ?, ?)`,
  insertChatFile: `insert into plass_chat(user_idx, message, type, room_id, file_id) values (?, ?, ?, ?, ?)`,

  //SELECT 
  getChatById: `select * from plass_chat where id  = ?`,
  getListMessageByRoomIdAndUserId: `select * from plass_chat where room_id = ? and user_idx = ? order by id asc`,
  getListMessageByRoomId: `select * from plass_chat where room_id = ? order by id asc`,
  getFileInfoById: `select * from plass_files where id = ?`,
  getListMessageByRoomIdForStudent: `select * from plass_chat where room_id = ? and (user_idx = ? or user_idx = ?) order by id asc`,
  getDisableChat: `select * from plass_chat_disable where user_idx = ? and room_id = ?`,

  //UPDATE
  updateDisableChat: `update plass_chat_disable set  c_status = ? where user_idx = ? and room_id = ?`
}