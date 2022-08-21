const mysql = require('mysql2/promise');

class TaskManager {
    constructor(options) {
        this.options = options;
        this.category = "오늘 할 일";
        this.tasks = new Array();
        this.user = new String();
        this.html = new String();
        this.connection;
    }

    async connectDb() {
        this.connection = await mysql.createConnection(this.options);
    }

    async handle(req, query) {
        this.category = req.cookies.category;
        this.user = req.session.username;
        await this.connection.execute(query);
        await this.get();
        await this.toHtml();
        this.disconnectDb();
    }

    async search(text) {
        const connection = await mysql.createConnection(this.todoDbOptions);
        const query = `SELECT achievement, hex(id) as id, description, importance
                        FROM tasks
                        WHERE description like "%${text}%"
                        AND user_id = (SELECT id FROM users WHERE username = "${this.user}")
                        ORDER BY achievement ASC`;
        
        this.category = "검색 결과";
        [this.tasks] = await connection.execute(query);
    }

    async get() {
        try {            
            if(this.category == "중요") {
                var query = 
                `SELECT achievement, hex(id) as id, description, importance
                 FROM tasks
                 WHERE user_id = (SELECT id FROM users WHERE username = "${this.user}")
                 AND importance = true 
                 AND achievement = false
                 ORDER BY create_date DESC`;
            } else {
                var query = 
                `SELECT achievement, hex(id) as id, description, importance
                 FROM tasks
                 WHERE user_id = (SELECT id FROM users WHERE username = "${this.user}")
                 AND category_id = (SELECT id FROM categories WHERE name = "${this.category}")
                 ORDER BY importance DESC, create_date DESC`;
            }
    
            [this.tasks] = await this.connection.execute(query);
        } catch (error) {
            console.log(error);
        }

    }

    async disconnectDb() {
        await this.connection.end();        
    }

    async toHtml() {
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

module.exports = TaskManager;