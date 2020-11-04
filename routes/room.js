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
    console.log(username)
    let [rows] = await db.query(sql.room.getRoomsByUsername, [username])
    res.send({
        result: true,
        data: rows,
        message: '미팅 방 만들기 성공함 '
    })
})


var rooms = {}
const messages = {}

router.joinRoom = function (io) {
    io.on('connection', function (socket) {

        console.log('connected', socket.id)
        //!roomname or roomid
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


        console.log("check room", rooms[room])
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
            console.log('new-message', JSON.parse(data.payload))
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