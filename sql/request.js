module.exports = {
  //INSERT
  insertRequestQuestion: `insert into plass_req_question(user_idx, room_id, req_status) values(?, ?, ?)`,
  updateStatusRequestQuestion: `update  plass_req_question set status = ? where user_idx = ? and room_id = ?`,
  getRequestQuestionById: 'select * from plass_req_question where id = ?',
  updateRequestQuestionNearest: `update plass_req_question set req_status = ? where user_idx = ? AND room_id= ? order by id desc limit 1`,
  getRequestQuestionNearest: `select * from plass_req_question where user_idx = ? AND room_id= ? order by id desc limit 1`,


  insertRequestLecOut: `insert into plass_req_lecout(user_idx, room_id, req_status) values(?, ?, ?)`,
  updateStatusRequestLecOut: `update  plass_req_lecout set status = ? where user_idx = ? and room_id = ?`,
  getRequestLecOutById: 'select * from plass_req_lecout where id = ?',
  updateRequestLecOutNearest: `update plass_req_lecout set req_status = ? where user_idx = ? AND room_id= ? order by id desc limit 1`,
  getRequestLecOutNearest: `select * from plass_req_lecout where user_idx = ? AND room_id= ? order by id desc limit 1`,
  getListUserLecOut: `select rl.*,u.socket_id from plass_req_lecout as rl, plass_userroom as u where rl.room_id = ? and rl.req_status != 0 and rl.user_idx = u.user_idx and rl.room_id = u.room_id`
}