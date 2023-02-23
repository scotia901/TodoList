const categoryService = require("../services/categoryService");

module.exports = {
    createCategoryByUser: (req, res) => {
        const userId = req.session.user.id;
        const categoryName = req.body.name;
        categoryService.createCategoryByUser(userId, categoryName);
    },

    getCategoryByUser: (req, res) => {
        const userId = req.session.user.id;
        const categoryName = req.session.category.name;

        categoryService.getCategoryByUser(userId, categoryName);
    },

    updateCategoryByUser: (req, res) => {
        const userId = req.session.user.id;
        const categoryName = req.session.category.name;

        categoryService.updateCategoryByUser(userId, categoryName);
    },

    deleteCategoryByUser:(req, res) => {

    }
}