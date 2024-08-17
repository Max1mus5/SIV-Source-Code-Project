const {sequelize} = require('../../../connection/db/database');
const PostInstance = require('../model/postInstance'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 
const BlockchainService = require('../../../connection/blockchain/blockchainServices')

class PostController {
    async createPost(postData) {
        const blockchainService = new BlockchainService();
        const transaction = await sequelize.transaction();
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
             const transactionBlockchain = blockchainService.createTransaction(newPostInstance.autor, newPostInstance.content);

             //  nuevo bloque con la transacción del post
             const newBlock = blockchainService.mineBlock(process.env.WALLET_ADDRESS);
             newPostInstance.hashBlockchain = newBlock.hash; // Actualizar el hash de la blockchain

             // Crear el post en la base de datos con la transacción activa
            const newPost = await Posts.create({
                autor_id: newPostInstance.autor,
                date: newPostInstance.date,
                title: newPostInstance.title,
                content: newPostInstance.content,
                post_image: newPostInstance.image,
                likes: newPostInstance.likes,
                comments: newPostInstance.comments,
                hashBlockchain: newPostInstance.hashBlockchain
            }, { transaction });

            await transaction.commit();

            console.log(`Nuevo post creado con ID: ${newPost.id}`); 
            return newPost; 
        } catch (error) {
            await transaction.rollback();
            console.error(`Error al crear el post: ${error.message}`); 
            throw error; 
        }
    }
}

module.exports = PostController;
