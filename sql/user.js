module.exports = {
  //INSERT
  insertUser : `insert into plass_user(user_idx, user_name, user_status, user_tp, schul_nm, grade, class_nm, class_no, sc_code, schul_code, app_key) 
  values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  insertRefreshToken: "insert into plass_refreshtokens(refresh_token, user_id, expires) values(?, ?, ?)",
  insertRedirectUser: "insert into plass_redirect_key(lec_idx, user_idx, redirect_key) values(?, ?, ?)",

  //SELECT
  getUserById: "select * from plass_user where id = ?",
  selectUserByUserIdx: "select * from plass_user where user_idx = ?",
  getUserByRedirectKeyAndUserIdx: "select * from plass_user where redirect_key = ? and user_idx = ?",
  getUserByRedirectKey: "select * from plass_user where redirect_key = ?",
  getRedirectUserByLecIdxAndUserIdx: "select * from plass_redirect_key where lec_idx = ? and user_idx = ?",
  getRedirectUserByLecIdxAndRedirectKey: "select * from plass_redirect_key where lec_idx = ? and redirect_key = ?",
  getRedirectUserByKey: "select * from plass_redirect_key where redirect_key = ? and lec_idx = ?",

  //UPDATE
  updateUser: `update plass_user set user_name = ?, user_status = ?, user_tp = ?, schul_nm = ?, grade = ?, class_nm = ?, class_no = ?, sc_code = ?, schul_code = ?, app_key = ? 
  where user_idx = ?`
}