const CategoryService = require("../services/categoryService");
const TaskService = require("../services/taskService");

module.exports = {
    createCategoryByUser: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const categoryName = req.body.name;
            const cateogryData = await CategoryService.createCategoryByUser(userId, categoryName);

            res.status(200).send(cateogryData);
        } catch (error) {
            next(error);
        }
    },

    getCategoriesByUser: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const categories = await CategoryService.getCategoriesByUser(userId);

            res.status(200).send(categories);
        } catch (error) {
            next(error);
        }
    },

    updateCurrentCategoryToSession: async (req, res, next) => {
        try {
            const categoryName = req.body.categoryName == undefined ? '작업' : req.body.categoryName;
            const categoryId = req.body.categoryId == undefined ? null : req.body.categoryId;

            if (typeof categoryName === 'string' && typeof categoryId === 'number' || categoryId === null) {
                const category = await CategoryService.getCategoryById(categoryId);

                req.session.category = {
                    name: category.name,
                    id: category.id,
                    sortType: category.sortType,
                    theme: category.theme
                };
                res.status(200).send();
            } else {
                throw 'Bad Request';
            }
        } catch (error) {
            next(error);
        }
    },

    getCurrentCategoryFromSession: async (req, res, next) => {
        try {
            const categoryId = req.session.category.id;
            const categoryName = req.session.category.name;
            const userId = req.session.user.id;

            if(categoryId == undefined || categoryName == undefined) {
                const category = await CategoryService.getDefaultWorkByUserId(userId);
                
                req.session.category = {
                    id: category.id,
                    name: category.name,
                    sortType: category.sortType,
                    theme: category.theme
                }
            }

            

            res.status(200).json({
                id: req.session.category.id,
                name: req.session.category.name,
                sortType: req.session.category.sortType,
                theme: req.session.category.theme
            });
        } catch (error) {
            next(error);
        }
    },

    updateCategoryNameByUser: async (req, res, next) => {
        try {
            const categoryId = req.session.category.id;
            const categoryName = req.body.categoryName;
            const userId = req.session.user.id;

            await CategoryService.updateCategoryName(userId, categoryId, categoryName);
            req.session.category.name = categoryName;
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    },

    deleteCategoryByUser: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const categoryId = req.session.category.id;

            await TaskService.deleteTasksByCategory(userId, categoryId);
            await CategoryService.deleteCategoryByUser(userId, categoryId);
            req.session.category = '';
            req.session.save();
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    },

    updateCategoryOrderById: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const categoryId = req.session.category.id;
            const sortType = req.body.sortType;

            await CategoryService.updateCategorySortTypeId(userId, categoryId, sortType);
            req.session.category.sortType = sortType;
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    },

    updateCategoryTheme: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const categoryId = req.session.category.id;
            const theme = req.body.theme;

            await CategoryService.updateCategoryTheme(userId, categoryId, theme);
            req.session.category.theme = theme;
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}