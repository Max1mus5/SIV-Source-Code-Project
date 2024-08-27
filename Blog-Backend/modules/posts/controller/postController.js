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
                postData.date,
                postData.hashBlockchain,
                postData.likes,
                postData.comments
            );

            // Crear la transacción en la blockchain
            const transactionBlockchain = await axios.post(`${baseURL}:${blockchainPort}/blockchain/create-transaction`, {
                author: newPostInstance.autor,
                content: newPostInstance.content
            });
            
            console.log(transactionBlockchain.data.transaction);

            // Minar el bloque con la transacción del post
            const newBlock = await axios.post(`${baseURL}:${blockchainPort}/blockchain/mine-block`, {
                minerAddress: process.env.WALLET_ADDRESS
            });
            blockIndex = newBlock.data.index;

            // Asignar el hash del bloque minado al post
            newPostInstance.hashBlockchain = newBlock.data.hash;

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
            validateRequiredFields(postData, ['id', 'autor', 'title', 'content', 'image']);
    
            // Convertir autor a número entero si es necesario
            const autorId = convertToInt(postData.autor, 'autor');
    
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
                author: updatedPostInstance.autor,
                content: updatedPostInstance.content
            });
    
            console.log(transactionBlockchain.data.transaction);
    
            const newBlock = await axios.post(`${baseURL}:${blockchainPort}/mine-block`, {
                minerAddress: postData.minerAddress 
            });
    
            blockIndex = newBlock.data.block.index; 
    
            updatedPostInstance.hashBlockchain = newBlock.data.block.hash;
    
            const updatedPost = await Posts.update({
                autor_id: updatedPostInstance.autor,
                date: updatedPostInstance.date,
                title: updatedPostInstance.title,
                content: updatedPostInstance.content,
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

module.exports = PostController;
