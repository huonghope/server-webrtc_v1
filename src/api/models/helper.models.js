const checkLectureAPI = (response) => {
  const { result } = response
  if(Number(result) === 0 )
    return true
  else
    return false
}

module.exports = {
  checkLectureAPI
}