const { User, Task, Category } = require('../models/userModel');

module.exports = {
    getCategoriesByUser: async (userId, callback) => {
        const result = await Category.findAll({
            attributes: ['id', 'name'],
            where: {
                Userid: userId
            }
        });
        
        if(result == null) {
            const err = new Error('Error creating category')
            callback(err, null);
        } else {
            callback(null, result)
        }
    },

    createCategoryByUser: async (userId, categoryName, callback) => {
        await Category.create({
            name: categoryName,
            UserId: userId
        }).then(result => {
            callback(null, result);
        }).catch(err => {
            callback(err, null);
        });
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

    deleteCategoryByUser: (userId, categoryId, callback) => {
        Category.destroy({
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

    updateCategoryName: async (userId, categoryId, categoryName, callback) => {
        await Category.update({
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