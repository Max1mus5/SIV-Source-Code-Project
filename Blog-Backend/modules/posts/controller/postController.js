const PostModel = require('../model/postModel'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 
const { web3 } = require('../../../connection/blockchain/etherum-blockchain/infura');

class PostController {
    async createPost(postData) {
        const web3Conection = web3; // asignar coneccion a web3 desde infura.js
        const gasPrice = await web3.eth.getGasPrice();
        console.log(`Gas Price: ${gasPrice}`);

        const account = web3Conection.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
        web3Conection.eth.accounts.wallet.add(account);
        web3Conection.eth.defaultAccount = account.address;

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

            // Hashear el contenido del post
            const contentHash = web3Conection.utils.sha3(postData.content);

            let receipt; // Cambiado a "let" para poder reasignarlo

            // Enviar hash a la blockchain
            try {
                receipt = await web3Conection.eth.sendTransaction({
                    from: process.env.WALLET_ADDRESS,
                    to: process.env.CONTRACT_ADDRESS, 
                    data: contentHash,
                    gas: 979083035, // Asegúrate de ajustar el gas según sea necesario
                });

                console.log('Transaction successful:', receipt);
            } catch (error) {
                console.error('Error sending transaction:', error);
                throw new Error('Transaction failed');
            }

            const newPost = new Posts({
                autor_id: postData.autor,
                date: new Date().toISOString(), 
                title: postData.title,
                content: postData.content,
                post_image: postData.image,
                likes: 0,
                comments: postData.comments || "",
                hashBlockchain: receipt.transactionHash
            });

            await newPost.save();

            console.log(`Nuevo post creado con ID: ${newPost._id}`); 
            return newPost; 
        } catch (error) {
            console.error(`Error al crear el post: ${error.message}`); 
            throw error; 
        }
    }
}

module.exports = PostController;
