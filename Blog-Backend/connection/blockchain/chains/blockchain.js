const Consensus = require('../sync/consensus');
const { Block } = require('../blocks/block');

class Blockchain {
  constructor() {
      this.chain = [this.createGenesisBlock()];
      this.difficulty = 2;  // Dificultad del mecanismo de consenso
  }

  // Crear el bloque génesis
  createGenesisBlock() {
      let date = new Date().now();
      let dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
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
}

module.exports = { Blockchain };