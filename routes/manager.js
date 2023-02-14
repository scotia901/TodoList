const mysql = require('mysql2/promise');

class TaskManager {
    constructor(options) {
        this.options = options;
        this.connection;
        this.category = "오늘 할 일";
        this.tasks = new Array();
        this.user = new String();
        this.html = new String();
        this.today = new Date().toISOString().split('T')[0];
    }

    async connectDb() {
        this.connection = await mysql.createConnection(this.options);
    }

    async handle(req, query) {
        this.user = req.session.user_id;
        await this.connectDb();
        await this.connection.execute(query);
        await this.get();
        await this.toHtml();
        await this.disconnectDb();
    }

    async search(text) {
        try {
            const connection = await mysql.createConnection(this.options);
            const query = `SELECT achievement, hex(id) as id, description, importance, date_format(deadline, '%Y-%m-%d') as deadline
                            FROM tasks
                            WHERE description like "%${text}%"
                            AND user_id = (SELECT id FROM users WHERE user_id = "${this.user}")
                            ORDER BY achievement ASC`;
            
            this.category = "검색 결과";
            [this.tasks] = await connection.execute(query);
        } catch(error) {
            console.log(error);
        }
    }

    async get() {
        try {            
            if(this.category == "중요") {
                var query = 
                `SELECT achievement, hex(tasks.id) as id, description, importance, date_format(deadline, '%Y-%m-%d') as deadline, if(cast(tasks.category_id as CHAR)="work", "작업", categories.name)
                 FROM tasks
                 LEFT JOIN categories ON tasks.category_id = categories.id
                 WHERE tasks.user_id = (SELECT id FROM users WHERE user_id = "${this.user}")
                 AND tasks.importance = true 
                 AND tasks.achievement = false
                 ORDER BY tasks.create_date DESC`;
            } else if (this.category == "오늘 할 일") {
                var query = 
                `SELECT achievement, hex(tasks.id) as id, description, date_format(deadline, '%Y-%m-%d') as deadline, if(cast(tasks.category_id as CHAR)="work", "작업", categories.name)
                 FROM tasks
                 LEFT JOIN categories ON tasks.category_id = categories.id
                 WHERE tasks.user_id = (SELECT id FROM users WHERE user_id = "${this.user}")
                 AND date(deadline) = curdate()
                 ORDER BY importance DESC, tasks.create_date DESC`;
            } else if (this.category == "계획된 일정") {
                var query = 
                `SELECT achievement, hex(tasks.id) as id, description, importance, date_format(deadline, '%Y-%m-%d') as deadline, if(cast(tasks.category_id as CHAR)="work", "작업", categories.name) as name
                 FROM tasks
                 LEFT JOIN categories ON tasks.category_id = categories.id
                 WHERE tasks.user_id = (SELECT id FROM users WHERE user_id = "${this.user}")
                 AND deadline IS NOT NULL
                 AND achievement = FALSE
                 ORDER BY deadline ASC, description ASC`;
            } else if (this.category == "작업") {
                var query = 
                `SELECT achievement, hex(tasks.id) as id, description, importance, date_format(deadline, '%Y-%m-%d') as deadline
                 FROM tasks
                 WHERE tasks.user_id = (SELECT id FROM users WHERE user_id = "${this.user}")
                 AND cast(tasks.category_id as CHAR) = "work"
                 ORDER BY importance DESC, tasks.create_date DESC`;
            } else {
                var query = 
                `SELECT achievement, hex(tasks.id) as id, description, importance, date_format(deadline, '%Y-%m-%d') as deadline
                 FROM tasks
                 WHERE user_id = (SELECT id FROM users WHERE user_id = "${this.user}")
                 AND category_id = unhex("${decodeURI(this.category)}")
                 ORDER BY importance DESC, tasks.create_date DESC`;
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
                completeTasks += await this.toTasksHtml(task, completeCount);
            } else {
                incompleteCount++
                incompleteTasks += await this.toTasksHtml(task, incompleteCount);
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

    async toTasksHtml(task, count) {
        let result = new String();
        const taskState = (task.achievement == true)? "complete" : "incomplete";
        const hasDeadline = (task.deadline)? true : false;
        const deadline = await reformatDate();
        const categoryName = task.name;
        const categoryNameHtml = `<a class=task_category_name>${categoryName}</a>`
        const deadlineHtml = `<a class=${taskState}_deadline_text>${deadline}</a>`
        const calendarIcon = `<a id=${taskState}_calendar_icon class="fa fa-calendar" aria-hidden="true"></a>`
        let html = `<li id="item_${count}" class="items">
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
                                <input type="text"
                                       id="${taskState}_deadline_${count}"
                                       name="date"
                                       class="deadline"
                                       value="${(task.deadline)? task.deadline : ""}">
                                       </input>
                                <label for="${taskState}_deadline_${count}" class="fa fa-calendar" id=deadline_btn aria-hidden="true"></label>
                                <button type="submit" 
                                        name="put_btn"
                                        onclick="editTask('${task.id}')">수정</button>
                                <button type="submit"
                                        name="delete_btn"
                                        onclick="deleteTask('${task.id}')">
                                        삭제</button>
                            </div>`

        if (this.category == "계획된 일정") {
            result = (hasDeadline) ? html + "<div class='task_info'>" + categoryNameHtml + "<a style='margin:0px 5px 0px 5px'>·</a>" + calendarIcon + deadlineHtml + "</div>" + "</div></li>" : html + categoryNameHtml + "</div></li>"
        } else {
            result = (hasDeadline) ? html + "<div class='task_info'>" + calendarIcon + deadlineHtml  + "</div>" + "</div></li>" : html + "</div></li>"
        }
        
        async function reformatDate() {
            const today = new Date();
            const tomorrow = new Date();
            const deadline  = new Date(task.deadline);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if(deadline.getFullYear() == today.getFullYear() && deadline.getMonth() == today.getMonth() && deadline.getDate() == today.getDate()) {
                return "오늘";
            } else if(deadline.getFullYear() == tomorrow.getFullYear() && deadline.getMonth() == tomorrow.getMonth() && deadline.getDate() == tomorrow.getDate()) {
                return "내일";
            } else if(deadline.getFullYear() == today.getFullYear()) {
                const options = { weekday: "short", month: "short", day: "numeric"}
                const date = deadline.toLocaleDateString(undefined, options)
                return date;
            } else {
                const options = { weekday: "short", year: "numeric", month: "short", day: "numeric"}
                const date = deadline.toLocaleDateString(undefined, options)
                return date;
            }
        }

        return result
    }
}

module.exports = TaskManager;