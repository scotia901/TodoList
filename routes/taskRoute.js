require('dotenv').config();
const TaskController = require('../controllers/TaskController');
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const taskmanager = require('../utilities/taskUtility');
const userService = require('../services/userService');
const taskService = require('../services/taskService');
const todoDbOptions = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TODO_DATABASE
};

const DEFAULT_CATEGORY = "오늘의 할 일";
const DB_CONN_ERR_MSG = "DB CONNECTION FAILED";

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
            "username": req.session.user.nickname,
            "userimg": req.session.userimg,
            "currentPage": "작업"
        });
        // const userId = req.session.user.id;
        // taskService.getTodayToDoByUserId(userId);
        // TaskController.getTasksByUserAndCategory(req, res);
        // const connection = await mysql.createConnection(todoDbOptions);
        // const [categories] = await connection.execute(
        //     `SELECT name, hex(id) as id
        //     FROM categories 
        //     WHERE user_id = (SELECT id FROM users WHERE id = "${req.session.user.id}"
        //     ORDER BY create_date DESC)`);

        // await connection.end();
        // await manager.connectDb();
        // await manager.get();
        // await manager.toHtml();
        // await manager.disconnectDb();

        // console.log(req.session.username);
        
        // res.render('tasks', {
        //     "pageTitle": process.env.PAGE_TITLE,
        //     "today": today,
        //     "user_id": req.session.user_id,
        //     "username": req.session.username,
        //     "userimg": req.session.userimg,
        //     "categories": categories,
        //     "currentPage": manager.category,
        //     "tasks": manager.html
        // });
    } catch (err) {
        next(err);
    }
});

router.get('/work', async (req, res, next) => {
    try {
        await TaskController.getTasksByUserAndCategory(req, res);
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
    // TaskController.getTaskByUserIdAndCategoryId(req, res);
});

router.post('/category', async (req, res) => {
    console.log(req.session.user);
    TaskController.postTaskByUserAndCategory(req, res);
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
    TaskController.searchTasksByUserAndTerm(req, res);
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

router.put("/toggleCompleted", async (req, res, next) => {
    try {
        await TaskController.toggleTaskCompleted(req, res);
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

router.put("/toggleImportance", async (req, res, next) => {
    try {
        await TaskController.toggleTaskImportance(req, res);
    } catch (err) {
        next(err);
    }
});

router.put("/updateDeadline", async (req, res, next) => {
    try {
        await TaskController.updateTaskDeadline(req, res);
    } catch (err) {
        next(err);
    }
})

module.exports = router;