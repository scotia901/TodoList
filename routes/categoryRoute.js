const express = require('express');
const Router = express.Router();
const CategoryController = require('../controllers/categoryController');
const ValidataionMiddleware = require('../middleware/validataionMiddleware');

Router.get('/', (req, res, next) => {
    CategoryController.getCategoriesByUser(req, res, next);
});

Router.get('/current', ValidataionMiddleware.verifyCategorySession, (req, res, next) => {
    CategoryController.getCurrentCategoryFromSession(req, res, next);
});

Router.put('/current', (req, res, next) => {
    CategoryController.updateCurrentCategoryToSession(req, res, next);
});

Router.post('/category', (req, res, next) => {
    CategoryController.createCategoryByUser(req, res, next);
});

Router.put('/category', async (req, res, next) => {
    await CategoryController.updateCategoryNameByUser(req, res, next);
});

Router.delete('/category', (req, res, next) => {
    CategoryController.deleteCategoryByUser(req, res, next);
});

Router.put('/category/sort', (req, res, next) => {
    CategoryController.updateCategoryOrderById(req, res, next);
});

Router.put('/category/theme', (req, res, next) => {
    CategoryController.updateCategoryTheme(req, res, next);
});

module.exports = Router;
