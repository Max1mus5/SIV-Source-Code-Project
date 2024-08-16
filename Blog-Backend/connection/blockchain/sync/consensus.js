const crypto = require('crypto');

class Consensus {
    constructor(difficulty = 2) {
        this.difficulty = difficulty;
    }

    /* añadiendo consensusAlgorithm() */
    consensusAlgorithm(Node, blockchain) {
        const newChain = Node.network;
        const localChain = blockchain.chain;

        blockchain.chain = this.chooseChain(localChain, newChain);
        return blockchain.chain;
    }

    //  generar un hash a partir de los datos del bloque
    generateHash(block) {
        return crypto
            .createHash('sha256')
            .update(block.index + block.previousHash + block.timestamp + JSON.stringify(block.data) + block.nonce)
            .digest('hex');
    }

    //  realizar el trabajo de prueba
    proofOfWork(block) {
        block.nonce = 0;
        let hash = this.generateHash(block);

        while (!hash.startsWith(Array(this.difficulty + 1).join('0'))) {
            block.nonce++;
            hash = this.generateHash(block);
        }

        return hash;
    }

    //  validar el bloque
    validateBlock(block, previousBlock) {
        if (block.previousHash !== previousBlock.hash) {
            return false;
        }

        if (block.hash !== this.generateHash(block)) {
            return false;
        }

        if (!block.hash.startsWith(Array(this.difficulty + 1).join('0'))) {
            return false;
        }

        return true;
    }

    //  elegir la cadena válida
    chooseChain(localChain, newChain) {
        if (newChain.length > localChain.length && this.isChainValid(newChain)) {
            return newChain;
        } else {
            return localChain;
        }
    }

    //  validar la cadena entera
    isChainValid(chain) {
        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i];
            const previousBlock = chain[i - 1];

            if (!this.validateBlock(currentBlock, previousBlock)) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Consensus;
