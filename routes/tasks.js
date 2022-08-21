require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const taskManager = require('./manager');
const todoDbOptions = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TODO_DATABASE
};
const manager = new taskManager(todoDbOptions);
const DEFAULT_CATEGORY = "오늘의 할 일";
const DB_CONN_ERR_MSG = "DB CONNECT FAILED";

router.get('/', async (req, res) => {
    try {
        if (req.session.isLogined) {
            var category = decodeURI(req.cookies.category);
            if (!req.cookies.category && req.cookies.category == undefined) {
                res.cookie("category", encodeURI(DEFAULT_CATEGORY), {
                    httpOnly: false,
                    sameSite: 'lax'
                });
                category = DEFAULT_CATEGORY;
            }
            if (!req.cookies.toogle && req.cookies.category == undefined) res.cookie("toggle", "none", {
                httpOnly: false,
                sameSite: 'lax'
            });
            
            const connection = await mysql.createConnection(todoDbOptions);
            const [categories] = await connection.execute(
                `SELECT name 
                 FROM categories 
                 WHERE user_id = (SELECT id FROM users WHERE username = "${req.session.username}"
                 ORDER BY create_date DESC)`);
            
            const dateOptions = {
                month: 'numeric',
                day: 'numeric',
                weekday: 'long'
            };
            const today = new Intl.DateTimeFormat('ko-KR', dateOptions).format(new Date());
            manager.category = category;
            manager.user = req.session.username;
            await connection.end();
            await manager.connectDb();
            await manager.get();
            await manager.toHtml();
            
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "today": today,
                "username": req.session.username,
                "userimg": req.session.userimg,
                "categories": categories,
                "currentPage": category,
                "tasks": taskManager.html
            });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
});

router.post('/category/:name', async (req, res) => {
    try {
        const connection = await mysql.createConnection(todoDbOptions);
        await connection.execute(`INSERT INTO categories (id, name, user_id) SELECT unhex(replace(uuid(),'-','')), "${req.params.name}", id FROM users WHERE username = "${req.session.username}"`);
        await connection.end();
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(DB_CONN_ERR_MSG);
    }
});

router.delete('/category/:name', async (req, res) => {
    try {
        const connection = await mysql.createConnection(todoDbOptions);
        await connection.execute(`DELETE FROM tasks WHERE category_id = (SELECT id from categories WHERE name = "${req.params.name}") AND user_id = (SELECT id from users WHERE username = "${req.session.username}")`);
        await connection.execute(`DELETE FROM categories WHERE name = "${req.params.name}" AND user_id = (SELECT id FROM users WHERE username = "${req.session.username}")`);
        res.cookie("category", encodeURI("오늘 할 일"), {
            httpOnly: false,
            sameSite: 'lax'
        });
        res.sendStatus(200);
    } catch (error) {
        res.status(400).send(DB_CONN_ERR_MSG);
    }
});

router.get("/search/:text", async (req, res) => {
    try {
        taskManager.category = "검색 결과";

        await taskManager.search(req.params.text);
        await taskManager.toHtml();
        res.cookie("category", encodeURI("검색 결과"), {
            httpOnly: false,
            sameSite: 'lax'
        });

        res.status(200).send(taskManager.html);
    } catch (error) {
        res.status(400).send(DB_CONN_ERR_MSG);
    }
});

router.post('/post/:category/:msg', async (req, res) => {
    try {
        const query = `INSERT INTO tasks (id, description, user_id, category_id)
                        SELECT (unhex(replace(uuid(),'-',''))),
                        "${req.params.msg}",
                        (SELECT id FROM users WHERE username = "${req.session.username}"),
                        (SELECT id FROM categories WHERE name="${req.params.category}"
                        AND user_id = (SELECT id FROM users WHERE username = "${req.session.username}"));`;
        
        await taskManager.handle(req, query);
        res.status(200).send(taskManager.html);
    } catch (error) {
        res.status(400).send();
    }
});

router.put('/edit/:id/:msg', async (req, res) => {
    try {
        const query = `UPDATE tasks SET description = "${req.params.msg}" WHERE id = unhex("${req.params.id}")`;
        await taskManager.handle(req, query);
        res.status(200).send(taskManager.html);
    } catch (error) {
        res.statusCode(400);
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const query = `DELETE FROM tasks WHERE id = unhex("${req.params.id}")`;        
        await taskManager.handle(req, query);
        res.status(200).send(taskManager.html);
    } catch (error) {
        res.status(400).send(DB_CONN_ERR_MSG);
    }
});

router.put('/complete/:id', async (req, res) => {
    try {
        const query = `UPDATE tasks SET achievement = 1 WHERE id = unhex("${req.params.id}")`;        
        await taskManager.handle(req, query);
        res.status(200).send(taskManager.html);
    } catch (error) {
        res.status(400).send(DB_CONN_ERR_MSG);
    }
});

router.put('/incomplete/:id', async (req, res) => {
    try {
        const query = `UPDATE tasks SET achievement = 0 WHERE id = unhex("${req.params.id}")`
        await taskManager.handle(req, query);
        res.status(200).send(taskManager.html);
    } catch (error) {
        res.status(400).send(DB_CONN_ERR_MSG);
    }
});

router.put("/mark/:taskId", async (req, res) => {
    try {
        const query = `UPDATE tasks SET importance = NOT importance WHERE id = unhex("${req.params.taskId}") AND user_id = (SELECT id FROM users WHERE username = "${req.session.username}")`;        
        await taskManager.handle(req, query);
        res.status(200).send(taskManager.html);
    } catch (error) {
        console.log(error);
        res.status(400).send(DB_CONN_ERR_MSG);
    }
});

module.exports = router;