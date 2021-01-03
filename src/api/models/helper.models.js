const checkLectureAPI = (response) => {
  const { result } = response
  if(Number(result) === 0 )
    return true
  else
    return false
}

const checkHostBySocketId = (socketArray, socketId) => {
  if(socketArray && socketArray.length !== 0){
    //result first socket array
    let result = socketId === socketArray.entries().next().value[0];
    return result;
  }else
    return false
}

module.exports = {
  checkLectureAPI,
  checkHostBySocketId
}