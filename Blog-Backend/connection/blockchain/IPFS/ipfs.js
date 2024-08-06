const ipfsAPI = require('ipfs-api');
const ipfsAPI_connection = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });

// Ejemplo de función para subir una imagen a IPFS
async function someIPFSFunction(image) {
    const buffer = Buffer.from(image);
    const response = await ipfs.add(buffer);
    return `https://ipfs.infura.io/ipfs/${response[0].hash}`;
}

module.exports = { ipfsAPI_connection };
