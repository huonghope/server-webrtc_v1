module.exports = {
  //REQUEST QUESTION
  insertRequestQuestion: `insert into plass_req_question(user_idx, room_id, req_status) values(?, ?, ?)`,
  updateStatusRequestQuestion: `update  plass_req_question set status = ? where user_idx = ? and room_id = ?`,
  getRequestQuestionById: 'select * from plass_req_question where id = ?',
  updateRequestQuestionNearest: `update plass_req_question set req_status = ?, end_time = ? where user_idx = ? AND room_id= ? order by id desc limit 1`,
  getRequestQuestionNearest: `
  select rl.*, ur.socket_id from plass_req_question as rl, plass_userroom as ur where rl.user_idx = ? AND rl.room_id= ? 
	and rl.user_idx = ur.user_idx
    and rl.room_id = ur.room_id
	order by rl.id desc limit 1`,
  getAllRequestQuestion: `
  select request.*, ur.socket_id from plass_req_question as request, plass_userroom as ur
  inner join
  ( select MAX(rq.id) as id ,rq.user_idx from plass_req_question as rq group by rq.user_idx ) as b
  where request.id = b.id
  and request.user_idx = ur.user_idx
  and request.room_id = ur.room_id
  `,

  //REQUEST LECOUT
  insertRequestLecOut: `insert into plass_req_lecout(user_idx, room_id, req_status) values(?, ?, ?)`,
  updateStatusRequestLecOut: `update  plass_req_lecout set status = ? where user_idx = ? and room_id = ?`,
  getRequestLecOutById: 'select * from plass_req_lecout where id = ?',
  updateRequestLecOutNearest: `update plass_req_lecout set req_status = ?, end_time = ? where user_idx = ? AND room_id= ? order by id desc limit 1`,
  getRequestLecOutNearest: `
  select rl.*, ur.socket_id from plass_req_lecout as rl, plass_userroom as ur where rl.user_idx = ? AND rl.room_id= ? 
	and rl.user_idx = ur.user_idx
    and rl.room_id = ur.room_id
	order by rl.id desc limit 1`,
  getListUserLecOut: `select rl.*,u.socket_id from plass_req_lecout as rl, plass_userroom as u where rl.room_id = ? and rl.req_status != 0 and rl.user_idx = u.user_idx and rl.room_id = u.room_id`,
  getAllRequestLecOut: `select request.*, ur.socket_id from plass_req_lecout as request, plass_userroom as ur
  inner join
  ( select MAX(rq.id) as id ,rq.user_idx from plass_req_lecout as rq group by rq.user_idx ) as b
  where request.id = b.id
  and request.user_idx = ur.user_idx
  and request.room_id = ur.room_id`,
}