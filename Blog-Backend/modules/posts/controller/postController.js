const axios = require('axios');
const { sequelize } = require('../../../connection/db/database');
const PostInstance = require('../model/postInstance');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { validateRequiredFields, convertToInt } = require('../utils/utils');
const dotenv = require('dotenv');
const { hash } = require('crypto');
dotenv.config();


const blockchainPort = process.env.BC_PORT || 3001;
const baseURL = process.env.baseURL;
class PostController {
    async createPost(postData) {
        const transaction = await sequelize.transaction();
        let blockIndex;
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
                new Date().toISOString(),
                postData.hashBlockchain,
                postData.likes,
                postData.comments
            );

            // Crear la transacción en la blockchain
            const transactionBlockchain = await axios.post(`${baseURL}:${blockchainPort}/blockchain/create-transaction`, {
                autor: newPostInstance.autor,
                content: newPostInstance.content
            });
            
            //console.log(transactionBlockchain.data.transaction);

            // Minar el bloque con la transacción del post
            const newBlock = await axios.post(`${baseURL}:${blockchainPort}/blockchain/mine-block`, {
                minerAddress:  newPostInstance.autor
            });
            blockIndex = newBlock.data.index;
            newPostInstance.hashBlockchain = newBlock.data.block.hash;

            // Crear el post en la base de datos con la transacción activa
            const newPost = await Posts.create({
                autor_id: newPostInstance.autor,
                date: newPostInstance.date,
                title: newPostInstance.title,
                content: newPostInstance.content,
                post_image: newPostInstance.image,
                likes: newPostInstance.likes,
                comments: newPostInstance.comments,
                hashBlockchain: newPostInstance.hashBlockchain,
            }, { transaction });

            await transaction.commit();
            console.log(`Nuevo post creado con ID: ${newPost.id}`);
            return newPost;
        } catch (error) {
            if (blockIndex !== undefined) {
                // Eliminar el bloque en caso de error
                await axios.delete(`${baseURL}:${blockchainPort}/blockchain/block/${blockIndex}`);
            }
            await transaction.rollback();
            console.error(`Error al crear el post: ${error.message}`);
            throw error;
        }
    }

    async getUniquePublication(hash, autorId) {
        try {
            // Obtener los datos de la blockchain basados en el hash
            const blockchainData = await axios.get(`${baseURL}:${blockchainPort}/blockchain/transaction/${hash}`);

            if (!blockchainData) {
                throw new Error('El hash proporcionado no existe en la blockchain.');
            }

            const validAutorId = autorId ? parseInt(autorId) : blockchainData.data.from;
            const post = await Posts.findOne({
                where: {
                    hashBlockchain: hash,
                    autor_id: validAutorId
                }
            });

            if (!post) {
                throw new Error('No se encontró ninguna publicación con el hash y el autor proporcionados.');
            }

            // Devuelve el post y la información de la blockchain
            return {
                post,
                blockchainData: blockchainData.data
            };
        } catch (error) {
            console.error(`Error al obtener la publicación: ${error.message}`);
            throw error;
        }
    }

    async getAllPosts() {
        try {
            const posts = await Posts.findAll();
            // Ordenar por más recientes
            posts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            return posts;
        } catch (error) {
            console.error(`Error al obtener los posts: ${error.message}`);
            throw error;
        }
    }

    async updatePost(postData) {
        const transaction = await sequelize.transaction();
        let blockIndex; 
        try {
            // Convertir autor a número entero si es necesario
            const autorId = convertToInt(postData.autor_id, 'autor');
    
            // Crear instancia de Post actualizada
            const updatedPostInstance = PostInstance.createPost(
                autorId,
                postData.title,
                postData.content,
                postData.image,
                postData.date,
                postData.hashBlockchain,
                postData.likes,
                postData.comments
            );
    
            // Obtener el post original de la base de datos para comparar
            const originalPost = await Posts.findByPk(postData.id, { transaction });
            if (!originalPost) {
                throw new Error('Post no encontrado');
            }
    
            // Verificar que el autor coincida
            if (originalPost.autor_id !== updatedPostInstance.autor) {
                throw new Error('El autor del post no coincide con el autor en la blockchain.');
            }
    
            // Actualizar la transacción en la blockchain
            const transactionBlockchain = await axios.put(`${baseURL}:${blockchainPort}/blockchain/update-transaction`, {
                originalHash: originalPost.hashBlockchain,
                autor: updatedPostInstance.autor,
                content: updatedPostInstance.content
            });
            console.log(`${baseURL}:${blockchainPort}/blockchain/update-transaction`,transactionBlockchain.status);
            
            const updatedPost = await Posts.update({
                autor_id: updatedPostInstance.autor,
                date: transactionBlockchain.data.transaction.timestamp,
                title: updatedPostInstance.title,
                content: transactionBlockchain.data.transaction.data[0].content,
                post_image: updatedPostInstance.image,
                likes: updatedPostInstance.likes,
                comments: updatedPostInstance.comments,
                hashBlockchain: updatedPostInstance.hashBlockchain
            }, {
                where: { id: postData.id },
                transaction
            });
    
            await transaction.commit();
            console.log(`Post actualizado con ID: ${postData.id}`);
            return updatedPost;
        } catch (error) {
            if (blockIndex !== undefined) {
                // Eliminar el bloque en caso de error
                await axios.delete(`${baseURL}:${blockchainPort}/blockchain/block/${blockIndex}`);
            }
            await transaction.rollback();
            console.error(`Error al actualizar el post: ${error.message}`);
            throw error;
     }
    }

    /* 
router.delete('/delete-publication/:postid', async (req, res) => {
    const postController = new PostController();
    try {
        let postId = req.params.postid;
        const deletedPost = await postController.deletePost(postId);
        res.status(200).json(deletedPost);
    } catch (error) {
        handleErrorResponse(res, error);
    }
}); 


para solicitud en blockchain://eliminar un bloque
router.delete('/blockchain/block/:index', (req, res) => {
    const { index } = req.params;
    try {
        const isDeleted = blockchainService.removeBlockByIndex(parseInt(index));
        if (isDeleted) {
            res.status(200).json({ message: 'Bloque eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Bloque no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
*/

   async deletePost(postId) {
        const transaction = await sequelize.transaction();
        let blockIndex;
        try {
            // Obtener el post original de la base de datos
            const post = await Posts.findByPk(postId, { transaction });
            if (!post) {
                throw new Error('Post no encontrado');
            }

            // Eliminar la transacción en la blockchain
            const deletedTransaction = await axios.delete(`${baseURL}:${blockchainPort}/blockchain/block/${post.hashBlockchain}`);
            console.log(`${baseURL}:${blockchainPort}/blockchain/block/${post.hashBlockchain}`,deletedTransaction.status);
            // Eliminar el post de la base de datos
            const deletedPost = await Posts.destroy({
                where: { id: postId },
                transaction
            });

            await transaction.commit();
            console.log(`Post eliminado con ID: ${postId}`);
            return deletedPost;
        } catch (error) {
            if (blockIndex !== undefined) {
                // Eliminar el bloque en caso de error
                await axios.delete(`${baseURL}:${blockchainPort}/blockchain/block/${blockIndex}`);
            }
            await transaction.rollback();
            console.error(`Error al eliminar el post: ${error.message}`);
            throw error;
        }
    }
    

}

module.exports = PostController;
