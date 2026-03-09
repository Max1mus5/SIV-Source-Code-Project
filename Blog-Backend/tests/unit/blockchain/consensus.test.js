const Consensus  = require('../../../connection/blockchain/sync/consensus');
const { Block }  = require('../../../connection/blockchain/blocks/block');

function buildMinedBlock(index, data, previousHash, difficulty = 2) {
    const block = new Block(index, new Date().toISOString(), data, previousHash);
    block.mineBlock(difficulty);
    return block;
}

describe('Consensus — constructor', () => {
    test('establece la difficulty indicada', () => {
        const c = new Consensus(3);
        expect(c.difficulty).toBe(3);
    });

    test('difficulty por defecto es 2', () => {
        const c = new Consensus();
        expect(c.difficulty).toBe(2);
    });
});

describe('Consensus — generateHash(block)', () => {
    const consensus = new Consensus(2);

    test('retorna hex de 64 caracteres', () => {
        const block = new Block(0, 'date', 'genesis', '0');
        block.nonce = 0;
        expect(consensus.generateHash(block)).toMatch(/^[a-f0-9]{64}$/);
    });

    test('coincide exactamente con block.calculateHash()', () => {
        const block = new Block(1, '2024-01-01', 'data', 'prev');
        block.nonce = 42;
        expect(consensus.generateHash(block)).toBe(block.calculateHash());
    });

    test('es sensible al nonce', () => {
        const b1 = new Block(1, 't', 'data', 'prev');
        b1.nonce = 0;
        const b2 = new Block(1, 't', 'data', 'prev');
        b2.nonce = 1;
        expect(consensus.generateHash(b1)).not.toBe(consensus.generateHash(b2));
    });
});

describe('Consensus — proofOfWork(block)', () => {
    const consensus = new Consensus(2);

    test('devuelve hash con los "00" iniciales requeridos (dificultad 2)', () => {
        const block = new Block(1, '2024-01-01', 'data', 'prev');
        const hash = consensus.proofOfWork(block);
        expect(hash.startsWith('00')).toBe(true);
    });

    test('el nonce del bloque queda ≥ 0 tras el minado', () => {
        const block = new Block(1, '2024-01-01', 'data', 'prev');
        consensus.proofOfWork(block);
        expect(block.nonce).toBeGreaterThanOrEqual(0);
    });

    test('el hash devuelto tiene 64 caracteres', () => {
        const block = new Block(1, '2024-01-01', 'data', 'prev');
        const hash = consensus.proofOfWork(block);
        expect(hash).toHaveLength(64);
    });

    test('dificultad 1: hash empieza con "0"', () => {
        const c = new Consensus(1);
        const block = new Block(1, 'date', 'data', 'prev');
        const hash = c.proofOfWork(block);
        expect(hash.startsWith('0')).toBe(true);
    });
});

describe('Consensus — validateBlock(block, previousBlock)', () => {
    const consensus = new Consensus(2);

    test('retorna true para un par de bloques minados válidos', () => {
        const genesis = buildMinedBlock(0, 'Genesis', '0');
        const block1  = buildMinedBlock(1, 'data_1', genesis.hash);
        expect(consensus.validateBlock(block1, genesis)).toBe(true);
    });

    test('retorna false si previousHash no coincide', () => {
        const genesis = buildMinedBlock(0, 'Genesis', '0');
        const block1  = buildMinedBlock(1, 'data_1', 'wrong_hash');
        expect(consensus.validateBlock(block1, genesis)).toBe(false);
    });

    test('retorna false si el hash almacenado fue manipulado', () => {
        const genesis = buildMinedBlock(0, 'Genesis', '0');
        const block1  = buildMinedBlock(1, 'data_1', genesis.hash);
        block1.hash   = 'tampered_' + '0'.repeat(56); // sigue siendo 64 chars pero inválido
        expect(consensus.validateBlock(block1, genesis)).toBe(false);
    });

    test('retorna false si los datos del bloque fueron alterados post-minado', () => {
        const genesis = buildMinedBlock(0, 'Genesis', '0');
        const block1  = buildMinedBlock(1, 'data_original', genesis.hash);
        block1.data   = 'data_alterada'; // hash ya no coincide
        expect(consensus.validateBlock(block1, genesis)).toBe(false);
    });
});

describe('Consensus — isChainValid(chain)', () => {
    const consensus = new Consensus(2);

    test('retorna true para una cadena de un solo bloque (génesis)', () => {
        const genesis = buildMinedBlock(0, 'Genesis', '0');
        expect(consensus.isChainValid([genesis])).toBe(true);
    });

    test('retorna true para una cadena válida de 3 bloques', () => {
        const b0 = buildMinedBlock(0, 'Genesis', '0');
        const b1 = buildMinedBlock(1, 'tx data', b0.hash);
        const b2 = buildMinedBlock(2, 'tx data 2', b1.hash);
        expect(consensus.isChainValid([b0, b1, b2])).toBe(true);
    });

    test('retorna false cuando se manipula un bloque intermedio', () => {
        const b0 = buildMinedBlock(0, 'Genesis', '0');
        const b1 = buildMinedBlock(1, 'legit data', b0.hash);
        const b2 = buildMinedBlock(2, 'legit data 2', b1.hash);
        b1.data = 'tampered';  // b1.hash ya no es válido
        expect(consensus.isChainValid([b0, b1, b2])).toBe(false);
    });

    test('retorna false cuando se rompe el enlace previousHash', () => {
        const b0 = buildMinedBlock(0, 'Genesis', '0');
        const b1 = buildMinedBlock(1, 'tx', b0.hash);
        b1.previousHash = 'broken_link';
        expect(consensus.isChainValid([b0, b1])).toBe(false);
    });

    test('retorna false cuando se inyecta un bloque inválido en la cadena', () => {
        const b0 = buildMinedBlock(0, 'Genesis', '0');
        const b1 = buildMinedBlock(1, 'legit', b0.hash);
        // Bloque falso con hash que empieza con "00" pero el previousHash está mal
        const fake = new Block(1, 'date', 'malicious', b0.hash);
        fake.hash = '00' + 'f'.repeat(62); // apariencia válida, pero no es legítimo
        expect(consensus.isChainValid([b0, fake, b1])).toBe(false);
    });
});

describe('Consensus — chooseChain(localChain, newChain)', () => {
    const consensus = new Consensus(2);

    test('adopta la nueva cadena si es más larga y válida', () => {
        const b0 = buildMinedBlock(0, 'Genesis', '0');
        const b1 = buildMinedBlock(1, 'tx1', b0.hash);
        const b2 = buildMinedBlock(2, 'tx2', b1.hash);

        const local     = [b0, b1];
        const newChain  = [b0, b1, b2];
        expect(consensus.chooseChain(local, newChain)).toBe(newChain);
    });

    test('mantiene la cadena local si la nueva es más corta', () => {
        const b0 = buildMinedBlock(0, 'Genesis', '0');
        const b1 = buildMinedBlock(1, 'tx1', b0.hash);
        const local    = [b0, b1];
        const shorter  = [b0];
        expect(consensus.chooseChain(local, shorter)).toBe(local);
    });

    test('mantiene la cadena local si las cadenas tienen el mismo tamaño', () => {
        const b0 = buildMinedBlock(0, 'Genesis', '0');
        const b1 = buildMinedBlock(1, 'tx1', b0.hash);
        const chain1 = [b0, b1];
        const chain2 = [b0, b1];
        expect(consensus.chooseChain(chain1, chain2)).toBe(chain1);
    });
});
