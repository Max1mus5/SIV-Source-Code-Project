const Transaction = require('../../../connection/blockchain/transactions/transaction');

describe('Transaction — constructor', () => {
    test('asigna author, content, timestamp y type correctamente', () => {
        const tx = new Transaction('author1', 'contenido del post', 1700000000000, 'post');
        expect(tx.author).toBe('author1');
        expect(tx.content).toBe('contenido del post');
        expect(tx.timestamp).toBe(1700000000000);
        expect(tx.type).toBe('post');
        expect(tx.signature).toBeNull();
    });

    test('timestamp por defecto es cercano a Date.now()', () => {
        const before = Date.now();
        const tx = new Transaction('author', 'content');
        const after  = Date.now();
        expect(tx.timestamp).toBeGreaterThanOrEqual(before);
        expect(tx.timestamp).toBeLessThanOrEqual(after);
    });

    test('type por defecto es "post"', () => {
        const tx = new Transaction('a', 'b');
        expect(tx.type).toBe('post');
    });

    test('signature por defecto es null', () => {
        const tx = new Transaction('a', 'b', 1000, 'comment');
        expect(tx.signature).toBeNull();
    });

    test('se pueden crear tipos personalizados: comment, reaction', () => {
        const comment  = new Transaction('user', 'texto', Date.now(), 'comment');
        const reaction = new Transaction('user', '👍',    Date.now(), 'reaction');
        expect(comment.type).toBe('comment');
        expect(reaction.type).toBe('reaction');
    });
});

describe('Transaction — calculateHash()', () => {
    test('devuelve un SHA-256 hex de 64 caracteres', () => {
        const tx = new Transaction('author', 'content', 1000, 'post');
        expect(tx.calculateHash()).toMatch(/^[a-f0-9]{64}$/);
    });

    test('es determinista: mismas entradas → mismo hash', () => {
        const tx1 = new Transaction('author', 'content', 1000, 'post');
        const tx2 = new Transaction('author', 'content', 1000, 'post');
        expect(tx1.calculateHash()).toBe(tx2.calculateHash());
    });

    test('autores diferentes → hashes diferentes', () => {
        const tx1 = new Transaction('author1', 'same content', 1000, 'post');
        const tx2 = new Transaction('author2', 'same content', 1000, 'post');
        expect(tx1.calculateHash()).not.toBe(tx2.calculateHash());
    });

    test('contenidos diferentes → hashes diferentes', () => {
        const tx1 = new Transaction('same', 'content A', 1000, 'post');
        const tx2 = new Transaction('same', 'content B', 1000, 'post');
        expect(tx1.calculateHash()).not.toBe(tx2.calculateHash());
    });

    test('timestamps diferentes → hashes diferentes', () => {
        const tx1 = new Transaction('same', 'same', 1000, 'post');
        const tx2 = new Transaction('same', 'same', 9999, 'post');
        expect(tx1.calculateHash()).not.toBe(tx2.calculateHash());
    });

    test('tipos diferentes → hashes diferentes', () => {
        const tx1 = new Transaction('same', 'same', 1000, 'post');
        const tx2 = new Transaction('same', 'same', 1000, 'comment');
        expect(tx1.calculateHash()).not.toBe(tx2.calculateHash());
    });

    test('REGRESSION: la fórmula de hash usa author+content+timestamp+type en ese orden', () => {
        const crypto = require('crypto');
        const tx = new Transaction('user42', 'hello world', 1700000000000, 'post');
        const expected = crypto
            .createHash('sha256')
            .update('user42' + 'hello world' + '1700000000000' + 'post')
            .digest('hex');
        expect(tx.calculateHash()).toBe(expected);
    });
});

describe('Transaction — signTransaction()', () => {
    test('lanza error si privateKey es null', () => {
        const tx = new Transaction('author', 'content', 1000, 'post');
        expect(() => tx.signTransaction(null)).toThrow('No se ha proporcionado una clave privada');
    });

    test('lanza error si privateKey es undefined', () => {
        const tx = new Transaction('author', 'content', 1000, 'post');
        expect(() => tx.signTransaction(undefined)).toThrow();
    });
});

describe('Transaction — isValid()', () => {
    test('retorna false para transacción sin firmar', () => {
        const tx = new Transaction('author', 'content', 1000, 'post');
        expect(tx.isValid('any_public_key')).toBe(false);
    });

    test('retorna false si signature es null', () => {
        const tx = new Transaction('author', 'content', 1000, 'post');
        tx.signature = null;
        expect(tx.isValid('any_public_key')).toBe(false);
    });
});
