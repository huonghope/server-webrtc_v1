module.exports = {
  //INSERT
  insertChat : `insert into plass_chat(user_idx, message, type, room_id) values (?, ?, ?, ?)`,
  insertDisableChat: `insert into plass_chat_disable(user_idx, room_id, status) values (?, ?, ?)`,

  //SELECT 
  getChatById: `select * from plass_chat where id  = ?`
}