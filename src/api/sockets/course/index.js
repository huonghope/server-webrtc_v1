const _RequestModel = require('../../models/request.model')
const _RoomModel = require('../../models/room.models')
const _ChatModel = require('../../models/chat.models')
const _UserModel = require('../../models/user.models')
const _WarningModel = require('../../models/warning')
const { conforms } = require('lodash')


//!강사한테만 socket를 구분해야됨
//!일단 요청이 들어가면 요청정보를 저장하고 강사는 어떻게 처리함에 따라 디비를 업데이트
const courseSocketController = {
    //유저는 음성질문 요청 듣기
    //학생 및 유저한테 알려줌
    //상태 체크함 새로 요청이든니 요청했던거
    userRequestQuestion: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)
        let reqInfo = await _RequestModel.insertRequestQuestion(user.user_idx, room_id, 'waiting')
        const _connectedPeers = meetingRoom

        //강사한테 요청한 학생이 있음
        const [socketID, _socket] = _connectedPeers.entries().next().value;
        _socket.emit('alert-host-question', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })

        //message에서 저장할 필요함 type == request_question
        //!insert message
        let newMessage = await _ChatModel.insertChat(user.user_idx, "", "request_question", room_id)
        let userInfo = await _UserModel.getUserByUserIdx(user.user_idx)

        let resMessage = await _ChatModel.convertResponseMessage(newMessage)
        resMessage.sender.username = userInfo.user_name
        
        // chat.username = userInfo.user_name
        //! refactory
        mainSocket.emit('alert-all-request-message', resMessage)
        _socket.emit('alert-all-request-message', resMessage )
    },
    //!요청하다가 취소
    userCancelRequestQuestion: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const _connectedPeers = meetingRoom
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)
        const [socketID, _socket] = _connectedPeers.entries().next().value;

        let reqInfo = await _RequestModel.updateRequestQuestionNearest(user.user_idx, room_id, false)
        _socket.emit('alert-host-question', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })
    },
    //유저는 자리비움 요청 듣기
    userRequestOut: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)

        let reqInfo = await _RequestModel.insertRequestLecOut(user.user_idx, room_id, 'waiting')
        const _connectedPeers = meetingRoom

        //강사한테 요청한 학생이 있음
        const [socketID, _socket] = _connectedPeers.entries().next().value;
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })

        let newMessage = await _ChatModel.insertChat(user.user_idx, "", "request_lecOut", room_id)
        let userInfo = await _UserModel.getUserByUserIdx(user.user_idx)

        let resMessage = await _ChatModel.convertResponseMessage(newMessage)
        resMessage.sender.username = userInfo.user_name
        // chat.username = userInfo.user_name
        mainSocket.emit('alert-all-request-message', resMessage)
        _socket.emit('alert-all-request-message', resMessage)
        //message에서 저장할 필요함 type == request_lecOut
        //!insert message
    },
    //!요청하다가 취소
    userCancelRequestLecOut: async (mainSocket, data, meetingRoom, user) => {
        const { status } = data
        const _connectedPeers = meetingRoom
        const { room_id } = await _RoomModel.getUserRoomById(data.userRoomId)
        const [socketID, _socket] = _connectedPeers.entries().next().value;

        mainSocket.emit('alert-user-process-req-lecOut', status)
        let reqInfo = await _RequestModel.updateRequestLecOutNearest(user.user_idx, room_id, false)
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })
    },

    //요청을 처리함
    //강사를 요청을 받아서 처리함
    //업데이트
    actionForUserRequest: async (mainSocket, data, meetingRoom, user) => {
        let { userId, userRoomId, type, status, remoteSocketId } = data

        //!refactory 해야암
        //!일단
        if(remoteSocketId === undefined){
            const userRoom = await _RoomModel.selectUserRoomByIdAndUserId(userRoomId, user.user_idx)
            const remoteUserRoom = await _RoomModel.getUserRoomByRoomIdAndUserId(userRoom.room_id, userId)
            remoteSocketId = remoteUserRoom.socket_id
        }
        const _connectedPeers = meetingRoom
        const { room_id } = await _RoomModel.getUserRoomById(userRoomId)

        let result = status === 'accept' ? true : false
        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID === remoteSocketId) {
                //학생한테 다시 알려줘야함
                switch (type) {
                    case "request_question":
                        const reqQuestionInfo = await _RequestModel.updateRequestQuestionNearest(userId, room_id, result)

                        //send 강사
                        mainSocket.emit('alert-host-process-req-question', {
                            type: type,
                            reqInfo: reqQuestionInfo,
                            remoteSocketId: remoteSocketId,
                            state: result
                        })

                        // if(!resule){
                        //     mainSocket.emit('alert-host-question', {
                        //         status: result,
                        //         remoteSocketId: socketID,
                        //         reqInfo: reqQuestionInfo
                        //     })
                        // }
                        //only send to request user
                        _socket.emit('alert-user-process-req-question', result)
                        break;

                    case "request_lecOut":
                        const reqLecOutInfo = await _RequestModel.updateRequestLecOutNearest(userId, room_id, result)
                        // send to 강가
                        mainSocket.emit('alert-host-process-req-lecOut', {
                            type: type,
                            reqInfo: reqLecOutInfo,
                            remoteSocketId: remoteSocketId,
                            // listUserOut: listUserOut
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
    //!메시지 확인할 필요함
    actionWarningUser: async (mainSocket, data, meetingRoom, user) => {
        const { userId, remoteSocketId, userRoomId } = data
        console.log(userId, remoteSocketId, userRoomId)
        const _connectedPeers = meetingRoom
        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID === remoteSocketId) {
                const userInfo = await _UserModel.getUserByUserIdx(userId)
                const { room_id } = await _RoomModel.getUserRoomById(userRoomId)
                let newMessage = await _ChatModel.insertChat(userId, "", "user-warning", room_id)
                await _WarningModel.insertWarning(userId, room_id, newMessage.id)

                //let resMessage = await _ChatModel.convertResponseMessage(newMessage)
                //resMessage.sender.username = userInfo.user_name
                
                
                let resMessage = await _ChatModel.convertResponseMessage(newMessage)
                resMessage.sender.username = userInfo.user_name

                console.log(resMessage)
                _socket.emit('alert-user-warning', resMessage)
            }
        }
    },
    //집중도 테스트
    testConcentration: (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        const [_socketID, _socket] = _connectedPeers.entries().next().value
        
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID !== _socketID) {
                socket.emit('alert-user-test-concentration', {
                    number: data.number
                })
            }
        }
    },
    stateMicAllStudent : (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        for (const [socketID, socket] of _connectedPeers.entries()) {
            console.log('모든 학생 음성',data)
            socket.emit('alert-user-mute-mic-all', {data})
        }
        
    }
    // //집중도 테스트 실패
    // testConcentrationFail: async (mainSocket, data, meetingRoom, user) => {
    //     const { userRoomId } = data
    //     const _connectedPeers = meetingRoom
    //     console.log(userRoomId)
    //     const { room_id }  = await _RoomModel.getUserRoomById(userRoomId)
    //     let chat = await _ChatModel.insertChat(user.user_idx, "", "test_Concentration", room_id)

    //     console.log(chat)
    //     chat.username = user.user_name

    //     //실패는 강사한테 알려줌
    //     const [_socketID, _socket] = _connectedPeers.entries().next().value
    //     _socket.emit('alert-host-test-concentration-fail', chat)
        
    // }
}
module.exports = courseSocketController