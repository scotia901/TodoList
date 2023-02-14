const db = require('../db');

module.exports = {

    getAllUsers: (callback) => {
        db.query('SELECT * FROM users', (err, result) => {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },

    getTaskByUserIdAndCategoryId: (userId, categoryId, callback) => {
        db.execute(`SELECT achievement, hex(tasks.id) as id, description, importance, date_format(deadline, '%Y-%m-%d') as deadline
        FROM tasks
        WHERE user_id = (SELECT id FROM users WHERE user_id = "${userId}")
        AND category_id = unhex("${decodeURI(categoryId)}")
        ORDER BY importance DESC, tasks.create_date DESC`, function (err, row, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, row);
            };
        })
    },

    getTasksByUserIdAndSearchWord: (userId, searchWord, callback) => {
        db.execute(`SELECT achievement, hex(id) as id, description, importance, date_format(deadline, '%Y-%m-%d') as deadline
        FROM tasks
        WHERE description like "%${searchWord}%"
        AND user_id = (SELECT id FROM users WHERE user_id = "${userId}")
        ORDER BY achievement ASC`, function (err, row, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, row);
            };
        })
    },

    postTaskByUserIdAndCategoryId: (taskMsg, userId, categoryId, callback) => {
        db.execute(`INSERT INTO tasks (id, description, user_id, category_id)
        SELECT (unhex(replace(uuid(),'-',''))),
        "${taskMsg}",
        (SELECT id FROM users WHERE user_id = "${userId}"),
        unhex("${categoryId}");`, function (err, row, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            };
        })
    },

    updateTaskByTaskId: (taskMsg, taskId, callback) => {
        db.query(`UPDATE tasks SET description = "${taskMsg}" WHERE id = unhex("${taskId}")`, function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result.row[0]);
            }
        });
    },

    deleteTaskByTaskId: (taskId, callback) => {
        db.query(`DELETE FROM tasks WHERE id = unhex("${taskId}")`, function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }
}