const crypto = require('crypto');

class Transaction {
    constructor(author, content, timestamp = Date.now(), type = 'post', signature = null) {
        this.author = author;        // Autor de la transacción (puede ser el autor del post, comentarista, etc.)
        this.content = content;      // Contenido de la transacción (post, comentario, etc.)
        this.timestamp = timestamp;  
        this.type = type;            // Tipo de transacción (post, comment, reaction)
        this.signature = signature;  // Firma digital del autor para autenticar la transacción
    }

    // convertir la transacción en una cadena única (hash)
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.author + this.content + this.timestamp + this.type)
            .digest('hex');
    }

    // firmar la transacción con la clave privada del autor
    signTransaction(privateKey) {
        if (!privateKey) {
            throw new Error('No se ha proporcionado una clave privada para firmar la transacción.');
        }

        const hash = this.calculateHash();
        const sign = crypto.createSign('SHA256');
        sign.update(hash).end();
        this.signature = sign.sign(privateKey, 'hex');
    }

    // verificar si la transacción es válida
    isValid(publicKey) {
        if (!this.signature) {
            console.log('Transacción sin firmar');
            return false;
        }

        const hash = this.calculateHash();
        const verify = crypto.createVerify('SHA256');
        verify.update(hash);

        return verify.verify(publicKey, this.signature, 'hex');
    }
}

module.exports = Transaction;
