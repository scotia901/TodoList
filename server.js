async function main () {
    require('dotenv').config();
    const express = require('express');
    const path = require('path');
    const app = express();
    const mysql = require('mysql2/promise');
    const session = require('express-session');
    const MySQLStore = require('express-mysql-session')(session);
    const cookieParser = require('cookie-parser');
    const dbOptions = {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_SESSION_DATABASE,
        waitForConnections: process.env.MYSQL_WAIT_CONN,
        connectionLimit: process.env.MYSQL_CONN_LIMIT,
        queueLimit: process.env.MYSQL_QUEUE_LIMIT
    };
    const halfHour = 1800000;
    const connection = mysql.createPool(dbOptions);
    const sessionStore = new MySQLStore({}, connection);
    const sess = {
        secret: process.env.SESSION_SECRET,
        resave: true,
        store: sessionStore,
        rolling: true,
        saveUninitialized: false,
        cookie: {   maxAge: halfHour,
                    expries: new Date(Date.now() + halfHour),
                    sameSite: process.env.SESSION_SAMESITE
                }
    };
    const tasks = require('./routes/tasks');
    const users = require('./routes/users');

    app.set('view engine', 'pug');
    app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/users')]);
    app.use(session(sess));
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.json());
    app.use('/tasks', (req, res, next) => {
        try {
            const elapsedTime = req.session.cookie.originalMaxAge - req.session.cookie.maxAge;
            const refreshTime = 1000;
            if(elapsedTime > refreshTime) {
                const username = req.session.username;
                const isLogined = req.session.isLogined;
                req.session.regenerate((err) => {
                    if (err) throw err;
                    req.session.username = username;
                    req.session.isLogined = isLogined;
                    req.session.save((err) => {
                        if (err) throw err;
                    });
                    next();
                });
            } else {
                next();
            }
        } catch (error) {
            res.statusCode(400);
        }
    });

    app.use('/tasks', tasks);
    app.use('/users', users);

    app.get('/', (req, res) => {
        try {
            if(req.session.isLogined == true) {
                res.redirect('/tasks');
            } else {
                res.render('login', { "pageTitle": process.env.PAGE_TITLE });
            }
        } catch (error) {
            res.status(400).send();
        }
    });

    app.listen(process.env.SERVER_PORT, () => {
        let appOpenTime = new Date();
        console.log(`App open on ${appOpenTime.toLocaleString()} and listening on Port:${process.env.SERVER_PORT}`);
    });

    app.get('/temp', (req, res) => { 
        var text = `     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \

        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \

        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. \

        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
        res.render('white', {"paragraph" : text});
    });
}

main();