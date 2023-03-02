const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');


function validateSession (req, res, next) {
    if(req.session.category && req.session.user) {
        next();
    } else {
        req.session.category = {};
        req.session.category.id = null;
        req.session.category.name = '작업';
        req.session.save();
        next();
    }
}

router.get('/', (req, res) => {
    CategoryController.getCategoriesByUser(req, res);
});

router.get('/current', validateSession, (req, res) => {
    CategoryController.getCurrentCategoryFromSession(req, res);
});

router.put('/current', (req, res) => {
    CategoryController.updateCurrentCategoryToSession(req, res);
});

router.post('/category', (req, res) => {
    CategoryController.createCategoryByUser(req, res);
});

router.put('/category', (req, res) => {
    CategoryController.updateCategoryNameByUser(req, res);
});

router.delete('/category', (req, res) => {
    CategoryController.deleteCategoryByUser(req, res);
});

module.exports = router;
