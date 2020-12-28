module.exports = {
  //INSERT
  insertTestConcentration: `insert into plass_test_concentration(user_idx, room_id, status, message_id) values (?, ?, ?, ?)`,
  //SELECT
  getTestConcentrationById : 'select * from plass_test_concentration where id = ?',
}