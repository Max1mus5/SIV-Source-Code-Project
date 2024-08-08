const ipfsAPI = require('ipfs-api');
const ipfsAPI_connection = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });

// Ejemplo de función para subir una imagen a IPFS
async function uploadImageToIPFS(imageURL) {
    try {
        // Subir la imagen a IPFS
        const ipfsConnection = ipfsAPI_connection;
        const ipfsResult = await ipfsConnection.add(imageURL);
        const ipfsHash = ipfsResult[0].hash;

        console.log(`Imagen subida a IPFS con hash: ${ipfsHash}`);
        return ipfsHash;
    } catch (error) {
        throw new Error(`Error al subir la imagen a IPFS: ${error.message}`);
    }
}
module.exports = { ipfsAPI_connection, uploadImageToIPFS };
