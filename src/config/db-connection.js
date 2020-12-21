var mysql = require('mysql2/promise');

var connectionPool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	port: process.env.MYSQL_PORT,
	user: process.env.MYSQL_ID,
	password: process.env.MYSQL_PASS,
	database: process.env.MYSQL_DB,
	connectionLimit: 100,
	connectTimeout: 600000
});

module.exports = connectionPool;