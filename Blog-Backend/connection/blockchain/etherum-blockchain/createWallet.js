var { Web3 } = require("web3");

// Inicializa web3 sin conexión a ningún proveedor de red Ethereum
const web3 = new Web3();

// Genera un nuevo par de claves (clave privada y dirección de billetera)
const account = web3.eth.accounts.create();

// Imprime la clave privada y la dirección de la billetera
console.log(`Private Key: ${account.privateKey}`);
console.log(`Wallet Address: ${account.address}`);
