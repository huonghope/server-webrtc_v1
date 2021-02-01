module.exports = {
    //INSERT
    insertRoom : 'insert into plass_room(user_idx, lec_idx, room_name, redirect_id, s_time, e_time) values (?, ?, ?, ?, ?, ?)',
    insertRoomUser: 'insert into plass_userroom(username, roomname, host_user) values (?, ?, ?)',
    insertSocketIdToUserRoom: 'update plass_userroom set socket_id = ? where id = ?',
    insertUserRoom: 'insert into plass_userroom(user_idx, room_id, host_user, device) values (?, ?, ?, ?)',

    //SELECT
    getRoomById: "select * from plass_room where id = ?",
    getNearestRoomByRedirectId: "select * from plass_room where redirect_id = ? order by id desc LIMIT 1" ,
    getListUserByRoomId: "select ur.*,u.user_name,user_tp from plass_userroom as ur, plass_user as u where u.user_idx = ur.user_idx and ur.room_id = ?",
    selectUserRoomByIdAndUserId: "select * from plass_userroom where id = ? and user_idx = ?",
    getHostUserRoomInfo: "select * from plass_userroom where room_id = ? and host_user = 1",
    getUserRoomNearestTodayWithDevice: `SELECT ur.* FROM plass_userroom as ur, plass_room as r WHERE DATE(ur.update_time) = CURDATE() 
    and ur.user_idx = ?
    and r.id = ur.room_id
    and r.lec_idx = ?
    and ur.device = ?
    order by ur.id desc LIMIT 1
    `,
    getUserRoomNearestTodayNoDevice: `SELECT ur.* FROM plass_userroom as ur, plass_room as r WHERE DATE(ur.update_time) = CURDATE() 
    and ur.user_idx = ?
    and r.id = ur.room_id
    and r.lec_idx = ?
    order by ur.id desc LIMIT 1
    `,
    getUserRoomByRoomIdAndUserId: "select * from plass_userroom where room_id = ? and user_idx = ?",
    getUserRoomNearestByUserId: "select * from plass_userroom where user_idx = ? order by id desc LIMIT 1",
    getRoomByLecIdxAndUserIdx: "select * from plass_room where lec_idx = ? and user_idx = ?",
    getUserRoomById: "select * from plass_userroom where id = ?",
    getUseRoomBySocketId: 'select * from plass_userroom where socket_id = ?',

    //where update socket.is-disabled
    updateSocketId: 'update plass_userroom set socket_id = ? where roomname = ? and username = ?',
    updateStateForUserRoom: 'update plass_userroom set connecting = ? where id = ?'
}