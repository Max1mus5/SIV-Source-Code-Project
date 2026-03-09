
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
        this.blockIndexMap = new Map(); // Mapa para almacenar transacciones por hash
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

    // Obtener la blockchain completa
    getBlockchain() {
       // console.log(this.blockIndexMap.get(''));
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
            const block = await this.blockIndexMap.get(hash);
            return block;
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
            this.blockIndexMap.set(transaction.hash, newBlock);
        });

        return newBlock;
    }

    async updateTransaction(originalHash, autor, content) {
        try {
            let block = await this.getTransactionByHash(originalHash);
            if (!block) {
                throw new Error(`No se encontró un bloque con el hash: ${originalHash}`);
            }
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
            this.blockIndexMap.set(transaction.hash, block);

            return transaction;
        } catch (error) {
            throw new Error(`Error al actualizar la transacción: ${error.message}`);
        }
    }

    async removeBlockByIndex(index) {
        try {
            if (index < 0 || index >= this.blockchain.chain.length) {
                throw new Error(`Índice de bloque fuera de rango: ${index}`);
            }
            // No se puede eliminar el bloque génesis (index 0)
            if (index === 0) {
                throw new Error('No se puede eliminar el bloque génesis.');
            }

            const block = this.blockchain.chain[index];

            // Actualizar el previousHash del bloque siguiente, si existe
            const nextBlock = this.blockchain.chain[index + 1];
            if (nextBlock) {
                nextBlock.previousHash = block.previousHash;
            }

            // Eliminar entradas del blockIndexMap
            this.blockIndexMap.delete(block.index);
            if (Array.isArray(block.data)) {
                block.data.forEach(tx => {
                    if (tx && tx.hash) this.blockIndexMap.delete(tx.hash);
                });
            }

            // Eliminar el bloque de la cadena
            this.blockchain.chain.splice(index, 1);

            // Reindexar desde el punto de eliminación
            this.reindexationBlockchain(index);

            // Verificar validez tras eliminar
            if (!this.isValidChain()) {
                this.reorganizeBlockchain(index > 0 ? index - 1 : 0);
                if (!this.isValidChain()) {
                    throw new Error('Error: La blockchain no es válida tras reorganización.');
                }
            }

            return true;
        } catch (error) {
            throw new Error(`Error al eliminar bloque por índice: ${error.message}`);
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
                    this.blockIndexMap.set(transaction.hash, currentBlock);
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
                // El bloque génesis tiene data como string, no como array
                if (Array.isArray(block.data)) {
                    block.data.forEach(transaction => {
                        if (transaction && transaction.hash) {
                            this.blockIndexMap.set(transaction.hash, block);
                        }
                    });
                }
            }
            return true;
        } catch (error) {
            throw new Error(`Error al reindexar la blockchain: ${error.message}`);
        }
    }

    async removeBlockByhash(hash) {
        try {
            let transaction = await this.getTransactionByHash(hash);
            //console.log("en blockchain serviceessss", transaction);
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

            // Verificar si la blockchain sigue siendo válida después de eliminar
            if (this.isValidChain()) {
                console.log('Blockchain válida después de eliminar el bloque.');
            } else {
                console.log('Blockchain inválida tras eliminación. Reorganizando...');
                this.reorganizeBlockchain(index > 0 ? index - 1 : 0);
                if (!this.isValidChain()) {
                    throw new Error('Error: La blockchain no es válida tras reorganización.');
                }
            }

            return true;
        } catch (error) {
            console.error(`Error al eliminar el bloque: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BlockchainService; 

   