module.exports = {
  //INSERT
  insertLecture: `insert into plass_lecture(lec_idx, class_tp, grade, class_nm, lec_tp, stu_cnt, subject_nm,
  lecture_nm, lecture_cnt, lecture_date, stime, etime, lec_status, test_tp, test_gap, app_key)
  values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //SELECT
  getLectureByLecIdx : 'select * from plass_lecture where lec_idx = ?',
}