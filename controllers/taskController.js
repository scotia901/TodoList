const TaskService = require('../services/taskService');
const CategoryService = require('../services/categoryService');
module.exports = {
    getTasksByUserAndCategory: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const categoryName = req.session.category.name;
            const categoryId = req.session.category.id;
            const isDefaultCategory = await CategoryService.isDefaultCategory(userId, categoryId);
            let tasks = new Object();

            if(isDefaultCategory) {
                switch (categoryName) {
                    case '중요':
                        tasks = await TaskService.getImportantTasks(userId, categoryName);                        
                        break;
                    case '계획된 일정':
                        tasks = await TaskService.getPlanedTasks(userId, categoryName);
                        break;
                    case '오늘 할 일':
                        tasks = await TaskService.getTodayTasks(userId, categoryName);
                        break;
                    default:
                        tasks = await TaskService.getTasksByUserAndCategory(userId, categoryId);
                        break;
                }
            } else {
                tasks = await TaskService.getTasksByUserAndCategory(userId, categoryId, categoryName);
            }

            res.status(200).send(tasks);
        } catch (error) {
            next(error);
        }
    },

    searchTasksByUserAndTerm: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const searchTerm = '%' + req.params.term + '%';
            const tasks = await TaskService.searchTasksByUserAndTerm(userId, searchTerm);

            res.status(200).json(tasks);
        } catch (error) {
            next(error);
        }

    },

    postTaskByUserAndCategory: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const taskText = req.body.taskText;
            const deadline = req.body.deadline ? req.body.deadline : null;
            const importance = req.body.importance ? req.body.importance : false;
            const categoryId = req.session.category.id;
            const postedtask = await TaskService.postTaskByUserAndCategory(userId, taskText, deadline, importance, categoryId);

            res.status(200).json(postedtask);
        } catch (error) {
            next(error);
        }

    },

    updateTaskTextByTaskId: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const taskId = req.body.taskId;
            const taskText = req.body.taskText;

            await TaskService.updateTaskTextByTaskId(userId, taskId, taskText);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    deleteTaskByTaskId: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const taskId = req.body.taskId;

            await TaskService.deleteTaskByTaskId(userId, taskId);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    toggleTaskImportance: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const taskId = req.body.taskId;

            await TaskService.toggleTaskImportance(userId, taskId);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    toggleTaskCompleted: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const taskId = req.body.taskId;

            await TaskService.toggleTaskCompleted(userId, taskId);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    updateTaskDeadline: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const taskId = req.body.taskId;
            const deadline = req.body.taskDeadline === '0000-00-00' ? null : new Date(req.body.taskDeadline);

            await TaskService.updateTaskDeadline(userId, taskId, deadline);
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    countTasksByCategory: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const countTasksData = await TaskService.countTasksByCategory(userId);

            res.status(200).json(countTasksData);
        } catch (error) {
            next(error);
        }
    },
}