const taskService = require('../services/taskService');

module.exports = {

    getTaskByUserIdAndCategoryId: (req, res) => {
        const userId = req.session.user_id;
        const categoryId = req.query.categoryId;

        taskService.getTaskByUserIdAndCategoryId(userId, categoryId, (err, tasks) => {
            if (err) {
                res.status(500).send('Error getting tasks by id and category');
            } else {
                if (tasks) {
                    res.status(200).send(tasks);
                } else {
                    res.status(404).send('Not found tasks');
                }
            }
        });
    },

    getTasksByUserIdAndSearchWord: (req, res) => {
        const userId = req.session.user_id;
        const searchWord = req.params.text;

        taskService.getTasksByUserIdAndSearchWord(userId, searchWord, (err, tasks) => {
            if (err) {
                res.status(500).send('Error searching tasks by id and search');
            } else {
                console.log(tasks);
                if (tasks) {
                    res.status(200).send(tasks);
                } else {
                    res.status(404).send('Not found tasks');
                }
            }
        });
    },

    postTaskByUserIdAndCategoryId: (req, res) => {
        const userId = req.body.userId;
        const categoryId = req.body.categoryId;

        taskService.postTaskByUserIdAndCategoryId(userId, categoryId, (err, task) => {
            if (err) {
                res.status(500).send('Error posting task by userid and categoryid');
            } else {
                if (task) {
                    console.log(task);
                    res.status(200).json(task);
                } else {
                    res.status(404).send('Not found user');
                }
            }
        });
    },

    updateTaskByTaskId: (req, res) => {
        const taskId = req.body.taskId;

        taskService.updateTaskByTaskId(taskId, (err, task) => {
            if (err) {
                res.status(500).send('Error updating task by taskid');
            } else {
                if (task) {
                    res.status(200).send(task);
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    },

    deleteTaskByTaskId: (req, res) => {
        const taskId = req.body.taskId;

        taskervice.deleteTaskByTaskId(taskId, (err, task) => {
            if (err) {
                res.status(500).send('Error deleting task by taskid');
            } else {
                if (task) {
                    res.status(200).send(task);
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    }
}