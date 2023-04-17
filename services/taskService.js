const { Task, Category } = require('../models/todoModel');
const { Sequelize, Op } = require('sequelize');


module.exports = {
    getTasksByUserAndCategory: async (userId, categoryId) => {
        const tasks = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance', 'createdAt'],
            raw: true,
            where : {
                UserId: userId,
                CategoryId: categoryId,
            }, include: {
                attributes: ['name'],
                model: Category
            }
        });

        return tasks;
    },

    getImportantTasks: async (userId) => {
        const tasks = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance', 'createdAt'],
            where : {
                UserId: userId,
                importance: true
            }, include: {
                model: Category,
                attributes: ['name'],
            },
            raw: true
        });
        
        return tasks;
    },

    getPlanedTasks: async (userId) => {
        try {
            const tasks = await Task.findAll({
                attributes: ['id', 'text', 'completed', 'deadline', 'importance', 'createdAt'],
                raw: true,
                where : {
                    UserId: userId,
                    deadline: { [Op.ne]: null }
                }, include: {
                    attributes: ['name'],
                    model: Category
                }
            });
            
            return tasks;
        } catch (error) {
            return error;
        }
    },

    getTodayTasks: async (userId) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
    
            const tasks = await Task.findAll({
                attributes: ['id', 'text', 'completed', 'deadline', 'importance', 'createdAt'],
                raw: true,
                where : {
                    UserId: userId,
                    deadline: today
                }, include: {
                    attributes: ['name'],
                    model: Category
                }
            });

            return tasks;
        } catch (error) {
            return error;
        }
    },

    searchTasksByUserAndTerm: async (userId, searchTerm) => {
        const tasks = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance', 'createdAt'],
            where: {
                text: {
                    [Op.like]: searchTerm
                },
                UserId: userId
            },
        });

        return tasks;
    },

    getWorkTasksByUser: async (userId) => {
        const result = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance', 'createdAt'],
            where: {
                UserId: userId
            },
        });

        if(result != null) {
            return result;
        } else {
            throw 'Not found';
        }
    },

    postTaskByUserAndCategory: async (userId, taskText, deadline, importance, categoryId) => {
        const defaultCategories = await Category.findAll({
            raw: true,
            attributes: ['id'],
            where: {
                UserId: userId
            },
            limit: 4,
            order: [
                [ 'createdAt', 'ASC' ]
            ]
        });

        if(defaultCategories[0].id <= categoryId && defaultCategories[0].id + 3 >= categoryId) {
            const task = await Task.create({
                text: taskText,
                CategoryId: defaultCategories[0].id,
                UserId: userId,
                deadline: deadline,
                importance: importance
            });

            return task;
        } else {
            const task = await Task.create({
                text: taskText,
                CategoryId: categoryId,
                UserId: userId,
                deadline: deadline,
                importance: importance
            });
            
            return task;
        }
    },

    updateTaskTextByTaskId: async (userId, taskId, taskText) => {
        const result = await Task.update({
            text: taskText
        }, {
            where: {
            id: taskId,
            UserId: userId
            }
        });

        if(result[0] == 0) throw 'Bad Request';
    },

    deleteTaskByTaskId: async (userId, taskId) => {
        const result = await Task.destroy({
            where: {
                id: taskId,
                UserId: userId
            }
        });
        
        if(result != 1) throw 'Bad request';
    },

    toggleTaskImportance: async (userId, taskId) => {
        const result = await Task.update({
            importance: Sequelize.literal('NOT importance')
        }, {
            where: {
            id: taskId,
            UserId: userId
            }
        });

        if(result != 1) throw 'Bad request';
    },

    toggleTaskCompleted: async (userId, taskId) => {
        const result = await Task.update({
            completed: Sequelize.literal('NOT completed')
        }, {
            where: {
            id: taskId,
            UserId: userId
            }
        });

        if(result[0] != 1) throw 'Bad request';
    },

    updateTaskDeadline: async (userId, taskId, deadline) => {
        const result = await Task.update({
            deadline: deadline
        }, {
            where: {
                id: taskId,
                userId: userId
            }
        });

        if(result[0] != 1) throw 'Bad request';
    },

    deleteTasksbyUser: async (userId) => {
        await Task.destroy({
            where: {
                UserId: userId
            }
        });
    },

    deleteTasksByCategory: async (userId, categoryId) => {
        await Task.destroy({ where: { UserId: userId, CategoryId: categoryId }});
    },

    countTasksByCategory: async (userId) => {
        const allTasksCountBy = await Task.findAll({
            attributes: ['deadline', 'importance', 'CategoryId'],
            where: {
                UserId: userId,
                completed: false
            }
        }).then((result) => {
            let deadlineCount = 0;
            let importanceCount = 0;
            let todayCount = 0;

            result.forEach(element => {
                const task = element.dataValues;
                if(task.importance == true) importanceCount++;
                if(task.deadline != null) {
                    const today = new Date();
                    const deadline = new Date(task.deadline);
                    
                    deadline.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    if(task.deadline) deadlineCount++;
                    if(today.getTime() == deadline.getTime()) todayCount++;
                }
            });

            return {
                today: todayCount,
                importance: importanceCount,
                planed: deadlineCount
            };
        });

        const countTasksByCategory = await Task.findAll({
            attributes: [
                'CategoryId',
                [Sequelize.fn('COUNT', Sequelize.col("CategoryId")), 'count']
            ],
            where: {
                UserId: userId,
                completed: false
            },
            raw: true,
            group: 'CategoryId',
            order: [[ Sequelize.col('CategoryId'), 'ASC' ]]
        });

        return {
            allTasksCountBy: {
                today: allTasksCountBy.today,
                importance: allTasksCountBy.importance,
                planed: allTasksCountBy.planed,
            },
            personalCategories: countTasksByCategory
        };
    },
}