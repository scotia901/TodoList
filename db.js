require('dotenv').config();
const mysql = require('mysql2');
const { Sequelize } = require('sequelize');
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

const host = process.env.MYSQL_HOST;
const port = process.env.MYSQL_PORT;
const database =  process.env.MYSQL_TODO_DATABASE;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;


// const sequelize = new Sequelize(database, user, password, {
//     host: host,
//     dialect: 'mysql'
// });

// try {
//     sequelize.authenticate();
//     console.log('Connection has been established successfully.');
// } catch (error) {
//     console.error('Unable to connect to tha database:', error);
// }

module.exports = mysql.createPool(dbOptions);