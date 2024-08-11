const PostModel = require('../model/postModel'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 

class PostController {
    async createPost(postData) {
        try {
            if (!postData.autor || !postData.title || !postData.content || !postData.image) {
                throw new Error('Todos los campos requeridos deben estar presentes.');
            }
            /*validar si postdata.autor es un numero */
            if (isNaN(postData.autor)) {
               try {	
                postData.autor = parseInt(postData.autor);
                }
               catch (error) {
                throw new Error('El autor debe ser un número.');
                }
            }
            const newPost = new Posts({
                autor_id: postData.autor,
                date: new Date().toISOString(), 
                title: postData.title,
                content: postData.content,
                post_image: postData.image,
                likes: 0,
                comments: postData.comments || ""
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
