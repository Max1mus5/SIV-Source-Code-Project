const { sequelize } = require('../../../connection/db/database');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { Category } = require('../../../connection/db/schemas/category-schema/categorySchema');
const { Post_Category } = require('../../../connection/db/schemas/category-schema/post_categorySchema');
const dotenv = require('dotenv');
dotenv.config();

class CategoryController {
    async getCategory() {
        try {
            // obtener todos los nombres de las categorías
            const categories = await Category.findAll();
            const categoryNames = categories.map(category => category.name);
            return categoryNames;
        } catch (error) {
            throw new Error(error.message);
            
        }
        
    }
}


module.exports = CategoryController;