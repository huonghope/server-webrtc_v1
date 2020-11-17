var express = require('express')
var router = express.Router()
var uid = require('uid')
var db = require('../modules/db-connection')
var sql = require('../sql')

//!Socket로 수정 필요함
router.get('/', async function (req, res) {
    const [rows] = await db.query(sql.room.getAllRoom)
    res.send({
        result: true,
        data: rows,
        message: '미팅 방 만들기 성공함 '
    })
})

router.post('/createroom', async function (req, res) {
    const { roomname, username } = req.body;
    let [row] = await db.query(sql.room.getInformationRoomByAllName, [roomname, username])
    console.log(row)
    if(row.length === 0)
    {
        // const id = uid(10);
        await db.query(sql.room.createRoom, [roomname, username])
        let [row] = await db.query(sql.room.getInformationRoomByName, [roomname, username])
        res.send({
            result: true,
            data: row,
            message: '미팅 방 만들기 성공함 '
        })

    }else{
        res.send({
            result: false,
            data: [],
            message: '해당하는 유저는 같은 룸이 중복됩니다.'
        })
    }
})


router.get('/search', async function (req, res) {
    const { username } = req.query;
    let [rows] = await db.query(sql.room.getRoomsByUsername, [username])
    res.send({
        result: true,
        data: rows,
        message: '미팅 방 만들기 성공함 '
    })
})

router.get('/joinroomcheck', async function (req, res) {
    const { roomname } = req.query;
    let [rows] = await db.query(sql.room.getRoomByRoomname, [roomname])
    if(rows.length !== 0){
        res.send({
            result: false,
            data: [],
            message: '방이 존재하지 않습니다.'
        })
    }else{
        res.send({
            result: true,
            data: [],
            message: '미팅 접속 가능합니다'
        })

    }
})

//방의 host 출력함
router.get('/gethostroom', async function (req, res) {
    const { roomname,username } = req.query;
    let [row] = await db.query(sql.room.selectRoomByUsername, [roomname, username])
    try {
        if(row.length === 1){
            let [row] = await db.query(sql.room.getHostSocketIdByRoomname, [roomname])
            if(row.length === 1)
                res.send({
                    result: true,
                    data: row[0].socket_id,
                    message: '해당하는 유저는 '
                })
            else
                res.send({
                    result: true,
                    data: [],
                    message: '해당하는 유저는 '
                })
        }else{
            res.send({
                result: true,
                data: [],
                message: '해당하는 유저는 '
            })
        }
    } catch (error) {
        console.log(error)
    }
})

var rooms = {}
const messages = {}

router.joinRoom = function (io) {
    io.on('connection', function (socket) {

        console.log('connected', socket.id)
        //! room 변수를 받아서 Socket를 그룹을 생성
        let room = socket.handshake.query.room //join 한방 사람임
        const username = socket.handshake.query.username //name

        //Socket host
        if(!rooms[room]){
            rooms[room] = new Map();
            rooms[room].set(socket.id, socket);
        }
        
        //해당하는사람이 룸을 먼저 들어가면[또는 디비에서 저장되는거 없음] => Host user
        // rooms[room] = rooms[room] && rooms[room].set(socket.id,socket) || (new Map()).set(socket.id, socket)

        const checkRoom = async () => {
            let [row] = await db.query(sql.room.getInformationRoomByName, [room, username])
            if(row.length === 1) //host user
            {
                let [row] = await db.query(sql.room.selectRoomByUsername, [room, username])
                rooms[room] = new Map([[socket.id, socket], ...rooms[room]]);
                // console.log(row)
                if(row.length === 0)
                {
                    await db.query(sql.room.insertRoomUser, [username, room, 1, socket.id])

                }else if(row.length === 1) { //exists update by socket.id for host
                    await db.query(sql.room.updateSocketId, [socket.id, room, username])
                }
        
            }else{
                let [row] = await db.query(sql.room.selectRoomByUsername, [room, username])
                if(row.length === 0)
                {
                    await db.query(sql.room.insertRoomUser, [username, room, 0, socket.id])
                }else if(row.length === 1) {
                    await db.query(sql.room.updateSocketId, [socket.id, room, username])
                }
                rooms[room].set(socket.id, socket);
            }
            socket.emit('connection-success', {
                isHost: socket.id === rooms[room].entries().next().value[0],
                success: socket.id,
                peerCount: rooms[room].size,
                messages: messages[room],
            })
        }

        messages[room] = messages[room] || []
        // console.log(rooms)
        checkRoom();


        // connectedPeers.set(socket.id, socket)

        // console.log(socket.id, room)
     
        // const broadcast = () => socket.broadcast.emit('joined-peers', {
        //   peerCount: connectedPeers.size,
        // })

        const broadcast = () => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // if (socketID !== socket.id) {
                _socket.emit('joined-peers', {
                    peerCount: rooms[room].size, //connectedPeers.size,
                })
                // }
            }
        }
        broadcast()

        const disconnectedPeer = (socketID) => {
            const _connectedPeers = rooms[room]
            for (const [_socketID, _socket] of _connectedPeers.entries()) {
                _socket.emit('peer-disconnected', {
                    peerCount: rooms[room].size,
                    socketID
                })
            }
        }

        socket.on('new-message', (data) => {
            console.log(data)
            // console.log('new-message', JSON.parse(data.payload))
            messages[room] = [...messages[room], JSON.parse(data.payload)]
        })

        socket.on('disconnect', () => {
            console.log('disconnected',socket.id)
            // connectedPeers.delete(socket.id)
            rooms[room].delete(socket.id)
            messages[room] = rooms[room].size === 0 ? null : messages[room]
            disconnectedPeer(socket.id)
        })

        // ************************************* //
        // NOT REQUIRED
        // ************************************* //
        socket.on('socket-to-disconnect', (socketIDToDisconnect) => {
            console.log('disconnected')
            // connectedPeers.delete(socket.id)
            rooms[room].delete(socketIDToDisconnect)
            messages[room] = rooms[room].size === 0 ? null : messages[room]
            disconnectedPeer(socketIDToDisconnect)
        })

        //! Check 
        socket.on('onlinePeers', (data) => {
            const _connectedPeers = rooms[room]
            console.log("connect")
            const [socketID, _socket] =  rooms[room].entries().next().value;
            if (socketID !== data.socketID.local) {
                console.log('online-peer', data.socketID, socketID)
                socket.emit('online-peer', socketID) //자기는 다른 Sockeet를 Id를 보내 Peer 만듦
            }
            // for (const [socketID, _socket] of _connectedPeers.entries()) {
            //     // don't send to self
            //     if (socketID !== data.socketID.local) {
            //         console.log('online-peer', data.socketID, socketID)
            //         socket.emit('online-peer', socketID) //자기는 다른 Sockeet를 Id를 보내 Peer 만듦
            //     }
            // }
        })
        socket.on('allmute', (data) => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID !== data.socketID.local) {
                    _socket.emit('request_mic_mute', socketID)
                }
            }
        })

        socket.on('request_question', (data) => {
            const [socketID, _socket] =  rooms[room].entries().next().value;
            _socket.emit('request_question', data.socketID.local)
            
        })
        
        socket.on('request_out', (data) => {
            const [socketID, _socket] =  rooms[room].entries().next().value;
            _socket.emit('request_out', data.socketID.local)
        })

        socket.on('action_user_warning', (data) => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID === data.socketID.remoteSocketId) {
                    _socket.emit('action_user_warning', socketID)
                }
            }
        })

        socket.on('action_user_disconnect', (data) => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID === data.socketID.remoteSocketId) {
                    _socket.emit('action_user_disconnect', socketID)
                }
            }
        })
        socket.on('action_user_disable_chatting', (data) => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID === data.socketID.remoteSocketId) {
                    _socket.emit('action_user_disable_chatting', socketID)
                }
            }
        })

        socket.on('action_user_request_cancel_out', (data) => {
            const [socketID, _socket] =  rooms[room].entries().next().value;
            _socket.emit('action_host_request_cancel_out', data.socketID.local)
        })
        socket.on('action_host_chat', (data) => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID !== data.socketID.local) {
                    _socket.emit('action_host_chat', socketID)
                }
            }
        })

        //host user button click event
        socket.on('action_user_request', (data) => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID === data.socketID.remoteSocketId) {
                    switch (data.payload.method) {
                        case "question":
                            //only send to request user
                            _socket.emit('action_user_request_question', data.payload.type)
                            break;
                        case "out":
                            console.log("server send", data)
                            // send to host 
                            socket.emit('action_user_request_out_host',{
                                type: data.payload.type,
                                remoteSocketId: data.socketID.remoteSocketId
                            })
                            //sent to user
                            _socket.emit('action_user_request_out_normaluser', data.payload.type)
                            break;
                        default:
                            break;
                    }
                }
            }
        })


        socket.on('offer', data => {
            // console.log(data)
            const _connectedPeers = rooms[room]
            for (const [socketID, socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID === data.socketID.remote) {
                    // console.log('Offer', socketID, data.socketID, data.payload.type)
                    socket.emit('offer', {
                        sdp: data.payload,
                        socketID: data.socketID.local
                    }
                    )
                }
            }
        })

        socket.on('answer', (data) => {
            // console.log(data)
            const _connectedPeers = rooms[room]
            for (const [socketID, socket] of _connectedPeers.entries()) {
                if (socketID === data.socketID.remote) {
                    console.log('Answer', socketID, data.socketID)
                    socket.emit('answer', {
                        sdp: data.payload,
                        socketID: data.socketID.local
                        }
                    )
                }
            }
        })

        // socket.on('offerOrAnswer', (data) => {
        //   // send to the other peer(s) if any
        //   for (const [socketID, socket] of connectedPeers.entries()) {
        //     // don't send to self
        //     if (socketID !== data.socketID) {
        //       console.log(socketID, data.payload.type)
        //       socket.emit('offerOrAnswer', data.payload)
        //     }
        //   }
        // })

        socket.on('candidate', (data) => {
            // console.log(data)
            const _connectedPeers = rooms[room]
            // send candidate to the other peer(s) if any
            for (const [socketID, socket] of _connectedPeers.entries()) {
                if (socketID === data.socketID.remote) {
                    socket.emit('candidate', {
                        candidate: data.payload,
                        socketID: data.socketID.local
                    })
                }
            }
        })



        // const room = socket.handshake.query.room

        // //! room 변수를 받아서 Socket를 그룹을 생성
        // rooms[room] = rooms[room] && rooms[room].set(socket.id, socket) || (new Map()).set(socket.id, socket)
        // messages[room] = messages[room] || []

     
    })
}
module.exports = router;