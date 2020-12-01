module.exports = {
    //INSERT
    createRoom : 'insert into plass_room(roomname, username) values (?, ?)',
    insertRoomUser: 'insert into plass_userroom(username, roomname, host_user, socket_id) values (?, ?, ?, ?)',
    
    //SELECT
    getAllRoom : 'select * from plass_room',
    getInformationRoomByName: 'select * from plass_room where roomname = ? and username = ?',
    getInformationRoomByAllName: 'select * from plass_room where roomname = ?',
    getRoomsByUsername: 'select * from plass_room where username = ?',
    getListUserByRoomname: 'SELECT * FROM webrtc.plass_userroom where roomname = ? order by host_user DESC ;',
    getRoomByRoomname: 'select * from plass_room where roomname = ?',

    //
    selectRoomByUsername: 'select * from plass_userroom where roomname = ? and username = ?',


    //where update socket.is-disabled
    updateSocketId: 'update plass_userroom set socket_id = ? where roomname = ? and username = ?'


}