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
}