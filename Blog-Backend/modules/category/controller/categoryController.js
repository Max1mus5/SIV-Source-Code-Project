const { sequelize } = require('../../../connection/db/database');
const { Category } = require('../../../connection/db/schemas/category-schema/categorySchema');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { Post_Category } = require('../../../connection/db/schemas/category-schema/post_categorySchema');
const dotenv = require('dotenv');
const { post } = require('../../comments/routes/commentsRouter');
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

    async addPostsToCategory(postId, categoryName) {
        try {
            const category = await Category.findOne({ where: { name: categoryName } });
            if (!category) {
                throw new Error('Category not found');
            }
            const post = await Posts.findOne({ where: { id: postId } });
            if (!post) {
                throw new Error('Post not found');
            }
            const postCategory = await Post_Category.create({
                postId: post.id,
                categoryId: category.id
            });
            return postCategory;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deletePostsFromCategory(postId, categoryId) {
        try {
           if (postId === null){
            const category = await Category.findOne({ where: { id: categoryId } });
            if (!category) {
                throw new Error('Category not found');
            }
            //eliminar todos los posts asociados a la categoria
            const postCategory = await Post_Category.destroy({ where: { categoryId: category.id } });
            return postCategory;
           }
           else{
            //eliminar asociacion especifica
            const postCategory = await Post_Category.findOne({ where: { postId: postId, categoryId: categoryId } });
            if (!postCategory) {
                throw new Error('Post or category not found');
            }
            const deletedPost = await Post_Category.destroy({ where: { postId: postId, categoryId: categoryId } });
            return deletedPost;
           }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}


module.exports = CategoryController;