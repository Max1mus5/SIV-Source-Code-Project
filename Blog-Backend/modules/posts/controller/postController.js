const PostModel = require('../model/postModel'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 

class PostController {
    async createPost(postData) {
        try {
            if (!postData.autor || !postData.title || !postData.content || !postData.image) {
                throw new Error('Todos los campos requeridos deben estar presentes.');
            }

            const newPost = new PostModel({
                autor: postData.autor,
                date: new Date().toISOString(), 
                title: postData.title,
                content: postData.content,
                image: postData.image,
                likes: 0,
                comments: postData.comments || []
            });

            await newPost.save();

            console.log(`Nuevo post creado con ID: ${newPost._id}`); 

            return newPost; 
        } catch (error) {
            console.error(`Error al crear el post: ${error.message}`); 
            throw error; 
        }
    }
}

module.exports = PostController;
