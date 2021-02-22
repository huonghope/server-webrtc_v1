const _RequestModel = require('../../models/request.model')
const _RoomModel = require('../../models/room.models')
const _ChatModel = require('../../models/chat.models')
const _UserModel = require('../../models/user.models')
const _WarningModel = require('../../models/warning.models')
const moment = require("moment")
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
        const { user_idx, user_name } = user 
        let reqInfo = await _RequestModel.insertRequestQuestion(user_idx, room_id, 'waiting')

        //강사한테 알림(화면)
        const [socketID, _socket] = await getFirstValueMap(meetingRoom, room_id);
        _socket.emit('alert-host-question', {
            status: 'waiting',
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo,
            type: 'request_question'
        })

        //메시지
        let newMessage = await _ChatModel.insertChat(user_idx, "", "request_question", room_id)
        let resMessage = await _ChatModel.convertResponseMessage(newMessage)
        resMessage.sender.username = user_name
        
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
        const [socketID, _socket] = await getFirstValueMap(meetingRoom, room_id);
        const { user_idx } = user 
        
        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss")
        let reqNearest  = await _RequestModel.getRequestQuestionNearest(user_idx, room_id)
        let reqInfo
        mainSocket.emit('alert-user-process-req-question', status)
        if(reqNearest)
        {
            const { req_status } = reqNearest
            if(req_status === 'waiting'){
                reqInfo = await _RequestModel.updateRequestQuestionNearest(user_idx, room_id, false, currentTime)
            }else{
                reqInfo= await _RequestModel.updateRequestQuestionNearest(user_idx, room_id, true, currentTime)
            }
        }
        _socket.emit('alert-host-question', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo,
            type: 'request_question'
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
        const { user_idx, user_name } = user 
        let reqInfo = await _RequestModel.insertRequestLecOut(user_idx, room_id, 'waiting')

        //강사한테 요청한 학생이 있음
        const [socketID, _socket] = await getFirstValueMap(meetingRoom, room_id);
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo,
            type: 'request_lecOut'
        })

        let newMessage = await _ChatModel.insertChat(user_idx, "", "request_lecOut", room_id)
        let resMessage = await _ChatModel.convertResponseMessage(newMessage)
        resMessage.sender.username = user_name

        mainSocket.emit('alert-all-request-message', resMessage)
        _socket.emit('alert-all-request-message', resMessage)
    },
    /**
     * @desc: 학생화면에서 자리비움 요청다가 취소라는 버튼을 클릭할떄 발생
     * 보내는 요청을 강사한테 보냄(화면)
     * 저장한 데이트: 요청 정보
     */
    //!전에 있는거 상태확인 필요한가?
    userCancelRequestLecOut: async (mainSocket, data, meetingRoom, user, userRoom) => {
        const { status } = data
        const { room_id } = userRoom
        const [socketID, _socket] = await getFirstValueMap(meetingRoom, room_id);
        const { user_idx } = user
        mainSocket.emit('alert-user-process-req-lecOut', status)

        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss")
        let reqNearest  = await _RequestModel.getRequestLecOutNearest(user_idx, room_id)
        let reqInfo
        if(reqNearest){
            const { req_status } = reqNearest
            if(req_status === 'waiting'){
                //요청하고 있다가 취소할 경우에는
                reqInfo = await _RequestModel.updateRequestLecOutNearest(user_idx, room_id, false, currentTime)
            }else{
                //이미 진행하고 있는다가 취고하는 경우에는
                reqInfo = await _RequestModel.updateRequestLecOutNearest(user_idx, room_id, true, currentTime)
            }
        }
        _socket.emit('alert-host-lecOut', {
            status: status,
            remoteSocketId: mainSocket.id,
            reqInfo: reqInfo,
            type: 'request_lecOut'
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
        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss")

        for (const [socketID, _socket] of _connectedPeers.entries()) {
            if (socketID === remoteSocketId) {
                //학생한테 다시 알려줘야함
                switch (type) {
                    case "request_question":
                        let reqQuestionInfo
                        if(result){
                            reqQuestionInfo = await _RequestModel.updateRequestQuestionNearest(userId, room_id, result)
                        }else{
                            let reqNearest  = await _RequestModel.getRequestQuestionNearest(userId, room_id)
                            if(reqNearest){
                                const { req_status } = reqNearest
                                if(req_status === 'waiting'){
                                    reqQuestionInfo = await _RequestModel.updateRequestQuestionNearest(userId, room_id, false, currentTime)
                                }else{
                                    reqQuestionInfo= await _RequestModel.updateRequestQuestionNearest(userId, room_id, true, currentTime)
                                }
                            }
                        }
                        mainSocket.emit('alert-host-process-req-question', {
                            reqInfo: reqQuestionInfo,
                            remoteSocketId: remoteSocketId,
                            status: result,
                            type: type
                        })
                        _socket.emit('alert-user-process-req-question', result)
                        break;
                    case "request_lecOut":
                        let reqLecOutInfo;
                        //허락할 경우에는
                        if(result){
                            reqLecOutInfo = await _RequestModel.updateRequestLecOutNearest(userId, room_id, result)
                        }else{
                            //거절하는 경우에는
                            //끝나는 시간이 같이 저정함
                            reqLecOutInfo = await _RequestModel.updateRequestLecOutNearest(userId, room_id, result, currentTime)
                        }
                        mainSocket.emit('alert-host-process-req-lecOut', {
                            reqInfo: reqLecOutInfo,
                            remoteSocketId: remoteSocketId,
                            status: result,
                            type: type
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
                _socket.emit('alert-user-warning', resMessage)
                return;
            }
        }
    },
    //집중도 테스트
    testConcentration: async (mainSocket, data, meetingRoom, user, userRoom) => {
        const _connectedPeers = meetingRoom
        const { room_id } = userRoom
        const [_socketID, _socket] = await getFirstValueMap(meetingRoom, room_id);
        
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID !== _socketID) { //강사제외함
                socket.emit('alert-user-test-concentration', {
                    number: data.number
                })
            }
        }
    },
    //전체학생이 마이크 클릭 이벤트
    stateMicAllStudent : (mainSocket, data, meetingRoom, user) => {
        const _connectedPeers = meetingRoom
        for (const [socketID, socket] of _connectedPeers.entries()) {
            socket.emit('alert-user-mute-mic-all', {data})
        }
        
    }
}
module.exports = courseSocketController