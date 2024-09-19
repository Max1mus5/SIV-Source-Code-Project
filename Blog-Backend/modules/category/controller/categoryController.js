const { sequelize } = require('../../../connection/db/database');
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

    async getPostsByCategory(categoryName) {
        try {
            //obtener nombre de la categoria 
            const category = await Category.findOne({ where: { name: categoryName } });
            if (!category) {
                throw new Error('Category not found');
            }
            //buscar el id de la cateogria y retornar los posts asociados
            const posts = await Post_Category.findAll({ where: { categoryId: category.id } });
            if (!posts) {
                throw new Error('No posts found');
            }
            return posts;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async createCategory(category) {
        try {
            const newCategory = await Category.create({
                name: category.name
            });
            return newCategory;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}


module.exports = CategoryController;