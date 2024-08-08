const PostModel = require('../model/postModel'); // modelo de la clase POST
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema')
const { web3 } = require('../../../connection/blockchain/etherum-blockchain/infura') // conexion a la blockchain desde infura
const { ipfsAPI_connection, uploadImageToIPFS } = require('../../../connection/blockchain/IPFS/ipfs') // conexion a IPFS para subir archivos

class PostController {
    // Create a new post
    async createPost(postData) {
        try {

            // Validación de datos
            if (!postData.autor || !postData.title || !postData.content || !postData.image) {
                throw new Error('Todos los campos requeridos deben estar presentes.');
            }

            //subir imagen a IPFS
            if (postData.image) {
                const imageHash = await uploadImageToIPFS(postData.image);
                postData.image = imageHash;
            }

            // Guardar el contenido del post en IPFS
            const ipfsConnection = ipfsAPI_connection; // Accede a la función específica
            const ipfsResult = await ipfsConnection.add(Buffer.from(postData.content));
            const ipfsHash = ipfsResult[0].hash;

            // Crear una transacción para almacenar el hash de IPFS en la blockchain
            const transaction = {
                data: web3.utils.toHex(ipfsHash)
            };

            // Enviar la transacción
            const receipt = await web3.eth.sendTransaction(transaction);

            // Crear una instancia de post con el hash de la transacción y otros datos
            const newPost = new PostModel({
                autor: postData.autor,
                date: new Date().toString(),
                title: postData.title,
                hashBlockchain: receipt.transactionHash,
                content: ipfsHash,
                image: postData.image,
                likes: 0,
                comments: postData.comments || ''
            });

            //save in the database
            const post = new Posts(newPost);
            await post.save();

            console.log(newPost);

            console.log(`Nuevo post creado con hash de IPFS: ${ipfsHash} y hash de transacción: ${receipt.transactionHash}`);

            return post;
        } catch (error) {
            throw new Error(`Error al crear el post: ${error.message}`);
        }
    }
}

module.exports = PostController;
