const TaskService = require('../services/taskService');
module.exports = {
    getTasksByUserAndCategory: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const categoryId = req.session.category.id;
            const categoryName = req.session.category.name;
            let tasks = new Object();

            if(categoryId == null && categoryName == '중요') {
                tasks = await TaskService.getImportantTasks(userId, categoryName);
            } else if(categoryId == null && categoryName == '계획된 일정') {
                tasks = await TaskService.getPlanedTasks(userId, categoryName);
            } else if(categoryId == null && categoryName == '오늘 할 일') {
                tasks = await TaskService.getTodayTasks(userId, categoryName);
            } else {
                tasks = await TaskService.getTasksByUserAndCategory(userId, categoryId);
            }
            res.status(200).send(tasks);
        } catch (error) {
            console.error(error);
            next(error);
        }
    },

    getWorkTasksByUser: async (req, res) => {
        const userId = req.session.user.id;
        const tasks = await TaskService.getWorkTasksByUser(userId, (err) => {
            if(err) throw err;
        });
        res.status(200).json(tasks);
    },

    searchTasksByUserAndTerm: async (req, res) => {
        const userId = req.session.user.id;
        const searchTerm = '%' + req.params.term + '%';
        
        const tasks = await TaskService.searchTasksByUserAndTerm(userId, searchTerm, (err) => {
            if (err) throw err;
        });
        res.status(200).json(tasks);
    },

    postTaskByUserAndCategory: async (req, res) => {
        const userId = req.session.user.id;
        const taskText = req.body.taskText;
        const categoryId = req.session.category.id;

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
                    res.sendStatus(200);
                } else {
                    res.status(404).send('Not found task');
                }
            }
        });
    }
}