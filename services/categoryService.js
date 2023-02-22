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
    }
}