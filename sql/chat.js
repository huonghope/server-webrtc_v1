module.exports = {
  //INSERT
  insertChat : `insert into plass_chat(user_idx, message, type, room_id) values (?, ?, ?, ?)`,

  //SELECT 
  getChatById: `select * from plass_chat where id  = ?`
}