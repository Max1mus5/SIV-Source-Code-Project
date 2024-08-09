const PostModel = require('../model/postModel'); // modelo de la clase POST
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema')
const { web3Url } = require('../../../connection/blockchain/etherum-blockchain/infura'); // conexión a la blockchain desde Infura
const Web3 = require('web3');class PostController {
    // Crear un nuevo post
    async createPost(postData) {
        try {
            // Validación de datos
            if (!postData.autor || !postData.title || !postData.content || !postData.image) {
                throw new Error('Todos los campos requeridos deben estar presentes.');
            }

            // Crear una instancia de Web3
            const web3 = new Web3(new Web3.providers.HttpProvider(web3Url));

            // Guardar el contenido del post directamente en la base de datos (no en IPFS)
            const newPost = new PostModel({
                autor: postData.autor,
                date: new Date().toString(),
                title: postData.title,
                hashBlockchain: '', // Se actualizará después de crear la transacción en la blockchain
                content: postData.content, // Almacenando el contenido directamente en la base de datos
                image: postData.image, // URL proporcionada por el usuario
                likes: 0,
                comments: postData.comments || []
            });

            // Crear una transacción en la blockchain
            const transaction = {
                from: web3.eth.accounts[0], // Asegúrate de configurar correctamente el remitente
                data: web3.utils.toHex(newPost.content)
            };

            // Enviar la transacción y obtener el hash
            const receipt = await web3.eth.sendTransaction(transaction);
            newPost.hashBlockchain = receipt.transactionHash;

            // Guardar el nuevo post en la base de datos
            const post = new Posts(newPost);
            await post.save();

            console.log(`Nuevo post creado con hash de blockchain: ${newPost.hashBlockchain}`);

            return post;
        } catch (error) {
            throw new Error(`Error al crear el post: ${error.message}`);
        }
    }
}

module.exports = PostController;
