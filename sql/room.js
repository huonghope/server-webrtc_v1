module.exports = {
    //INSERT
    insertRoom : 'insert into plass_room(user_idx, lec_idx, room_name, redirect_id) values (?, ?, ?, ?)',
    insertRoomUser: 'insert into plass_userroom(username, roomname, host_user) values (?, ?, ?)',
    insertSocketIdToUserRoom: 'update plass_userroom set socket_id = ? where user_idx = ? and room_id = ?',
    insertUserRoom: 'insert into plass_userroom(user_idx, room_id, host_user) values (?, ?, ?)',
    //SELECT
    getAllRoom : 'select * from plass_room',
    getInformationRoomByName: 'select * from plass_room where roomname = ? and username = ?',
    getInformationRoomByAllName: 'select * from plass_room where roomname = ?',
    getRoomsByUsername: 'select * from plass_room where username = ?',
    getListUserByRoomname: 'SELECT * FROM webrtc.plass_userroom where roomname = ? order by host_user DESC ;',
    getRoomByRoomname: 'select * from plass_room where roomname = ?',
    getRoomById: "select * from plass_room where id = ?",
    getRoomByRoomName: "select * from plass_userroom where roomname = ?",
    getRoomUserByUserName: "select * from plass_userroom where username = ?",
    getRoomByRedirectId: "select * from plass_room where redirect_id = ?",
    getNearestRoomByRedirectId: "select * from plass_room where redirect_id = ? order by id desc LIMIT 1" ,
    getListUserByRoomId: "select ur.*,u.user_name,user_tp from plass_userroom as ur, plass_user as u where u.user_idx = ur.user_idx and ur.room_id = ?",
    selectUserRoomByIdAndUserId: "select * from plass_userroom where id = ? and user_idx = ?",
    getHostUserRoomInfo: "select * from plass_userroom where room_id = ? and host_user = 1",


    getUserRoomByRoomIdAndUserId: "select * from plass_userroom where room_id = ? and user_idx = ?",

    getRoomByLecIdxAndUserIdx: "select * from plass_room where lec_idx = ? and user_idx = ?",
    getUserRoomById: "select * from plass_userroom where id = ?",
    //
    selectRoomByUsername: 'select * from plass_userroom where roomname = ? and username = ?',
    getUseRoomBySocketId: 'select * from plass_userroom where socket_id',


    //where update socket.is-disabled
    updateSocketId: 'update plass_userroom set socket_id = ? where roomname = ? and username = ?'


}