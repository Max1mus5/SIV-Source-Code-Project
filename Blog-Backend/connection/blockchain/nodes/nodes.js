class Node {
  constructor(blockchain) {
      this.blockchain = blockchain;
      this.network = [];
  }

  addPeer(node) {
      this.network.push(node);
  }

  broadcastBlock(block) {
      this.network.forEach(peer => peer.receiveBlock(block));
  }

  receiveBlock(block) {
      // lógica para recibir y validar el bloque
  }
}

module.exports = Node;
