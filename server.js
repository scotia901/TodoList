const authModel = require('./models/authModel');

async function main () {
    require('dotenv').config();
    const path = require('path');
    const express = require('express');
    const app = express();
    const errorMiddleware = require('./middleware/errorMiddleware');
    const AuthMiddleware = require('./middleware/authMiddleware');
    const mysql = require('mysql2/promise');
    const session = require('express-session');
    const MySQLStore = require('express-mysql-session')(session);
    const cookieParser = require('cookie-parser');
    const sessDbOptions = {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_SESSION_DATABASE,
        waitForConnections: process.env.MYSQL_WAIT_CONN,
        connectionLimit: process.env.MYSQL_CONN_LIMIT,
        queueLimit: process.env.MYSQL_QUEUE_LIMIT
    };
    const HALF_HOUR = 1800000;
    const connSessDb = mysql.createPool(sessDbOptions);
    const sessionStore = new MySQLStore({}, connSessDb);
    const sessOptions = {
        secret: process.env.SESSION_SECRET,
        resave: true,
        store: sessionStore,
        rolling: true,
        saveUninitialized: false,
        cookie: {   maxAge: HALF_HOUR,
                    expries: new Date(Date.now() + HALF_HOUR),
                    sameSite: process.env.SESSION_SAMESITE
                }
    };
    const categoryRoutes = require('./routes/categoryRoute');
    const taskRoutes = require('./routes/taskRoute');
    const userRoutes = require('./routes/userRoute');
    const authRoutes = require('./routes/authRoute');

    app.set('view engine', 'pug');
    app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/users')]);
    app.use(session(sessOptions));
    app.use(express.static('public'));
    app.use(express.static('utilities'));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(express.json());

    app.get('/', async (req, res, next) => {
        if(req.session.user) {
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "nickname": req.session.user.nickname,
                "profileImg": req.session.user.profileImg
            });
        } else {
            res.redirect('/users/login');
        }
    });

    app.use(AuthMiddleware.isLogined);
    app.use(AuthMiddleware.refreshSessionData);
    app.use('/users', userRoutes);
    app.use('/categories', categoryRoutes);
    app.use('/tasks', taskRoutes);
    app.use('/auth', authRoutes);
    app.listen(process.env.SERVER_PORT, () => {
        let appOpenTime = new Date();
        console.log(`App open on ${appOpenTime.toLocaleString()} and listening on Port:${process.env.SERVER_PORT}`);
    });
    
    app.use(errorMiddleware.logErrors);
    app.use(errorMiddleware.clientErrorHandler);
    app.use(errorMiddleware.errorHandler);
    app.use((req, res, next) => {
        res.status(404).render('error', { "pageTitle": process.env.PAGE_TITLE, "status": 404, "errMsg": "Not Found" });
    });
}

main();