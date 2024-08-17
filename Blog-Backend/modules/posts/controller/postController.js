const PostInstance = require('../model/postInstance'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 
const BlockchainService = require('../../../connection/blockchain/blockchainServices')

class PostController {
    async createPost(postData) {
        const blockchainService = new BlockchainService();

        try {
            //validar si es instancia de un post
            const newPostInstance = PostInstance.createPost(
                postData.autor,
                postData.title,
                postData.content,
                postData.image,
                postData.date,
                postData.hashBlockchain,
                postData.likes,
                postData.comments
            );

            if (!postData.autor || !postData.title || !postData.content || !postData.image) {
                throw new Error('Todos los campos requeridos deben estar presentes.');
            }

            if (isNaN(postData.autor)) {
                try {    
                    postData.autor = parseInt(postData.autor);
                }
                catch (error) {
                    throw new Error('El autor debe ser un número.');
                }
            }


             // Crear la transacción en la blockchain (equivale a crear el post)
            const transaction = blockchainService.createTransaction(newPostInstance.autor, newPostInstance.content);

             // Minar un nuevo bloque con la transacción del post
             const newBlock = blockchainService.mineBlock(process.env.WALLET_ADDRESS);
             newPostInstance.hashBlockchain = newBlock.hash;
             // Crear el post en la base de datos con el hash del bloque en la blockchain
             const newPost = new Posts({
                autor_id: newPostInstance.autor,
                date: newPostInstance.date,
                title: newPostInstance.title,
                content: newPostInstance.content,
                post_image: newPostInstance.image,
                likes: newPostInstance.likes,
                comments: newPostInstance.comments,
                hashBlockchain: newPostInstance.hashBlockchain
            });

            await newPost.save();

            console.log(`Nuevo post creado con ID: ${newPost.id}`); 
            return newPost; 
        } catch (error) {
            console.error(`Error al crear el post: ${error.message}`); 
            throw error; 
        }
    }
}

module.exports = PostController;
