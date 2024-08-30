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
    getTransactionByHash(hash) {
        // Recorre los bloques en la blockchain para encontrar el hash
        for (let block of this.blockchain.chain) {
            if (block.data[0].hash === hash) {
                console.log( block.data[0].hash);
                return block;
            }
        }

        throw new Error(`No se encontró una transacción o bloque con el hash: ${hash}`);
    }

    updateTransaction(originalHash, autor, content) {
        try{
            let transaction= this.getTransactionByHash(originalHash);
            transaction.data[0].author=autor;
            transaction.data[0].content=content;
            transaction.timestamp = Date.now();
            
        }
        catch(error){
            throw new Error(`No se encontró una transacción con el hash: ${originalHash}`);
        }
    }




    // Reorganizar la blockchain en base a los hashes
    reorganizeBlockchain() {
        let previousBlock = null;
        for (let i = 0; i < this.blockchain.chain.length; i++) {
            const currentBlock = this.blockchain.chain[i];

            if (previousBlock) {
                // Si el hash previo del bloque actual no coincide con el hash del bloque anterior
                if (currentBlock.previousHash !== previousBlock.hash) {
                    console.error(`Inconsistencia encontrada: el bloque ${i} tiene un hash anterior incorrecto.`);
                    // Corregir la inconsistencia
                    currentBlock.previousHash = previousBlock.hash;
                    currentBlock.hash = currentBlock.calculateHash();
                    console.log(`Bloque ${i} corregido: nuevo hash es ${currentBlock.hash}`);
                }
            }

            // Continuar con el siguiente bloque
            previousBlock = currentBlock;
        }

        // Después de la reorganización, verificar si la cadena es válida
        if (this.isValidChain()) {
            console.log('La blockchain ha sido reorganizada y es válida.');
        } else {
            throw new Error('No se pudo reorganizar la blockchain correctamente.');
        }
    }

    //eliminar un bloque por su índice
    removeBlockByIndex(index) {
        if (index >= 0 && index < this.blockchain.length) {
            this.blockchain.splice(index, 1);
            return true;
        }
        return false;
    }
}

module.exports = BlockchainService;
