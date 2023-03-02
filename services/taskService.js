const { Task, Category } = require('../models/userModel');
const { Sequelize, Op } = require('sequelize');


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

    getTodayTaskByUserId: async (userId) => {
        try {
            const result = await Task.findAll({
                attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
                where: {
                    UserId: userId,
                }
            })
            return result
        } catch (error) {
            console.error(error);
        }
    },

    getTasksByUserAndCategory: async (userId, categoryId) => {
        try {
        const tasks = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
            raw: true,
            where : {
                UserId: userId,
                CategoryId: categoryId,
            }, include: {
                attributes: ['name'],
                model: Category
            }
        });
        
        return Promise.resolve(tasks);
    } catch (error) {
        return Promise.reject(error);
    }
    },

    getImportantTasks: async (userId) => {
        try {
        const tasks = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
            raw: true,
            where : {
                UserId: userId,
                importance: true
            }, include: {
                attributes: ['name'],
                model: Category
            }
        });
                    
        return Promise.resolve(tasks);
    } catch (error) {
        return Promise.reject(error);
    }
    },

    getPlanedTasks: async (userId) => {
        try {
            const tasks = await Task.findAll({
                attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
                raw: true,
                where : {
                    UserId: userId,
                    deadline: { [Op.ne]: null }
                }, include: {
                    attributes: ['name'],
                    model: Category
                }
            });
            
            return Promise.resolve(tasks);
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getTodayTasks: async (userId) => {
        try {
            const today = new Intl.DateTimeFormat('ko-KR').format(new Date());

            console.log(today);
    
            const tasks = await Task.findAll({
                attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
                raw: true,
                where : {
                    UserId: userId,
                    deadline: today
                }, include: {
                    attributes: ['name'],
                    model: Category
                }
            });

            return Promise.resolve(tasks);
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    },

    searchTasksByUserAndTerm: async (userId, searchTerm) => {
        try {
        const tasks = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
            where: {
                text: {
                    [Op.like]: searchTerm
                },
                UserId: userId
            },
        });
            return Promise.resolve(tasks);
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    },

    getWorkTasksByUser: async (userId, callback) => {
        const tasks = await Task.findAll({
            attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
            where: {
                UserId: userId
            },
        });
        
        if(tasks == null) {
            const err = new Error('Not Found Task'); 
            callback(err);
        } else {
            return Promise.resolve(tasks);
        }
    },

    postTaskByUserAndCategory: async (userId, taskText, categoryId) => {
        try {
            const task = await Task.create({
                text: taskText,
                CategoryId: categoryId,
                UserId: userId,
            });
            return Promise.resolve(task);
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    },

    updateTaskTextByTaskId: async (userId, taskId, taskText, callback) => {
        await Task.update({
            text: taskText
        }, {
            where: {
            id: taskId,
            UserId: userId
            }
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    },

    deleteTaskByTaskId: async (userId, taskId, callback) => {
        await Task.destroy({
            where: {
                id: taskId,
                UserId: userId
            }
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    },

    toggleTaskImportance: async (userId, taskId, callback) => {
        await Task.update({
            importance: Sequelize.literal('NOT importance')
        }, {
            where: {
            id: taskId,
            UserId: userId
            }
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    },

    toggleTaskCompleted: async (userId, taskId, callback) => {
        await Task.update({
            completed: Sequelize.literal('NOT completed')
        }, {
            where: {
            id: taskId,
            UserId: userId
            }
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    },

    updateTaskDeadline: async (userId, taskId, deadline, callback) => {
        await Task.update({
            deadline: deadline
        }, {
            where: {
                id: taskId,
                userId: userId
            }
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    }
}