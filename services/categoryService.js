const { callbackPromise } = require('nodemailer/lib/shared');
const { User, Task, Category } = require('../models/userModel');

module.exports = {
    getCategoriesByUserId: async (userId) => {
    const cateogrylist = await Category.findAll({
            attributes: ['name'],
            include: {
                model: User,
                where: {
                    id: userId
                }
            }
        });
    return cateogrylist
    },

    countTasksByCategories: (userId) => {
        const count = Category.findAndCountAll({
            attributes: ['name'],
            include: {
                model: Task,
                where: {
                    id: userId
                }
            }
        })
    },

    deleteCategoryById: (userId, categoryId, callback) => {
        const result = Category.destroy({
            where: {
                id: categoryId,
                UserId: userId
            }
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    },

    createCategoryByUser: (userId, categoryName) => {
        const result = Category.create({
            name: categoryName,
            UserId: userId
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    },

    getCategoryByUser: (userId, categoryId) => {
        const category = Category.create({
            name: categoryId,
            UserId: userId
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    },

    updateCategoryById: (userId, categoryId, categoryName) => {
        const category = Category.update({
            name: categoryName
        }, {
            where: {
                id: categoryId,
                UserId: userId
            }
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
    }
}