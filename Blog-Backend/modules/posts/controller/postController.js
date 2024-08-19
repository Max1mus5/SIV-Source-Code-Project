const {sequelize} = require('../../../connection/db/database');
const PostInstance = require('../model/postInstance'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 
const BlockchainService = require('../../../connection/blockchain/blockchainServices')
const { validateRequiredFields, convertToInt } = require('../utils/utils');

class PostController {
    async createPost(postData) {
        const blockchainService = new BlockchainService();
        const transaction = await sequelize.transaction();
        try {
            // Validar campos requeridos
            validateRequiredFields(postData, ['autor', 'title', 'content', 'image']);

            // Convertir autor a número entero si es necesario
            const autorId = convertToInt(postData.autor, 'autor');

            // Crear instancia de Post
            const newPostInstance = PostInstance.createPost(
                autorId,
                postData.title,
                postData.content,
                postData.image,
                postData.date,
                postData.hashBlockchain,
                postData.likes,
                postData.comments
            );

            // Crear la transacción en la blockchain
            const transactionBlockchain = await blockchainService.createTransaction(newPostInstance.autor, newPostInstance.content);

            // Minar el bloque con la transacción del post
            const newBlock = await blockchainService.mineBlock(process.env.WALLET_ADDRESS);
            newPostInstance.hashBlockchain = newBlock.hash;

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
            throw error; // El manejo del error se realizará en las rutas o el código que llame este método
        }
    }

    async getUniquePublication(hash, autorId) {
        const blockchainService = new BlockchainService();
        try {
            // Consultar la blockchain utilizando el hash
            const blockchainData = await blockchainService.getTransactionDataByHash(hash);
            if (!blockchainData) {
                throw new Error('El hash proporcionado no existe en la blockchain.');
            }
            // Extraer información relevante desde la blockchain
            const { autorBlockchain } = blockchainData;
            // Validar autorId si es proporcionado, o usar el autor de la blockchain
            const validAutorId = autorId ? convertToInt(autorId, 'autor') : autorBlockchain;

            const post = await Posts.findOne({
                where: {
                    hashBlockchain: hash,
                    autor_id: validAutorId
                }
            });

            if (!post) {
                throw new Error('No se encontró ninguna publicación con el hash y el autor proporcionados.');
            }
            console.log(`Publicación encontrada con ID: ${post.id}`, post, blockchainData);
            // Devolver el post y la información de la blockchain
            return {
                post,
                blockchainData
            };
        } catch (error) {
            throw error; 
        }
    }
}

module.exports = PostController;
