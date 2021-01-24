const _RequestModel = require('../../models/request.model')
const _RoomModel = require('../../models/room.models')
const _ChatModel = require('../../models/chat.models')
const _UserModel = require('../../models/user.models')
const _WarningModel = require('../../models/warning')
const { conforms } = require('lodash')

const { getFirstValueMap } = require('../helper')
//!강사한테만 socket를 구분해야됨
//!일단 요청이 들어가면 요청정보를 저장하고 강사는 어떻게 처리함에 따라 디비를 업데이트
const courseSocketController = {
    /**
     * all
     * @param {*} mainSocket:현재 socket 
     * @param {*} data: client부터 같이 보낸 데이터
     * @param {*} meetingRoom: 강좌별로 sockets 저장하는 Map
     * @param {*} user: 현재 유저
     * @getFirstValueMap {*}: 강사변수
     */


    /**
     * @desc: 학생화면에서 질문요청이라는 버튼을 클릭할떄 발생함
     * 보내는 요청을 강사한테 보냄(화면 및 메시지)
     * 저장한 데이트: 요청 정보, 메세지 정보
     */
    userRequestQuestion: async (mainSocket, data, meetingRoom, user, userRoom) => {
        const { status } = data
        const { room_id } = userRoom
        let reqInfo = await _RequestModel.insertRequestQuestion(user.user_idx, room_id, 'waiting')


        console.log(status)
        //강사한테 알림(화면)
        const [socketID, _socket] = getFirstValueMap(meetingRoom);
        _socket.emit('alert-host-question', {
            status: 'waiting',
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })

        //메시지
        let newMessage = await _ChatModel.insertChat(user.user_idx, "", "request_question", room_id)
        let resMessage = await _ChatModel.convertResponseMessage(newMessage)
        resMessage.sender.username = user.user_name
        
        mainSocket.emit('alert-all-request-message', resMessage)
        _socket.emit('alert-all-request-message', resMessage )
    },
    /**
     * @desc: 학생화면에서 질문 요청하다가 취소라는 버튼을 클릭할떄 발생
     * 보내는 요청을 강사한테 보냄(화면)
     * 저장한 데이트: 요청 정보
     */
    userCancelRequestQuestion: async (mainSocket, data, meetingRoom, user, userRoom) => {
        const { status } = data
        const { room_id } = userRoom
        const [socketID, _socket] = getFirstValueMap(meetingRoom);

        let reqInfo = await _RequestModel.updateRequestQuestionNearest(user.user_idx, room_id, false)
        _socket.emit('alert-host-question', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })
    },
    /**
     * @desc: 학생화면에서 자리비움 요청이라는 버튼을 클릭할떄 발생함
     * 보내는 요청을 강사한테 보냄(화면 및 메시지)
     * 저장한 데이트: 요청 정보, 메세지 정보
     */
    userRequestOut: async (mainSocket, data, meetingRoom, user, userRoom) => {
        const { status } = data
        const { room_id } = userRoom
        let reqInfo = await _RequestModel.insertRequestLecOut(user.user_idx, room_id, 'waiting')
        console.log(status)
        //강사한테 요청한 학생이 있음
        const [socketID, _socket] = getFirstValueMap(meetingRoom);
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })

        let newMessage = await _ChatModel.insertChat(user.user_idx, "", "request_lecOut", room_id)
        let resMessage = await _ChatModel.convertResponseMessage(newMessage)
        resMessage.sender.username = user.user_name

        mainSocket.emit('alert-all-request-message', resMessage)
        _socket.emit('alert-all-request-message', resMessage)
    },
    /**
     * @desc: 학생화면에서 자리비움 요청다가 취소라는 버튼을 클릭할떄 발생
     * 보내는 요청을 강사한테 보냄(화면)
     * 저장한 데이트: 요청 정보
     */
    userCancelRequestLecOut: async (mainSocket, data, meetingRoom, user, userRoom) => {
        const { status } = data
        const { room_id } = userRoom
        const [socketID, _socket] = getFirstValueMap(meetingRoom);

        mainSocket.emit('alert-user-process-req-lecOut', status)
        let reqInfo = await _RequestModel.updateRequestLecOutNearest(user.user_idx, room_id, false)
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo
        })
    },
    /**
     * @desc: 강사화면에서 요청이 오는 핵상화면을 처리함
     * 보내는 요청을 강사 및 학생한테 보냄(화면 및 메시지)
     * 저장한 데이트: 요청 정보, 메시지 정보
     */
    actionForUserRequest: async (mainSocket, data, meetingRoom, user, userRoom) => {
        let { userId, userRoomId, type, status, remoteSocketId } = data

        //다름 학생이 질문이 요청하고 있는 경우에는 처리함
        if(remoteSocketId === undefined){
            //!확인할 필요함
            const userRoom = await _RoomModel.selectUserRoomByIdAndUserId(userRoomId, user.user_idx)
            const remoteUserRoom = await _RoomModel.getUserRoomByRoomIdAndUserId(userRoom.room_id, userId)
            remoteSocketId = remoteUserRoom.socket_id
        }
        const _connectedPeers = meetingRoom
        const { room_id } = userRoom
        let result = status === 'accept' ? true : false

        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID === remoteSocketId) {
                //학생한테 다시 알려줘야함
                switch (type) {
                    case "request_question":
                        //! 확인할 필요함
                        const reqQuestionInfo = await _RequestModel.updateRequestQuestionNearest(userId, room_id, result)
                        mainSocket.emit('alert-host-process-req-question', {
                            reqInfo: reqQuestionInfo,
                            remoteSocketId: remoteSocketId,
                            status: result
                        })
                        _socket.emit('alert-user-process-req-question', result)
                        break;

                    case "request_lecOut":
                        const reqLecOutInfo = await _RequestModel.updateRequestLecOutNearest(userId, room_id, result)
                        mainSocket.emit('alert-host-process-req-lecOut', {
                            reqInfo: reqLecOutInfo,
                            remoteSocketId: remoteSocketId,
                            status: result
                        })
                        _socket.emit('alert-user-process-req-lecOut', result)
                        break;
                    default:
                        break;
                }
            }
        }
    },
    //유저를 경고함
    //!메시지 확인해야함
    actionWarningUser: async (mainSocket, data, meetingRoom, user ,userRoom) => {
        const { userId, remoteSocketId, userRoomId } = data
        const _connectedPeers = meetingRoom
        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID === remoteSocketId) {
                const userInfo = await _UserModel.getUserByUserIdx(userId)
                const { room_id } = userRoom
                let newMessage = await _ChatModel.insertChat(userId, "", "user-warning", room_id)
                await _WarningModel.insertWarning(userId, room_id, newMessage.id)
                let resMessage = await _ChatModel.convertResponseMessage(newMessage)
                resMessage.sender.username = userInfo.user_name

                console.log(resMessage)
                _socket.emit('alert-user-warning', resMessage)
                return;
            }
        }
    },
    //집중도 테스트
    testConcentration: (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        const [_socketID, _socket] = getFirstValueMap(meetingRoom);
        
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID !== _socketID) { //강사제외함
                socket.emit('alert-user-test-concentration', {
                    number: data.number
                })
            }
        }
    },
    stateMicAllStudent : (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        for (const [socketID, socket] of _connectedPeers.entries()) {
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