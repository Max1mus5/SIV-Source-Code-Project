const PostModel = require('../model/postModel'); 
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema'); 
const { web3 } = require('../../../connection/blockchain/etherum-blockchain/infura');

class PostController {
    async createPost(postData) {
        try {
            if (!postData.autor || !postData.title || !postData.content || !postData.image) {
                throw new Error('Todos los campos requeridos deben estar presentes.');
            }
            /*validar si postdata.autor es un numero */
            if (isNaN(postData.autor)) {
               try {	
                postData.autor = parseInt(postData.autor);
                }
               catch (error) {
                throw new Error('El autor debe ser un número.');
                }
            }

            try{
                //hashear el contenido del post
                const contentHash = web3.utils.sha3(postData.content);

                //enviar hash a BC
                const receipt = await web3.eth.sendTransaction({
                    from: process.env.WALLET_ADDRESS,
                    to: process.env.CONTRACT_ADDRESS,
                    data: contentHash
                });

                const blockchainResponse = {"transactionHash": receipt.transactionHash, "contentHash": contentHash};
                print(blockchainResponse);
            }catch(error){
                console.error(`Error al enviar el hash a la blockchain: ${error.message}`); 
                throw error;
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
