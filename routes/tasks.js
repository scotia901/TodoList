class TaskManager {
    constructor(options) {
        this.dbOptions = options;
        this.category = "오늘 할 일";
        this.tasks = new Array();
        this.user = new String();
        this.html = new String();
    }

    async processToDb(query) {
        const connection = await mysql.createConnection(this.dbOptions);
        await connection.execute(query);
        await connection.end();
    }

    async searchFromDb(text) {
        const connection = await mysql.createConnection(this.dbOptions);
        const query = `SELECT achievement, hex(id) as id, description, importance
                        FROM tasks
                        WHERE description like "%${text}%"
                        AND user_id = (SELECT id FROM users WHERE username = "${this.user}")
                        ORDER BY achievement ASC`;
        
        this.category = "검색 결과";
        [this.tasks] = await connection.execute(query);
        await connection.end();
    }

    async importFromDb() {
        try {
            const connection = await mysql.createConnection(this.dbOptions);
            let query = `SELECT achievement, hex(id) as id, description, importance
                        FROM tasks WHERE user_id = (SELECT id FROM users WHERE username = "${this.user}")
                        AND category_id = (SELECT id FROM categories WHERE name = "${this.category}")
                        ORDER BY importance DESC, create_date DESC`;
            
            if(this.category == "중요") query = `SELECT achievement, hex(id) as id, description, importance
                                                FROM tasks WHERE user_id = (SELECT id FROM users WHERE username = "${this.user}")
                                                AND importance = true 
                                                AND achievement = false
                                                ORDER BY create_date DESC`;
    
            [this.tasks] = await connection.execute(query);
            await connection.end();
        } catch (error) {
            console.log(error);
        }

    }

    async convertToHtml() {
        const startTag = '<div id="tasks">';
        const incompletedUl = '<ul class="task_lists" id="incompleted_ul">';
        const completedUl = '<ul class="task_lists" id="completed_ul" style="display: block;">';
        var incompleteTasks = new String();
        var completeTasks = new String();
        var completeCount = 0;
        var incompleteCount = 0;
        
        this.html = new String();
        for await (const task of this.tasks) {
            if (task.achievement == true) {
                completeCount++
                completeTasks += this.toTasksHtml(task, completeCount);
            } else {
                incompleteCount++
                incompleteTasks += this.toTasksHtml(task, incompleteCount);
            }
        }

        const complete_title = (completeCount > 0 )?
                                `<div id="completed_title_area">
                                <a id="completed_title">완료됨 ${completeCount}</a></div>`
                                : "";

        if(this.category == "검색 결과") {
            this.html = startTag + '<ul class="task_lists">' + incompleteTasks + completeTasks + "</ul></div>" 
        } else {
            this.html = startTag + incompletedUl + incompleteTasks + "</ul>" + complete_title + completedUl + completeTasks + "</ul>" + "</div>";
        }
        return this.html;
    }

    toTasksHtml(task, count) {
        const taskState = (task.achievement == true)? "complete" : "incomplete";
        
        return `<li id="item_${count}" class="items">
                        <div id="${task.id}" class="todo_content">
                        <input  class="task_checkbox"
                                type="checkbox" 
                                name="task_checkbox"
                                id="${taskState}_checkbox_${count}"
                                onclick="${(task.achievement == true)? "incomplete" : "complete"}Task('${task.id}')"
                                value="${(task.achievement == "1"? "true": "false")}">
                        <label for="${taskState}_checkbox_${count}"></label>
                        <a class="${taskState}_text">${task.description}</a>
                    <div class="content_edit_btn">
                        <button class="importance"
                                type="checkbox"
                                id="${taskState}_importance_${count}"
                                name="importance"
                                onclick="toggleImportance('${task.id}')"
                                value="${task.importance}">
                                중요로 표시</button>
                        <label for="${taskState}_importance_${count}"></label>
                        <button type="submit" 
                                name="put_btn"
                                onclick="editTask('${task.id}')">수정</button>
                        <button type="submit"
                                name="delete_btn"
                                onclick="deleteTask('${task.id}')">
                                삭제</button>
                    </div>
                    </div>
                    </li>`
    }
}

require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const dbOptions = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_USERS_DATABASE
};
const manager = new TaskManager(dbOptions);

router.get('/', async (req, res) => {
    try {
        if (req.session.isLogined) {
            var category = decodeURI(req.cookies.category);
            if (!req.cookies.category && req.cookies.category == undefined) {
                const defaultCategory = "오늘 할 일"
                res.cookie("category", encodeURI(defaultCategory), {
                    httpOnly: false,
                    sameSite: 'lax'
                });
                category = defaultCategory;
            }
            if (!req.cookies.toogle && req.cookies.category == undefined) res.cookie("toggle", "none", {
                httpOnly: false,
                sameSite: 'lax'
            });

            const connection = await mysql.createConnection(dbOptions);
            const [categories] = await connection.execute(`SELECT name FROM categories WHERE user_id = (SELECT id FROM users WHERE username = "${req.session.username}" ORDER BY create_date DESC)`);
            const dateOptions = {
                month: 'numeric',
                day: 'numeric',
                weekday: 'long'
            };
            const today = new Intl.DateTimeFormat('ko-KR', dateOptions).format(new Date());
            console.log(req.session.userimg);
            manager.category = category;
            manager.user = req.session.username;
            await connection.end();
            await manager.importFromDb();
            await manager.convertToHtml();
            res.render('tasks', {
                "pageTitle": process.env.PAGE_TITLE,
                "today": today,
                "username": req.session.username,
                "userimg": req.session.userimg,
                "categories": categories,
                "currentPage": category,
                "tasks": manager.html
            });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        res.status(400).send();
    }
});

router.post('/category/:name', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbOptions);
        await connection.execute(`INSERT INTO categories (id, name, user_id) SELECT unhex(replace(uuid(),'-','')), "${req.params.name}", id FROM users WHERE username = "${req.session.username}"`);
        await connection.end();
        res.sendStatus(200);
    } catch (error) {
        
        res.status(400).send();
    }
});

router.delete('/category/:name', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbOptions);
        await connection.execute(`DELETE FROM tasks WHERE category_id = (SELECT id from categories WHERE name = "${req.params.name}") AND user_id = (SELECT id from users WHERE username = "${req.session.username}")`);
        await connection.execute(`DELETE FROM categories WHERE name = "${req.params.name}" AND user_id = (SELECT id FROM users WHERE username = "${req.session.username}")`);
        res.cookie("category", encodeURI("오늘 할 일"), {
            httpOnly: false,
            sameSite: 'lax'
        });
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.status(400).send();
    }
});

router.get("/search/:text", async (req, res) => {
    try {
        manager.category = "검색 결과";
        await manager.searchFromDb(req.params.text);
        await manager.convertToHtml();
        res.cookie("category", encodeURI("검색 결과"), {
            httpOnly: false,
            sameSite: 'lax'
        });
        res.status(200).send(manager.html);
    } catch (error) {
        console.log(error);
        res.status(400).send();
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
        
        await manageTasks(req, query);
        res.status(200).send(manager.html);
    } catch (error) {
        res.status(400).send();
    }
});

router.put('/edit/:id/:msg', async (req, res) => {
    try {
        const query = `UPDATE tasks SET description = "${req.params.msg}" WHERE id = unhex("${req.params.id}")`;
        await manageTasks(req, query);
        res.status(200).send(manager.html);
    } catch (error) {
        res.statusCode(400);
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const query = `DELETE FROM tasks WHERE id = unhex("${req.params.id}")`;        
        await manageTasks(req, query);
        res.status(200).send(manager.html);
    } catch (error) {
        res.status(400).send();
    }
});

router.put('/complete/:id', async (req, res) => {
    try {
        const query = `UPDATE tasks SET achievement = 1 WHERE id = unhex("${req.params.id}")`;        
        await manageTasks(req, query);
        res.status(200).send(manager.html);
    } catch (error) {
        res.status(400).send();
    }
});

router.put('/incomplete/:id', async (req, res) => {
    try {
        const query = `UPDATE tasks SET achievement = 0 WHERE id = unhex("${req.params.id}")`
        await manageTasks(req, query);
        res.status(200).send(manager.html);
    } catch (error) {
        res.status(400).send();
    }
});

router.put("/mark/:taskId", async (req, res) => {
    try {
        const query = `UPDATE tasks SET importance = NOT importance WHERE id = unhex("${req.params.taskId}") AND user_id = (SELECT id FROM users WHERE username = "${req.session.username}")`;        
        await manageTasks(req, query);
        res.status(200).send(manager.html);
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
});

async function manageTasks(req, query) {
    manager.category = req.cookies.category;
    manager.user = req.session.username;          
    await manager.processToDb(query);
    await manager.importFromDb();
    await manager.convertToHtml();
}

module.exports = router;