// postController.js
const PostModel = require('../model/postModel'); // modelo de la clase POST
const { web3Url } = require('../../../connection/blockchain/etherum-blockchain/infura') // conexion a la blockchain desde infura
const { ipfsAPI_connection } = require('../../../connection/blockchain/IPFS/ipfs') // conexion a IPFS para subir archivos

class PostController {
    // Create a new post
    async createPost(postData) {
        try {
            // Save the post content to IPFS
            const ipfsResult = await ipfs.add(Buffer.from(postData.content));
            const ipfsHash = ipfsResult[0].hash;

            // Create a transaction to store the IPFS hash on the blockchain
            const transaction = {
                // Define transaction parameters here, e.g., from, to, gas, etc.
                data: web3.utils.toHex(ipfsHash)
            };

            // Send the transaction
            const receipt = await web3.eth.sendTransaction(transaction);

            // Create a post instance with the transaction hash and other data
            const newPost = new PostModel({
                author: postData.author,
                date: new Date(),
                title: postData.title,
                hashBlockchain: receipt.transactionHash,
                content: ipfsHash, // Storing the IPFS hash
                image: postData.image,
                likes: 0,
                comments: []
            });

            // Save the new post instance in the database
            await newPost.save();

            return newPost;
        } catch (error) {
            throw new Error(`Error creating post: ${error.message}`);
        }
    }
}

module.exports = PostController;
