
//!강사한테만 socket를 구분해야됨
const courseSocketController = {

    //유저는 음성질문 요청 듣기
    userRequestQuestion: (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        const [socketID, _socket] = _connectedPeers.entries().next().value;
        _socket.emit('alert-host-question', {
            remoteSocketId: mainSocket.id,
            remoteUsername: user.username
        })
    },
    //유저는 자리비움 요청 듣기
    userRequestOut: (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        const [socketID, _socket] = _connectedPeers.entries().next().value;
        _socket.emit('alert-host-lecOut', {
            remoteSocketId: mainSocket.id,
            remoteUsername: user.username
        })
    },

    //요청을 처리함
    actionForUserRequest: (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        for (const [socketID, _socket] of _connectedPeers.entries()) {
            // don't send to self
            console.log(data)
            if (socketID === data.remoteSocketId) {
                switch (data.type) {
                    case "request-question":
                        //only send to request user
                        _socket.emit('alert-user-process-req-question', data.type)
                        break;
                    case "request-lecOut":
                        // send to host 
                        mainSocket.emit('alert_host_status_lec_out', {
                            type: data.type,
                            remoteSocketId: data.remoteSocketId
                        })
                        //sent to user
                        _socket.emit('alert-user-process-req-lec-out', data.type)
                        break;
                    default:
                        break;
                }
            }
        }
    },
    //유저를 경고함
    actionWarningUser: (mainSocket, data, meetingRoom, user) => {
        console.log("warning", data)
        const _connectedPeers = meetingRoom
        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID === data.remoteSocketId) {
                _socket.emit('alert-user-warning', socketID)
            }
        }
    },
    testConcentration: (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        for (const [socketID, socket] of _connectedPeers.entries()) {
            const [_socketID, _socket] = _connectedPeers.entries().next().value
            if (socketID !== _socketID) {
                socket.emit('test-concentration', {
                    number: data.payload.number
                })
            }
        }
    }
}
module.exports = courseSocketController