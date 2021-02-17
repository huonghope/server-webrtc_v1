const { getFirstValueMap, sleep } = require('../helper')
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
    onlinePeers:  async  (mainSocket, data, meetingRoomMap, user, userRoom) => {
        const _connectedPeers = meetingRoomMap
        console.log("MAP SIZE", meetingRoomMap.size)
        
        // const [socketID, _socket] =  _connectedPeers.entries().next().value;
        // 강사는 나갔을때 
        if(! await getFirstValueMap(_connectedPeers, userRoom.room_id))
        {
            return;
        }
        const [socketID, _socket] =  await getFirstValueMap(_connectedPeers, userRoom.room_id);
        console.log(socketID,  data.socketID.local)
        if (socketID !== data.socketID.local) { //일단 유저
            console.log("======================================USER CONNECT TO HOST======================================", socketID)
            mainSocket.emit('online-peer', socketID) 
        }else{  //강사인 경우에는 다른 유저를 연결함
            console.log(socketID)
            for (const [__socketID, __socket] of _connectedPeers.entries()) {
                if (__socketID !== data.socketID.local) {
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
                        socketID: data.socketID.local,
                        peerCount: _connectedPeers.size
                    }
                )
            }
        }
    },
    offer: (mainSocket, data, meetingRoomMap, user) => {
        const _connectedPeers = meetingRoomMap
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID === data.socketID.remote) {
                console.log("change cadidate offter")
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
    shareScream: async (mainSocket, data, meetingRoomMap, user, userRoom) => {
        const _connectedPeers = meetingRoomMap
        console.log(data.payload)
        console.log(meetingRoomMap.size)
        for (const [socketID, socket] of _connectedPeers.entries()) {
            if (socketID !== mainSocket.id) {
                socket.emit('share-scream', {
                    shareScream: data.payload,
                    peerCount: meetingRoomMap.size
                })
                await sleep(500);
            }
        }
    },
}
module.exports = webRTCSocketController