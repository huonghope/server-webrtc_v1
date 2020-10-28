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
        const id = uid(10);
        await db.query(sql.room.createRoom, [roomname, id, username])
        let [row] = await db.query(sql.room.getInformationRoomByName, [roomname])
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
    console.log(username)
    let [rows] = await db.query(sql.room.getRoomsByUsername, [username])
    res.send({
        result: true,
        data: rows,
        message: '미팅 방 만들기 성공함 '
    })
})


const rooms = {}
const messages = {}

router.joinRoom = function (io) {
    io.on('connection', function (socket) {

        console.log('connected', socket.id)
        //!roomname or roomid
        // socket.on('joinroom', async ({username, roomname}) => {
        //     //rootUser는 방을 만듦어야함
        //     //들어가는 user가 rootUser socket_id 기준으로 socket 접급
        //     const [row] = await db(sql.room.getInformationRoomByName, [roomname])
        //     if(row.length !== 0 ){

        //         socket.join(row[0].socket_id)

        //          // Send users and room info
        //         io.to(row[0].socket_id).emit('roomUsers', {
        //             room: row[0].roonname,
        //             users: username
        //         });
        //     }
        //     res.send({
        //         result: true,
        //         data: [],
        //         message: '해당하는 방이 없음'
        //     })

        // })

        //! room 변수를 받아서 Socket를 그룹을 생성
        const room = socket.handshake.query.room

        rooms[room] = rooms[room] && rooms[room].set(socket.id, socket) || (new Map()).set(socket.id, socket)
        messages[room] = messages[room] || []

        // connectedPeers.set(socket.id, socket)

        console.log(socket.id, room)
        socket.emit('connection-success', {
            success: socket.id,
            peerCount: rooms[room].size,
            messages: messages[room],
        })

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

        // const disconnectedPeer = (socketID) => socket.broadcast.emit('peer-disconnected', {
        //   peerCount: connectedPeers.size,
        //   socketID: socketID
        // })
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
            console.log('new-message', JSON.parse(data.payload))

            messages[room] = [...messages[room], JSON.parse(data.payload)]
        })

        socket.on('disconnect', () => {
            console.log('disconnected')
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

        socket.on('onlinePeers', (data) => {
            const _connectedPeers = rooms[room]
            for (const [socketID, _socket] of _connectedPeers.entries()) {
                // don't send to self
                if (socketID !== data.socketID.local) {
                    console.log('online-peer', data.socketID, socketID)
                    socket.emit('online-peer', socketID)
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