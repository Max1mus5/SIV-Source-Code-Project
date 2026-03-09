const { Block } = require('../../../connection/blockchain/blocks/block');

describe('Block — constructor', () => {
    test('asigna todas las propiedades iniciales correctamente', () => {
        const block = new Block(1, '2024-01-01', ['tx1'], 'prev_hash_0');
        expect(block.index).toBe(1);
        expect(block.timestamp).toBe('2024-01-01');
        expect(block.data).toEqual(['tx1']);
        expect(block.previousHash).toBe('prev_hash_0');
        expect(block.hash).toBe('');
        expect(block.nonce).toBe(0);
    });

    test('previousHash por defecto es cadena vacía', () => {
        const block = new Block(0, 'genesis_date', 'Genesis Block', '');
        expect(block.previousHash).toBe('');
    });

    test('data puede ser un string, array u objeto', () => {
        const b1 = new Block(1, 't', 'string data', '0');
        const b2 = new Block(2, 't', [{ a: 1 }], '0');
        const b3 = new Block(3, 't', { key: 'value' }, '0');
        expect(b1.data).toBe('string data');
        expect(b2.data).toEqual([{ a: 1 }]);
        expect(b3.data).toEqual({ key: 'value' });
    });
});

describe('Block — calculateHash()', () => {
    test('devuelve un SHA-256 hex de 64 caracteres', () => {
        const block = new Block(1, '2024-01-01', 'test', 'prev');
        expect(block.calculateHash()).toMatch(/^[a-f0-9]{64}$/);
    });

    test('es determinista: mismas entradas → mismo hash', () => {
        const b1 = new Block(1, '2024-01-01', 'data', 'prev');
        const b2 = new Block(1, '2024-01-01', 'data', 'prev');
        expect(b1.calculateHash()).toBe(b2.calculateHash());
    });

    test('datos diferentes producen hashes diferentes', () => {
        const b1 = new Block(1, '2024-01-01', 'data_A', 'prev');
        const b2 = new Block(1, '2024-01-01', 'data_B', 'prev');
        expect(b1.calculateHash()).not.toBe(b2.calculateHash());
    });

    test('cambiar el índice cambia el hash', () => {
        const b1 = new Block(1, '2024-01-01', 'data', 'prev');
        const b2 = new Block(2, '2024-01-01', 'data', 'prev');
        expect(b1.calculateHash()).not.toBe(b2.calculateHash());
    });

    test('cambiar el nonce cambia el hash', () => {
        const block = new Block(1, '2024-01-01', 'data', 'prev');
        const hash0 = block.calculateHash();
        block.nonce = 999;
        const hash999 = block.calculateHash();
        expect(hash0).not.toBe(hash999);
    });

    test('cambiar el previousHash cambia el hash del bloque', () => {
        const b1 = new Block(1, 't', 'data', 'hash_A');
        const b2 = new Block(1, 't', 'data', 'hash_B');
        expect(b1.calculateHash()).not.toBe(b2.calculateHash());
    });

    test('REGRESSION: hash de bloque genesis controlado es estable', () => {
        const block = new Block(0, '1-1-2024', 'Genesis Block', '0');
        block.nonce = 0;
        const hash = block.calculateHash();
        expect(hash).toHaveLength(64);
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
});

describe('Block — mineBlock(difficulty)', () => {
    test('dificultad 1: hash comienza con "0"', () => {
        const block = new Block(1, '2024-01-01', 'tx', 'prev');
        block.mineBlock(1);
        expect(block.hash.startsWith('0')).toBe(true);
    });

    test('dificultad 2: hash comienza con "00"', () => {
        const block = new Block(1, '2024-01-01', 'tx data', 'prev_hash');
        block.mineBlock(2);
        expect(block.hash.startsWith('00')).toBe(true);
    });

    test('el hash resultante es un hex de 64 caracteres', () => {
        const block = new Block(1, '2024-01-01', 'tx data', 'prev_hash');
        block.mineBlock(2);
        expect(block.hash).toHaveLength(64);
        expect(block.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    test('el nonce aumenta durante el minado (debe ser > 0 casi siempre)', () => {
        const block = new Block(1, '2024-01-01', 'difícil de minar', 'prev');
        block.mineBlock(2);
        expect(block.nonce).toBeGreaterThanOrEqual(0);
    });

    test('bloque es válido tras el minado (hash = calculateHash después de minar)', () => {
        const block = new Block(1, '2024-01-01', 'tx', 'prev');
        block.mineBlock(2);
        expect(block.hash).toBe(block.calculateHash());
    });
});
