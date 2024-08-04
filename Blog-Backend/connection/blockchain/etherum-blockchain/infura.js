const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_BLOCKCHAIN_URL));
console.log('Connected to Infura blockchain', process.env.INFURA_BLOCKCHAIN_URL);

// Ejemplo de función para interactuar con la blockchain
async function someBlockchainFunction(content) {
    // Lógica para enviar el contenido a la blockchain
    const hash = await web3.utils.sha3(content);
    return hash;
}
