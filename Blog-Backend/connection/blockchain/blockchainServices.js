
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
        this.transactionMap = new Map(); // Mapa para almacenar transacciones por hash
        this.blockIndexMap = new Map(); // Mapa para almacenar bloques por índice

        // Llenar los mapas con los datos existentes al inicializar
        this.blockchain.chain.forEach(block => {
            this.blockIndexMap.set(block.index, block);
            if (block.data && Array.isArray(block.data)) {
                block.data.forEach(transaction => {
                    if (transaction.hash) {
                        this.transactionMap.set(transaction.hash, block);
                    }
                });
            }
        });
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

    async getTransactionByHash(hash) {
        try {
            const block = await this.transactionMap.get(hash);
            if (!block) {
                return new Error(`No se encontró una transacción con el hash: ${hash}`);
            }
            console.log("Bloque encontrado:", block);
            const transaction = block.data.find(tx => tx.hash === hash);
            if (!transaction) {
                throw new Error(`No se encontró una transacción con el hash: ${hash}`);
            }
            return transaction;
        } catch (error) {
            throw new Error(`Error al obtener la transacción: ${error.message}`);
        }
    }

    getBlockIndex(index) {
        const block = this.blockIndexMap.get(index);
        if (!block) {
            throw new Error(`No se encontró un bloque con el index: ${index}`);
        }
        console.log("el siguiente bloque tiene como index:", block.index);
        return block;
    }

    createTransaction(author, content, type = 'post') {
        const transaction = new Transaction(author, content, Date.now(), type);
        this.blockchain.pendingTransactions.push(transaction);
        console.log("is validate chain?", this.isValidChain());
        return transaction;
    }

    mineBlock(minerAddress) {
        const newBlock = this.blockchain.minePendingTransactions(minerAddress);
        this.node.broadcastBlock(newBlock);
        
        // Actualizar los mapas con el nuevo bloque
        this.blockIndexMap.set(newBlock.index, newBlock);
        newBlock.data.forEach(transaction => {
            this.transactionMap.set(transaction.hash, newBlock);
        });

        return newBlock;
    }

    updateTransaction(originalHash, autor, content) {
        try {
            let block = this.getTransactionByHash(originalHash);
            let transaction = block.data.find(t => t.hash === originalHash);
            if (!transaction) {
                throw new Error(`No se encontró una transacción con el hash: ${originalHash}`);
            }
            transaction.author = autor;
            transaction.content = content;
            transaction.timestamp = Date.now();
            block.timestamp = new Date().toISOString();
            block.hash = block.calculateHash(); // Recalcular el hash del bloque

            // Actualizar el mapa de transacciones
            this.transactionMap.set(transaction.hash, block);

            return transaction;
        } catch (error) {
            throw new Error(`Error al actualizar la transacción: ${error.message}`);
        }
    }

    reorganizeBlockchain(startIndex = 0) {
        let previousBlock = this.blockchain.chain[startIndex - 1] || null;
        for (let i = startIndex; i < this.blockchain.chain.length; i++) {
            const currentBlock = this.blockchain.chain[i];
            if (previousBlock && currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Inconsistencia encontrada en el bloque ${i}`);
                currentBlock.previousHash = previousBlock.hash;
                currentBlock.hash = currentBlock.calculateHash();
                
                // Actualizar los mapas
                this.blockIndexMap.set(currentBlock.index, currentBlock);
                currentBlock.data.forEach(transaction => {
                    this.transactionMap.set(transaction.hash, currentBlock);
                });
            }
            previousBlock = currentBlock;
        }

        if (this.isValidChain()) {
            console.log('Blockchain reorganizada correctamente.');
        } else {
            throw new Error('Error al reorganizar la blockchain.');
        }
    }

    reindexationBlockchain(startIndex) {
        try {
            for (let i = startIndex; i < this.blockchain.chain.length; i++) {
                const block = this.blockchain.chain[i];
                block.index = i;
                
                // Actualizar los mapas
                this.blockIndexMap.set(i, block);
                block.data.forEach(transaction => {
                    this.transactionMap.set(transaction.hash, block);
                });
            }
            return true;
        } catch (error) {
            throw new Error(`Error al reindexar la blockchain: ${error.message}`);
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

   