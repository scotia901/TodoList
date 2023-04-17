const { Category } = require('../models/todoModel');

module.exports = {
    getCategoriesByUser: async (userId) => {
        const categories = await Category.findAll({
            attributes: ['id', 'name'],
            where: {
                Userid: userId
            }
        });
        
        if(categories) {
            return categories;
        } else {
            throw new Error('Not found');
        }
    },

    getCategoryById: async (categoryId) => {
        const category = await Category.findOne({
            raw:true,
            where: {
                id: categoryId
            }
        });
        
        if(category) {
            return category;
        } else {
            throw new Error('Not found');
        }
    },

    isDefaultCategory: async (userId, categoryId) => {
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
            return true;
        } else {
            return false;
        }
    },

    createDefaultCategoriesByUser: async (userId) => {
        const categoryNameList = ['작업', '계획된 일정', '중요', '오늘 할 일'];

        for(let i = 0; i < 4; i++ ) {
            const result = await Category.create({
                name: categoryNameList[i],
                UserId: userId
            });
            if(result == 0) throw 'Not found';
        }
    },

    createCategoryByUser: async (userId, categoryName) => {
        const result = await Category.create({ name: categoryName, UserId: userId })
        if(result == 0) throw 'Not found';
        return result;
    },

    deleteCategoryByUser: async (userId, categoryId) => {
        const result = await Category.destroy({ where: { id: categoryId, UserId: userId }});
        if(result == 0) throw 'Not found';
    },

    deleteCategoriesByUser: async (userId) => {
        await Category.destroy({
            where: {
                UserId: userId
            }
        });
    },

    updateCategoryName: async (userId, categoryId, categoryName) => {
        const result = await Category.update({
            name: categoryName
        }, {
            where: {
                id: categoryId,
                UserId: userId
            }
        });

        if(result[0] == 0) throw 'Not found';
    },

    updateCategorySortTypeId: async (userId, categoryId, sortType) => {
        const result = await Category.update({
            sortType: sortType
        }, {
            where: {
                id: categoryId,
                UserId: userId,
            }
        });

        if(result[0] == 0) throw 'Not found';
    },

    getDefaultWorkByUserId: async (userId) => {
        const result = await Category.findOne({
            raw: true,
            where: {
                UserId: userId,
                name: '작업'
            },
            order: [
                [ 'createdAt', 'ASC' ]
            ]
        });

        return result;
    },

    updateCategoryTheme: async (userId, categoryId, theme) => {
        const result = await Category.update({
            theme: theme,
        }, {
            where: {
                id: categoryId,
                UserId: userId
            }
        });

        return result;
    }
}