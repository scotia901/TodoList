const db = require('../db');
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
            console.log(error);
        }
    },

    getTasksByUserAndCategory: async (userId, categoryId, callback) => {
            const tasks = await Task.findAll({
                attributes: ['id', 'text', 'completed', 'deadline', 'importance'],
                raw: true,
                where : {
                    UserId: userId,
                    CategoryId: categoryId
                }, include: {
                    attributes: ['name'],
                    model: Category
                }
            });

            if(tasks == null) {
                const err = new Error('Not found tasks');
                callback(err);
            } else {
                return Promise.resolve(tasks);
            }
    },

    searchTasksByUserAndTerm: async (userId, searchTerm, callback) => {
        const tasks = await Task.findAll({
            where: {
                text: {
                    [Op.like]: searchTerm
                },
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
        console.log(userId, taskId, taskText);
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