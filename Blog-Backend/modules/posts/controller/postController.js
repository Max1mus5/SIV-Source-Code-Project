const PostModel = require('../model/postModel'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 
const BlockchainService = require('../../../connection/blockchain/blockchainServices')

class PostController {
    async createPost(postData) {
        const blockchainService = new BlockchainService();

        try {
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
             const transaction = blockchainService.createTransaction(postData.autor, postData.content);

             // Minar un nuevo bloque con la transacción del post
             const newBlock = blockchainService.mineBlock(process.env.WALLET_ADDRESS);
             const blockHash = newBlock.hash; // Obtener el hash del bloque
 
             // Crear el post en la base de datos con el hash del bloque en la blockchain
             const newPost = new Posts({
                 autor_id: postData.autor,
                 date: new Date().toISOString(),
                 title: postData.title,
                 content: postData.content,
                 post_image: postData.image,
                 likes: 0,
                 comments: postData.comments || "",
                 hashBlockchain: blockHash // Guardar el hash del bloque
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
