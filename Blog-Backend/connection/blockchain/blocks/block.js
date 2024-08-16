const crypto = require('crypto');
const Consensus = require('../sync/consensus');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = '';
        this.nonce = 0;
    }

    // calcular el hash del bloque
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce)
            .digest('hex');
    }

    // minar el bloque utilizando el mecanismo de consenso (Proof of Work)
    mineBlock(difficulty) {
        const consensus = new Consensus(difficulty);
        this.hash = consensus.proofOfWork(this);
        console.log(`Block mined: ${this.hash}`);
    }
}

module.exports = { Block };
