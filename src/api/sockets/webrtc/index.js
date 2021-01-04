//!강사한테만 socket를 구분해야됨
const webRTCSocketController = {
    /**
     * all 
     * @param {*} mainSocket: 현재 socket
     * @param {*} data: client부터 같이 보낸 데이터
     * @param {*} meetingRoomMap: 강좌별 sockets 저장하는 Map
     * @param {*} user: 현재 유저
     */

    /**
     * @desc
     * - 강사인 경우에는 peer: 1 ~ N
     * - 일단 유저인 경우에는: 1 ~ 1
     */
    onlinePeers:  (mainSocket, data, meetingRoomMap, user) => {
        const _connectedPeers = meetingRoomMap
        const [socketID, _socket] =  _connectedPeers.entries().next().value;
        // console.log(meetingRoomMap)
        // console.log("connect Peer", _connectedPeers)

        if (socketID !== data.socketID.local) { //일단 유저
            mainSocket.emit('online-peer', socketID) 
        }else{  //강사인 경우에는 다른 유저를 연결함
            for (const [__socketID, __socket] of _connectedPeers.entries()) {
                if (__socketID !== data.socketID.local) {
                    console.log("i am user props peers", mainSocket.id)
                    mainSocket.emit('online-peer', __socketID) 
                }
            }
        }
    },
    sdpAnswer: (mainSocket, data, meetingRoomMap, user) => {
        const _connectedPeers = meetingRoomMap
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID === data.socketID.remote) {
                socket.emit('answer', {
                    sdp: data.payload,
                    socketID: data.socketID.local
                    }
                )
            }
        }
    },
    offer: (mainSocket, data, meetingRoomMap, user) => {
        const _connectedPeers = meetingRoomMap
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID === data.socketID.remote) {
                socket.emit('offer', {
                    sdp: data.payload,
                    socketID: data.socketID.local
                }
                )
            }
        }
    },
    sendCandidate: (mainSocket, data, meetingRoomMap, user) => {
        const _connectedPeers = meetingRoomMap
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID === data.socketID.remote) {
                socket.emit('candidate', {
                    candidate: data.payload,
                    socketID: data.socketID.local
                })
            }
        }
    },
}
module.exports = webRTCSocketController