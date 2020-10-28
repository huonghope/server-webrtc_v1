module.exports = {
    //INSERT
    createRoom : 'insert into plass_room(roomname, socket_id, username) values (?, ?, ?)',
    
    //SELECT
    getAllRoom : 'select * from plass_room',
    getInformationRoomByName: 'select * from plass_room where roomname = ?',
    getInformationRoomByAllName: 'select * from plass_room where roomname = ? and username = ?',
    getRoomsByUsername: 'select * from plass_room where username = ?'

}