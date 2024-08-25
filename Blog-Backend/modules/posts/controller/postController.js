const axios = require('axios');
const { sequelize } = require('../../../connection/db/database');
const PostInstance = require('../model/postInstance');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { validateRequiredFields, convertToInt } = require('../utils/utils');
const dotenv = require('dotenv');
dotenv.config();


const blockchainPort = process.env.BC_PORT || 3001;
class PostController {
    async createPost(postData) {
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
            const transactionBlockchain = await axios.post(`http://localhost:${blockchainPort}/blockchain/create-transaction`, {
                author: newPostInstance.autor,
                content: newPostInstance.content
            });

            console.log(transactionBlockchain.data.transaction);

            // Minar el bloque con la transacción del post
            const newBlock = await axios.post(`http://localhost:${blockchainPort}/blockchain/mine-block`, {
                minerAddress: process.env.WALLET_ADDRESS
            });

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
            await transaction.rollback();
            console.error(`Error al crear el post: ${error.message}`);
            throw error; // El manejo del error se realizará en las rutas o el código que llame este método
        }
    }

    async getUniquePublication(hash, autorId) {
        try {
            // Obtener los datos de la blockchain basados en el hash
            const blockchainData = await axios.get(`http://localhost:${blockchainPort}/blockchain/transaction/${hash}`);

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
}

module.exports = PostController;
