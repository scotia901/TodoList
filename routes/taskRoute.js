require('dotenv').config();
const TaskController = require('../controllers/TaskController');
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const taskService = require('../services/taskService');
const todoDbOptions = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TODO_DATABASE
};
// router.use((req, res, next) => {
//     if (!req.session.user) {
//         const err = new Error('Forbidden');
//         err.status = 403;
//         next(err);
//     } else {
//         next();
//     }
// });

router.get('/count', async (req, res, next) => {
    taskService.getCountTasksByCategory(req, res);
    try {
        // const connection = await mysql.createConnection(todoDbOptions);
        // const [today] = await connection.execute(
        //     `SELECT COUNT(id) as count, "오늘 할 일" as name
        //     FROM tasks
        //     WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}") AND deadline = curdate()`);
        // const [importance] = await connection.execute(
        //     `SELECT COUNT(id) as count, "중요" as name
        //     FROM tasks
        //     WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}") AND importance = TRUE`);
        // const [planned] = await connection.execute(
        //     `SELECT COUNT(id) as count, "계획된 일정" as name
        //     FROM tasks
        //     WHERE user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}") AND deadline IS NOT NULL`);
        // const [categories] = await connection.execute(
        //     `SELECT COUNT(category_id) as count, IF(CAST(tasks.category_id as CHAR)="work", "작업", hex(category_id)) AS name
        //     FROM tasks LEFT JOIN categories ON tasks.category_id = categories.id
        //     WHERE tasks.user_id = (SELECT id FROM users WHERE user_id = "${req.session.user_id}")
        //     GROUP BY name`);
        
        // let results = Array.prototype.concat(today[0], importance[0], planned[0], categories);
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});


router.get('/', async (req, res, next) => {
    try {
        const dateOptions = {
            month: 'numeric',
            day: 'numeric',
            weekday: 'long'
        };
        const today = new Intl.DateTimeFormat('ko-KR', dateOptions).format(new Date());

        res.render('tasks', {
            "pageTitle": process.env.PAGE_TITLE,
            "today": today,
            "nickname": req.session.user.nickname,
            "userimg": req.session.userimg
        });

    } catch (err) {
        next(err);
    }
});

router.get('/work', async (req, res, next) => {
    try {
        console.log(req.session);
        res.send(req.session);
    } catch (err) {
        next(err);
    }
});


router.get('/category', async (req, res, next) => {
        await TaskController.getTasksByUserAndCategory(req, res, next);
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
    // TaskController.getTaskByUserIdAndCategoryId(req, res);
});

router.get("/search/:term", async (req, res, next) => {
    TaskController.searchTasksByUserAndTerm(req, res);
});

router.post('/', async (req, res, next) => {
    try {
        TaskController.postTaskByUserAndCategory(req, res);
    } catch (err) {
        next(err);
    }
});

router.put('/update/text', async (req, res, next) => {
    try {
        TaskController.updateTaskTextByTaskId(req, res);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/delete', async (req, res, next) => {
    try {
        await TaskController.deleteTaskByTaskId(req, res);
    } catch (err) {
        next(err);
    }
});

router.put("/toggle/completed", async (req, res, next) => {
    try {
        await TaskController.toggleTaskCompleted(req, res);
    } catch (err) {
        next(err);
    }
});

router.put("/toggle/importance", async (req, res, next) => {
    try {
        await TaskController.toggleTaskImportance(req, res);
    } catch (err) {
        next(err);
    }
});

router.put("/update/deadline", async (req, res, next) => {
    try {
        await TaskController.updateTaskDeadline(req, res);
    } catch (err) {
        next(err);
    }
});



module.exports = router;