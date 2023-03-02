const CategoryService = require("../services/categoryService");

module.exports = {
    createCategoryByUser: (req, res) => {
        const userId = req.session.user.id;
        const categoryName = req.body.name;
        CategoryService.createCategoryByUser(userId, categoryName, (err, result) => {
            if(err) {
                console.error(err);
                res.status(500).send('Error');
            } else if(result) {
                res.status(200).json(result);
            } else  {
                res.status(404).send('Error not found');
            }
        });
    },

    getCategoriesByUser: async (req, res) => {
        const userId = req.session.user.id;
    
        await CategoryService.getCategoriesByUser(userId, (err, result) => {
            if(err) {
                res.status(500).send('Error');
            } else if(result) {
                res.status(200).send(result);
            } else  {
                res.status(404).send('Error not found');
            }
        });
    },

    updateCurrentCategoryToSession: async (req, res) => {
        try {
            const categoryName = req.body.categoryName == 'undefined' ? '작업' : req.body.categoryName;
            const categoryId = req.body.categoryId == 'undefined' ? null : req.body.categoryId;

            req.session.category.name = categoryName;
            req.session.category.id = categoryId;
            await req.session.save();
            res.status(200).send(req.session.category);
        } catch (error) {
            console.error(error);
            res.status(500).send();
        }
    },

    getCurrentCategoryFromSession: (req, res) => {
        try {
            const categoryId = req.session.category.id;
            const categoryName = req.session.category.name;
            const currentCategory = { id: categoryId, name: categoryName };    
            res.status(200).json(currentCategory);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting current category');
        }
    },

    updateCategoryNameByUser: (req, res) => {
        try {
            const categoryId = req.session.category.id;
            const categoryName = req.body.categoryName;
            const userId = req.session.user.id;
            CategoryService.updateCategoryName(userId, categoryId, categoryName, (err, result) => {
                if(err) {
                    res.status(500).send('Error updating category name');
                } else {
                    req.session.category.name = categoryName;
                    res.sendStatus(200);
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting current category');
        }
    },

    deleteCategoryByUser:(req, res) => {
        const userId = req.session.user.id;
        const categoryId = req.session.category.id;
        CategoryService.deleteCategoryByUser(userId, categoryId, (error, result) => {
            if(error) {
                res.status(500).send('Error deleting category.');
            } else {
                // taskService.deleteTasksByCategory(userId, categoryId);
                req.session.category = '';
                req.session.save();
                res.status(200).send();
            }
        });        
    }
}