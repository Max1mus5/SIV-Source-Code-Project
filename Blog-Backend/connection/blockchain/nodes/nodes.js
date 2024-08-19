const { Block } = require('../blocks/block');

class Node {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.network = [];
    }

    //  agregar un nuevo nodo (peer) a la red
    addPeer(node) {
        this.network.push(node);
        console.log(`New peer added. Total peers: ${this.network.length}`);
    }

    // difundir un bloque minado a todos los nodos de la red
    broadcastBlock(block) {
        console.log(`Broadcasting block ${block.hash} to ${this.network.length} peers...`);
        this.network.forEach(peer => peer.receiveBlock(block));
    }

    // recibir un bloque de otro nodo y agregarlo a la cadena local
    receiveBlock(block) {
        console.log(`Received block ${block.hash}`);
        const latestBlock = this.blockchain.getLatestBlock();

        // Validar el bloque recibido
        if (block.previousHash === latestBlock.hash && this.blockchain.isChainValid()) {
            console.log(`Block ${block.hash} is valid and will be added to the blockchain.`);
            this.blockchain.addBlock(block);
        } else {
            console.log(`Block ${block.hash} is invalid or the blockchain is corrupted.`);
        }
    }

    // solicitar la sincronización de la blockchain con otro nodo
    requestBlockchain(peerNode) {
        console.log(`Requesting blockchain sync from peer...`);
        const peerBlockchain = peerNode.sendBlockchain();

        if (peerBlockchain && this.isBlockchainBetter(peerBlockchain)) {
            console.log('Received a better blockchain. Updating local blockchain...');
            this.blockchain.chain = peerBlockchain.chain;
        } else {
            console.log('No better blockchain found or sync failed.');
        }
    }

    // enviar la blockchain actual a otro nodo
    sendBlockchain() {
        return this.blockchain;
    }

    // verificar si la blockchain recibida es mejor que la actual
    isBlockchainBetter(peerBlockchain) {
        if (peerBlockchain.chain.length > this.blockchain.chain.length && peerBlockchain.isChainValid()) {
            return true;
        }
        return false;
    }

    // nuevo bloque de post y añadirlo a la blockchain
    mineBlock(postData) {
        const latestBlock = this.blockchain.getLatestBlock();
        const newBlock = new Block(
            latestBlock.index + 1,
            new Date().toISOString(),
            postData,
            latestBlock.hash
        );
        
        this.blockchain.addBlock(newBlock);
        this.broadcastBlock(newBlock);
    }
}

module.exports = Node;
