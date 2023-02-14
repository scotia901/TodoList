require('dotenv').config();
const mysql = require('mysql2');
const dbOptions = {
host: process.env.MYSQL_HOST,
port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TODO_DATABASE,
    waitForConnections: process.env.MYSQL_WAIT_CONN,
    connectionLimit: process.env.MYSQL_CONN_LIMIT,
    queueLimit: process.env.MYSQL_QUEUE_LIMIT
};

module.exports = mysql.createPool(dbOptions);