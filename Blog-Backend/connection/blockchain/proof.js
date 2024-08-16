const BlockchainService = require('./blockchainServices');

// Instancia del servicio de blockchain
const blockchainService = new BlockchainService();

// Crear tres transacciones (posts)
const post1 = blockchainService.createTransaction('Alice', 'Mi primer post en la blockchain.');
const post2 = blockchainService.createTransaction('Bob', 'Este es un post interesante en la blockchain.');
const post3 = blockchainService.createTransaction('Charlie', 'Compartiendo mis ideas en la blockchain.');

// Minar un nuevo bloque que contiene estas transacciones
console.log('Minando el primer bloque...');
blockchainService.mineBlock('Miner1');

console.log('Minando el segundo bloque...');
blockchainService.mineBlock('Miner2');

console.log('Minando el tercer bloque...');
blockchainService.mineBlock('Miner3');

// Mostrar la blockchain completa
console.log('Blockchain completa:');
console.log(JSON.stringify(blockchainService.getBlockchain(), null, 2));

// Validar la blockchain
console.log('¿La blockchain es válida?', blockchainService.isValidChain());

// Añadir un nuevo nodo a la red y sincronizar la blockchain
const newNode = new BlockchainService();
blockchainService.addNode(newNode);
blockchainService.synchronizeBlockchain();

console.log('Nodos en la red:');
console.log(blockchainService.getNetworkNodes());
