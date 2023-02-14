require('dotenv').config();
const taskController = require('../controllers/taskController');
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const taskmanager = require('./manager');
const todoDbOptions = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TODO_DATABASE
};
const manager = new taskmanager(todoDbOptions);
const DEFAULT_CATEGORY = "오늘의 할 일";
const DB_CONN_ERR_MSG = "DB CONNECTION FAILED";

router.use((req, res, next) => {
    if (!req.session.isLogined) {
        const err = new Error('Forbidden');
        err.status = 403;
        next(err);
    } else {
        next();
    }
});

router.get('/count', async (req, res, next) => {
    try {
        const connection = await mysql.createConnection(todoDbOptions);
        const [today] = await connection.execute(
            `SELECT COUNT(id) as count, "오늘 할 일" as name
            FROM tasks
            WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}") AND deadline = curdate()`);
        const [importance] = await connection.execute(
            `SELECT COUNT(id) as count, "중요" as name
            FROM tasks
            WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}") AND importance = TRUE`);
        const [planned] = await connection.execute(
            `SELECT COUNT(id) as count, "계획된 일정" as name
            FROM tasks
            WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}") AND deadline IS NOT NULL`);
        const [categories] = await connection.execute(
            `SELECT COUNT(category_id) as count, IF(CAST(tasks.category_id as CHAR)="work", "작업", hex(category_id)) AS name
            FROM tasks LEFT JOIN categories ON tasks.category_id = categories.id
            WHERE tasks.user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}")
            GROUP BY name`);
        
        let results = Array.prototype.concat(today[0], importance[0], planned[0], categories);
        res.status(200).send(results);
    } catch (err) {
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        if (req.session.isLogined) {
            const connection = await mysql.createConnection(todoDbOptions);
            const [categories] = await connection.execute(
                `SELECT name, hex(id) as id
                FROM categories 
                WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}"
                ORDER BY create_date DESC)`);
            const dateOptions = {
                month: 'numeric',
                day: 'numeric',
                weekday: 'long'
            };
            const today = new Intl.DateTimeFormat('ko-KR', dateOptions).format(new Date());

            await connection.end();
            await manager.connectDb();
            await manager.get();
            await manager.toHtml();
            await manager.disconnectDb();

            console.log(req.session.username);
            
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "today": today,
                "user_id": req.session.user_id,
                "username": req.session.username,
                "userimg": req.session.userimg,
                "categories": categories,
                "currentPage": manager.category,
                "tasks": manager.html
            });
        } else {
            res.redirect('/users/login');
        }
    } catch (err) {
        next(err);
    }
});

router.get('/today', async (req, res, next) => {
    try {
            const connection = await mysql.createConnection(todoDbOptions);
            const [categories] = await connection.execute(
                `SELECT name, hex(id) as id
                 FROM categories 
                 WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}"
                 ORDER BY create_date DESC)`);
            const dateOptions = {
                month: 'numeric',
                day: 'numeric',
                weekday: 'long'
            };
            const today = new Intl.DateTimeFormat('ko-KR', dateOptions).format(new Date());
            
            manager.category = "오늘 할 일"
            manager.user = req.session.user_id;
            await connection.end();
            await manager.connectDb();
            await manager.get();
            await manager.toHtml();
            await manager.disconnectDb();
            
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "today": today,
                "user_id": req.session.user_id,
                "userimg": req.session.userimg,
                "username": req.session.username,
                "categories": categories,
                "currentPage": manager.category,
                "tasks": manager.html
            });
    } catch (err) {
        next(err);
    }
});

router.get('/import', async (req, res, next) => {
    try {
            const connection = await mysql.createConnection(todoDbOptions);
            const [categories] = await connection.execute(
                `SELECT name, hex(id) as id
                 FROM categories 
                 WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}"
                 ORDER BY create_date DESC)`);

            manager.category = "중요";
            manager.user = req.session.user_id;
            await connection.end();
            await manager.connectDb();
            await manager.get();
            await manager.toHtml();
            await manager.disconnectDb();
            
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "user_id": req.session.user_id,
                "userimg": req.session.userimg,
                "username": req.session.username,
                "categories": categories,
                "currentPage": manager.category,
                "tasks": manager.html
            });
    } catch (err) {
        next(err);
    }
});

router.get('/plan', async (req, res, next) => {
    try {
            const connection = await mysql.createConnection(todoDbOptions);
            const [categories] = await connection.execute(
                `SELECT name, hex(id) as id
                 FROM categories 
                 WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}"
                 ORDER BY create_date DESC)`);

            manager.category = "계획된 일정";
            manager.user = req.session.user_id;
            await connection.end();
            await manager.connectDb();
            await manager.get();
            await manager.toHtml();
            await manager.disconnectDb();
            
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "user_id": req.session.user_id,
                "userimg": req.session.userimg,
                "username": req.session.username,
                "categories": categories,
                "currentPage": manager.category,
                "tasks": manager.html
            });
    } catch (err) {
        next(err);
    }
});

router.get('/work', async (req, res, next) => {
    try {
            const connection = await mysql.createConnection(todoDbOptions);
            const [categories] = await connection.execute(
                `SELECT name, hex(id) as id
                 FROM categories 
                 WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}"
                 ORDER BY create_date DESC)`);

            manager.category = "작업";
            manager.user = req.session.user_id;
            await connection.end();
            await manager.connectDb();
            await manager.get();
            await manager.toHtml();
            await manager.disconnectDb();
            
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "user_id": req.session.user_id,
                "userimg": req.session.userimg,
                "username": req.session.username,
                "categories": categories,
                "currentPage": manager.category,
                "tasks": manager.html
            });
    } catch (err) {
        next(err);
    }
});

router.get('/category', async (req, res, next) => {
//     try {
//         const connection = await mysql.createConnection(todoDbOptions);
//         const [categories] = await connection.execute(
//             `SELECT name, hex(id) as id
//             FROM categories 
//             WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}"
//             ORDER BY create_date DESC)`);
//         manager.category = req.query.id;
//         manager.user = req.session.user_id;
//         const [category] = await connection.execute(
//             `SELECT name FROM categories WHERE id = unhex("${manager.category}")`
//         );
//             await connection.end();
//             await manager.connectDb();
//             await manager.get();
//             await manager.toHtml();
//             await manager.disconnectDb();
        
//         res.render('tasks', {
//             "pageTitle": process.env.PAGE_TITLE,
//             "user_id": req.session.user_id,
//             "userimg": req.session.userimg,
//             "username": req.session.username,
//             "categories": categories,
//             "currentPage": category[0].name,
//             "tasks": manager.html
//         });
// } catch (err) {
//     next(err)
// }
    taskController.getTaskByUserIdAndCategoryId(req, res);
});

router.post('/category/:name', async (req, res, next) => {
    try {
        const connection = await mysql.createConnection(todoDbOptions);
        await connection.execute(
            `INSERT INTO categories (id, name, user_id)
             SELECT unhex(replace(uuid(),'-','')), "${req.params.name}", id 
             FROM users WHERE user_id = "${req.session.user_id}"`);
        await connection.end();
        res.sendStatus(201);
    } catch (err) {
        next(err)
    }
});

router.put('/category/:id/:name', async (req, res, next) => {
    try {
        const connection = await mysql.createConnection(todoDbOptions);
        await connection.execute(
            `UPDATE categories
             SET name = "${req.params.name}"
             WHERE id = unhex("${req.params.id}")
             AND user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}")`);
        await connection.end();
        res.cookie("category_name", encodeURI(req.params.name), {
            httpOnly: false,
            sameSite: 'lax'
        });
        res.sendStatus(204);
    } catch (err) {
        next(err)
    }
})

router.delete('/category', async (req, res, next) => {
    try {
        const connection = await mysql.createConnection(todoDbOptions);
        await connection.execute(
            `DELETE FROM tasks
             WHERE category_id = unhex("${req.query.id}")
             AND user_id = (SELECT id from users WHERE user_id = "${req.session.user_id}")`);
        await connection.execute(
            `DELETE FROM categories
             WHERE id = unhex("${req.query.id}")
             AND user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}")`);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

router.get("/search/:text", async (req, res, next) => {
    // try {
    //     await manager.connectDb();
    //     await manager.search(req.params.text);
    //     await manager.toHtml();
    //     await manager.disconnectDb();
    //     res.cookie("category", encodeURI("검색 결과"), {
    //         httpOnly: false,
    //         sameSite: 'lax'
    //     });

    //     res.status(200).send(manager.html);
    // } catch (err) {
    //     next(err);
    // }

    taskController.getTasksByUserIdAndSearchWord(req, res);
});

router.post('/post/:category/:msg', async (req, res, next) => {
    try {
        var query
        if (req.params.category == "import") {
            query = `INSERT INTO tasks (id, description, user_id, category_id, importance)
                        SELECT (unhex(replace(uuid(),'-',''))),
                        "${req.params.msg}",
                        (SELECT id FROM users WHERE user_id = "${req.session.user_id}"),
                        "work",
                        true;`;
        } else if (req.params.category == "today") {
            query = `INSERT INTO tasks (id, description, user_id, category_id, deadline)
                        SELECT (unhex(replace(uuid(),'-',''))),
                        "${req.params.msg}",
                        (SELECT id FROM users WHERE user_id = "${req.session.user_id}"),
                        "work",
                        curdate();`;
        } else if (req.params.category == "plan") {
            query = `INSERT INTO tasks (id, description, user_id, category_id, deadline)
                        SELECT (unhex(replace(uuid(),'-',''))),
                        "${req.params.msg}",
                        (SELECT id FROM users WHERE user_id = "${req.session.user_id}"),
                        "work",
                        curdate();`;
        } else if (req.params.category == "work") {
            query = `INSERT INTO tasks (id, description, user_id, category_id)
                        SELECT (unhex(replace(uuid(),'-',''))),
                        "${req.params.msg}",
                        (SELECT id FROM users WHERE user_id = "${req.session.user_id}"),
                        "work";`;
        } else {
           
        }

        await manager.handle(req, query);
        res.status(200).send(manager.html);
    } catch (err) {
        next(err);
    }
});

router.put('/edit/:id/:msg', async (req, res, next) => {
    try {
        const query = `UPDATE tasks SET description = "${req.params.msg}" WHERE id = unhex("${req.params.id}")`;
        
        await manager.handle(req, query);

        res.status(200).send(manager.html);
    } catch (err) {
        next(err);
    }
});

router.delete('/delete/:id', async (req, res, next) => {
    try {
        const query = `DELETE FROM tasks WHERE id = unhex("${req.params.id}")`;        
        await manager.handle(req, query);

        // may be replace 204 http code
        res.status(200).send(manager.html);
    } catch (err) {
        next(err);
    }
});

router.put('/complete/:id', async (req, res, next) => {
    try {
        const query = `UPDATE tasks SET achievement = 1 WHERE id = unhex("${req.params.id}")`;        
        await manager.handle(req, query);

        res.status(200).send(manager.html);
    } catch (err) {
        next(err);
    }
});

router.put('/incomplete/:id', async (req, res, next) => {
    try {
        const query = `UPDATE tasks SET achievement = 0 WHERE id = unhex("${req.params.id}")`
        await manager.handle(req, query);

        res.status(200).send(manager.html);
    } catch (err) {
        next(err);
    }
});

router.put("/mark/:taskId", async (req, res, next) => {
    try {
        const query = `UPDATE tasks SET importance = NOT importance WHERE id = unhex("${req.params.taskId}") AND user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}")`;        
        await manager.handle(req, query);

        res.status(200).send(manager.html);
    } catch (err) {
        next(err);
    }
});

router.put("/deadline/:taskId/:deadline", async (req, res, next) => {
    try {
        let date = '"' + req.params.deadline + '"';
        if(req.params.deadline == "0000-00-00") date = null;
        const query = `UPDATE tasks SET deadline = date(${date}) WHERE id = unhex("${req.params.taskId}") AND user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}")`;
        await manager.handle(req, query);

        res.status(200).send(manager.html);
    } catch (err) {
        next(err);
    }
})

module.exports = router;