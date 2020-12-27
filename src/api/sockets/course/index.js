const _RequestModel = require('../../models/request.model')
const _RoomModel = require('../../models/room.models')
const _ChatModel = require('../../models/chat.models')
const _UserModel = require('../../models/user.models')


//!강사한테만 socket를 구분해야됨
//!일단 요청이 들어가면 요청정보를 저장하고 강사는 어떻게 처리함에 따라 디비를 업데이트
const courseSocketController = {

    //유저는 음성질문 요청 듣기
    //학생 및 유저한테 알려줌
    //상태 체크함 새로 요청이든니 요청했던거
    userRequestQuestion: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)
        await _RequestModel.insertRequestQuestion(user.user_idx, room_id, 'waiting')
        const _connectedPeers = meetingRoom

        //강사한테 요청한 학생이 있음
        const [socketID, _socket] = _connectedPeers.entries().next().value;
        _socket.emit('alert-host-question', {
            status: status,
            remoteSocketId: mainSocket.id,
            userInfo: user,
        })

        //message에서 저장할 필요함 type == request_question
        //!insert message
        let chat = await _ChatModel.insertChat(user.user_idx, "", "request_question", room_id)
        let userInfo = await _UserModel.getUserByUserIdx(user.user_idx)

        chat.username = userInfo.user_name
        mainSocket.emit('alert-all-request-message', chat)
        _socket.emit('alert-all-request-message', chat )
    },
    userCancelRequestQuestion: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const _connectedPeers = meetingRoom
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)
        const [socketID, _socket] = _connectedPeers.entries().next().value;

        await _RequestModel.updateRequestQuestionNearest(user.user_idx, room_id, false)
        _socket.emit('alert-host-question', {
            status: status,
            remoteSocketId: mainSocket.id,
            userInfo: user,
        })
    },
    //유저는 자리비움 요청 듣기
    userRequestOut: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)

        await _RequestModel.insertRequestLecOut(user.user_idx, room_id, 'waiting')
        const _connectedPeers = meetingRoom

        //강사한테 요청한 학생이 있음
        const [socketID, _socket] = _connectedPeers.entries().next().value;
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            userInfo: user,
        })

        let chat = await _ChatModel.insertChat(user.user_idx, "", "request_lecOut", room_id)
        let userInfo = await _UserModel.getUserByUserIdx(user.user_idx)

        chat.username = userInfo.user_name
        mainSocket.emit('alert-all-request-message', chat)
        _socket.emit('alert-all-request-message', chat )
        //message에서 저장할 필요함 type == request_lecOut
        //!insert message
    },

    userCancelRequestLecOut: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const _connectedPeers = meetingRoom
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)
        const [socketID, _socket] = _connectedPeers.entries().next().value;

        mainSocket.emit('alert-user-process-req-lecOut', status)
        await _RequestModel.updateRequestLecOutNearest(user.user_idx, room_id, false)
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            userInfo: user,
        })
    },

    //요청을 처리함
    //강사를 요청을 받아서 처리함
    //업데이트
    actionForUserRequest: async (mainSocket, data, meetingRoom, user) => {
        const { userId, userRoomId, type, status, remoteSocketId } = data
        const _connectedPeers = meetingRoom

        const { room_id } = await _RoomModel.getUserRoomById(userRoomId)

        const userInfo = await _UserModel.getUserByUserIdx(userId)
        let result = status === 'accept' ? true : false
        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID === remoteSocketId) {
                //학생한테 다시 알려줘야함
                switch (type) {
                    case "request-question":
                        const reqQuestionInfo = await _RequestModel.updateRequestQuestionNearest(userId, room_id, result)
                        //send 강사
                        mainSocket.emit('alert-host-process-req-question', {
                            type: type,
                            data: { ...reqQuestionInfo, userInfo },
                            remoteSocketId: remoteSocketId
                        })
                        //only send to request user
                        _socket.emit('alert-user-process-req-question', result)
                        break;

                    case "request-lecOut":
                        const reqLecOutInfo = await _RequestModel.updateRequestLecOutNearest(userId, room_id, result)
                        // send to 강가
                        mainSocket.emit('alert-host-process-req-lecOut', {
                            type: type,
                            data: {...reqLecOutInfo, userInfo},
                            remoteSocketId: remoteSocketId
                        })
                        //sent to 학생
                        _socket.emit('alert-user-process-req-lecOut', result)
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