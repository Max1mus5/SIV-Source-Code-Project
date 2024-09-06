const Blockchain = require('./chains/blockchain');
const Block = require('./blocks/block');
const Node = require('./nodes/nodes');
const Transaction = require('./transactions/transaction');
const Consensus = require('./sync/consensus');


class BlockchainService {
    constructor() {
        this.blockchain = new Blockchain();
        this.node = new Node(this.blockchain);
        this.consensus = new Consensus(this.blockchain, this.node);
    }

    // Crear una nueva transacción
    createTransaction(author, content, type = 'post') {
        const transaction = new Transaction(author, content, Date.now(), type);
        this.blockchain.pendingTransactions.push(transaction);
        console.log("is validate chain?",this.isValidChain());
        return transaction;
    }

    // montar blockchain desde la base de datos
    async mountBlockchain(posts) {
        for (let post of posts) {
            const transaction = this.createTransaction(post.autor_id, post.content);
            transaction.hash = post.hashBlockchain;
            this.mineBlock(post.autor_id);
        }
        return true;
    }

    // Minar un nuevo bloque con las transacciones pendientes
    mineBlock(minerAddress) {
        const newBlock = this.blockchain.minePendingTransactions(minerAddress);
        this.node.broadcastBlock(newBlock);
        return newBlock;
    }

    // Obtener la blockchain completa
    getBlockchain() {
        return this.blockchain;
    }

    // Obtener los nodos conectados a la red
    getNetworkNodes() {
        return this.node.network;
    }

    // Añadir un nodo a la red
    addNode(node) {
        this.node.addPeer(node);
    }

    // Verificar si la blockchain es válida
    isValidChain() {
        return this.blockchain.isChainValid();
    }
    
    // Sincronizar la blockchain con la red
    synchronizeBlockchain() {
        return this.consensus.consensusAlgorithm(this.node, this.blockchain);
    }

    // Buscar una transacción por su hash
    async getTransactionByHash(hash) {
        try {
            // Recorre los bloques en la blockchain para encontrar el hash
            for (let block of this.blockchain.chain) {
                if (block.data[0].hash === hash) {
                    console.log(block.data[0].hash);
                    return block;
                }
            }
        } catch (error) {
            throw new Error(`No se encontró una transacción con el hash: ${hash}`);
        }
    }

    updateTransaction(originalHash, autor, content) {
        try{
            let transaction= this.getTransactionByHash(originalHash);
            transaction.data[0].author=autor;
            transaction.data[0].content=content;
            transaction.data[0].timestamp = Date.now();
            transaction.timestamp = new Date().toISOString();
            return transaction;
        }
        catch(error){
            throw new Error(`No se encontró una transacción con el hash: ${originalHash}`);
        }
    }




    // Reorganizar la blockchain en base a los hashes
    reorganizeBlockchain(startIndex = 0) {
        let previousBlock = this.blockchain.chain[startIndex - 1] || null;
        for (let i = startIndex; i < this.blockchain.chain.length; i++) {
            const currentBlock = this.blockchain.chain[i];
            if (previousBlock && currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Inconsistencia encontrada en el bloque ${i}`);
                currentBlock.previousHash = previousBlock.hash;
                currentBlock.hash = currentBlock.calculateHash();
            }
            previousBlock = currentBlock;
        }
    
        if (this.isValidChain()) {
            console.log('Blockchain reorganizada correctamente.');
        } else {
            throw new Error('Error al reorganizar la blockchain.');
        }
    }
    

    getBlockIndex(index){
        try{
            // Recorre los bloques en la blockchain para encontrar el index
            for (let block of this.blockchain.chain) {
                if (block.index === index) {
                    console.log("el siguiente bloque tiene como index:",block.index);
                    return block;
                }
            }
            return null;
        }
        catch(error){
            throw new Error(`No se encontró un bloque con el index: ${index}`);
        }
    }

    reindexationBlockchain(startIndex){
        try{
            for(let i = startIndex + 1; i < this.blockchain.chain.length; i++) {
                    this.blockchain.chain[i].index = i;
                }          
            return true;
        }
        catch(error){
            throw new Error(`No se encontró una transacción con el index: ${startIndex}`);
        }
    }

    async removeBlockByhash(hash) {
        try {
            let transaction = await this.getTransactionByHash(hash);
            if (!transaction) {
                console.log("no se encontro una transaccion con el hash:",hash);
                return false;
            }
            console.log("en blockchain serviceessss", transaction);
            let index = transaction.index;
            let block = transaction;

            console.log(`Bloque a eliminar encontrado en el índice: ${index}`);

            // Obtener el siguiente bloque si existe
            let nextBlock = this.blockchain.chain[index + 1];
            if (nextBlock) {
                nextBlock.previousHash = block.previousHash;  // Actualizar el previousHash del bloque siguiente
            } else {
                console.log("No hay un bloque siguiente que actualizar.");
            }

            // Eliminar el bloque en el índice especificado
            this.blockchain.chain.splice(index, 1);

            // Reindexar la blockchain
            this.reindexationBlockchain(index);

            // Verificar si la blockchain sigue siendo válida
            if (this.isValidChain()) {
                console.log("Blockchain válida después de eliminar el bloque.");
            } else {
                throw new Error("Error: La blockchain no es válida después de eliminar el bloque.");
            }

            return true;
        } catch (error) {
            console.error(`Error al eliminar el bloque: ${error.message}`);
            throw error;
        }
    }
    
}

module.exports = BlockchainService;
