const Consensus = require('../sync/consensus');
const { Block } = require('../blocks/block');

class Blockchain {
  constructor() {
      this.chain = [this.createGenesisBlock()];
      this.difficulty = 2;  // Dificultad del mecanismo de consenso
      this.pendingTransactions = [];
  }

  // Crear el bloque génesis
  createGenesisBlock() {
      let date = new Date();
      let dateStr = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
      return new Block(0, dateStr, 'Genesis Block', '0');
  }

  // Obtener el último bloque de la cadena
  getLatestBlock() {
      return this.chain[this.chain.length - 1];
  }

  // Agregar un nuevo bloque a la cadena
  addBlock(newBlock) {
      newBlock.previousHash = this.getLatestBlock().hash;
      newBlock.mineBlock(this.difficulty);
      this.chain.push(newBlock);
  }

  // Validar la cadena completa utilizando el consenso
  isChainValid() {
      const consensus = new Consensus(this.difficulty);
      return consensus.isChainValid(this.chain);
  }

  // Minar las transacciones pendientes y crear un nuevo bloque

  minePendingTransactions(minerAddress) {
      const newBlock = new Block(
          this.getLatestBlock().index + 1,
          new Date().toISOString(),
          this.pendingTransactions,
          this.getLatestBlock().hash
      );
      newBlock.mineBlock(this.difficulty);
      this.chain.push(newBlock);
      this.pendingTransactions = [];
      return newBlock;
  }
}

module.exports = Blockchain;