/* definicion de un blocque en la blockchain */
const crypto = require('crypto');
class Block{
  constructor(index, timestamp, transactions, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
  }
}

/* funciones propias del blocque */

module.exports = Block;
