module.exports = {
  //INSERT
  insertWarning: `insert into plass_warning(user_idx, room_id, message_id) values (?, ?, ?)`,
  //SELECT
  getWarningById : 'select * from plass_warning where id = ?',
}