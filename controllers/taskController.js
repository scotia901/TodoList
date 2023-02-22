const TaskService = require('../services/taskService');
const categoryService = require('../services/categoryService');
const TaskUtility = require('../utilities/taskUtility');

module.exports = {

    getTasksByUserAndCategory: async (req, res) => {
        const userId = req.session.user.id;
        const categoryId = req.query.categoryId ? req.query.categoryId : null;
        const categoryName = req.query.categoryName ? req.query.categoryName : null;
        
        const tasks = await TaskService.getTasksByUserAndCategory(userId, categoryId, (err) => {
            if(err) throw err;
        });

        res.status(200).json(tasks);
    },

    searchTasksByUserAndTerm: async (req, res) => {
        const userId = req.session.user.id;
        const searchTerm = '%' + req.params.text + '%'
        
        const tasks = await TaskService.searchTasksByUserAndTerm(userId, searchTerm, (err) => {
            if (err) throw err;
        });
        res.status(200).json(tasks);
    },

    postTaskByUserAndCategory: async (req, res) => {
        const userId = req.session.user.id;
        const taskText = req.body.taskText;
        const categoryId = req.body.categoryId ? req.body.categoryId : null;

        const task = await TaskService.postTaskByUserAndCategory(userId, taskText, categoryId);
        res.status(200).json(task);
    },

    updateTaskTextByTaskId: (req, res) => {
        const userId = req.session.user.id;
        const taskId = req.body.taskId;
        const taskText = req.body.taskText;

        TaskService.updateTaskTextByTaskId(userId, taskId, taskText, (err, task) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error updating task by taskid');
            } else {
                if (task) {
                    res.status(200).send();
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    },

    deleteTaskByTaskId: async (req, res) => {
        const userId = req.session.user.id;
        const taskId = req.body.taskId;

        await TaskService.deleteTaskByTaskId(userId, taskId, (err, task) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error deleting task by taskid');
            } else {
                if (task) {
                    console.log(task);
                    res.sendStatus(200);
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    },

    toggleTaskImportance: async (req, res) => {
        const userId = req.session.user.id;
        const taskId = req.body.taskId;
        await TaskService.toggleTaskImportance(userId, taskId, (err, task) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error deleting task by taskid');
            } else {
                if (task) {
                    res.sendStatus(200);
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    },

    toggleTaskCompleted: async (req, res) => {
        const userId = req.session.user.id;
        const taskId = req.body.taskId;

        await TaskService.toggleTaskCompleted(userId, taskId, (err, task) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error deleting task by taskid');
            } else {
                if (task) {
                    res.sendStatus(200);
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    },

    updateTaskDeadline: async (req, res) => {
        const userId = req.session.user.id;
        const taskId = req.body.taskId;
        const deadline = req.body.taskDeadline === '0000-00-00' ? null : new Date(req.body.taskDeadline);

        await TaskService.updateTaskDeadline(userId, taskId, deadline, async (err, task) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error deleting task by taskid');
            } else {
                if (task) {
                    const updatedTaskDeadline = await TaskUtility.reformatDate(deadline)
                    res.status(200).send(updatedTaskDeadline);
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    }
}