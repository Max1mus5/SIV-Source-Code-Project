const axios = require('axios');
const { sequelize } = require('../../../connection/db/database');
const PostInstance = require('../model/postInstance');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { validateRequiredFields, convertToInt } = require('../utils/utils');
const dotenv = require('dotenv');
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
                0
            );

            // Crear la transacción en la blockchain
            const transactionBlockchain = await axios.post(`${baseURL}:${blockchainPort}/blockchain/create-transaction`, {
                autor: newPostInstance.autor,
                content: newPostInstance.content
            });

            // Minar el bloque con la transacción del post
            const newBlock = await axios.post(`${baseURL}:${blockchainPort}/blockchain/mine-block`, {
                minerAddress: newPostInstance.autor
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

    async sharePost(postId, userId) {
        const transaction = await sequelize.transaction();
        let blockIndex;
        try {
            // Obtener el post original
            const originalPost = await Posts.findByPk(postId);
            if (!originalPost) {
                throw new Error('Post original no encontrado');
            }

            // Crear una nueva instancia del post para compartir
            const sharedPostInstance = PostInstance.createPost(
                userId,
                originalPost.title,
                originalPost.content,
                originalPost.post_image,
                new Date().toISOString(),
                null,
                0,
                0,
                originalPost.id // Referencia al post original
            );

            // Crear la transacción en la blockchain para el post compartido
            const transactionBlockchain = await axios.post(`${baseURL}:${blockchainPort}/blockchain/create-transaction`, {
                autor: sharedPostInstance.autor,
                content: sharedPostInstance.content,
                shared_from: originalPost.hashBlockchain // Referencia al hash del post original
            });

            // Minar el bloque con la transacción del post compartido
            const newBlock = await axios.post(`${baseURL}:${blockchainPort}/blockchain/mine-block`, {
                minerAddress: sharedPostInstance.autor
            });
            blockIndex = newBlock.data.index;
            sharedPostInstance.hashBlockchain = newBlock.data.block.hash;

            // Crear el post compartido en la base de datos
            const sharedPost = await Posts.create({
                autor_id: sharedPostInstance.autor,
                date: sharedPostInstance.date,
                title: sharedPostInstance.title,
                content: sharedPostInstance.content,
                post_image: sharedPostInstance.image,
                likes: sharedPostInstance.likes,
                comments: sharedPostInstance.comments,
                hashBlockchain: sharedPostInstance.hashBlockchain,
                shared_from: postId // Guardar referencia al post original
            }, { transaction });

            await transaction.commit();
            console.log(`Post compartido creado con ID: ${sharedPost.id}`);
            return sharedPost;
        } catch (error) {
            if (blockIndex !== undefined) {
                // Eliminar el bloque en caso de error
                await axios.delete(`${baseURL}:${blockchainPort}/blockchain/block/${blockIndex}`);
            }
            await transaction.rollback();
            console.error(`Error al compartir el post: ${error.message}`);
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

    async getArrayPosts(arrayPostId) {
        try {
            const posts = await Posts.findAll({ where: { id: arrayPostId } });
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

    async deletePost(postId) {
        const {Comment} = require('../../../connection/db/schemas/comments-schema/commentSchema');
        const transaction = await sequelize.transaction();
        try {
            // Eliminar los comentarios asociados al post y sus respuestas
            const fatherComments = await Comment.findAll({ where: { post_id: postId }, transaction });
            for (const comment of fatherComments) {
                await Comment.destroy({ where: { comment_id: comment.id }, transaction });
            }
            await Comment.destroy({ where: { post_id: postId }, transaction });

            // Obtener el post original y los posts compartidos
            const post = await Posts.findByPk(postId, { transaction });
            if (!post) {
                throw new Error('Post no encontrado');
            }

            // Eliminar también los posts que fueron compartidos desde este post
            await Posts.destroy({
                where: { shared_from: postId },
                transaction
            });

            // Eliminar la transacción en la blockchain
            const blockchainURL = `${baseURL}:${blockchainPort}/blockchain/block/${post.hashBlockchain}`;
            const deletedTransaction = await axios.delete(blockchainURL);

            if (deletedTransaction.status !== 200) {
                throw new Error(`Error eliminando el bloque en la blockchain: ${deletedTransaction.status}`);
            }
            
            // Eliminar el post de la base de datos
            const deletedPost = await Posts.destroy({
                where: { id: postId },
                transaction
            });

            await transaction.commit();
            console.log(`Post eliminado con ID: ${postId}`);
            return deletedPost;
        } catch (error) {
            await transaction.rollback();
            console.error(`Error al eliminar el post: ${error.message}`);
            throw error;
        }
    }
}

module.exports = PostController;