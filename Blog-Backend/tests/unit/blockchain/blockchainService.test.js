const BlockchainService = require('../../../connection/blockchain/blockchainServices');

function mineOneTx(service, author = 'user1', content = 'test content') {
    const tx = service.createTransaction(author, content);
    tx.hash = tx.calculateHash();
    const block = service.mineBlock(author);
    return { tx, block };
}

describe('BlockchainService — estado inicial', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('la cadena arranca solo con el bloque génesis (length = 1)', () => {
        expect(service.getBlockchain().chain).toHaveLength(1);
    });

    test('el bloque génesis tiene index = 0', () => {
        expect(service.getBlockchain().chain[0].index).toBe(0);
    });

    test('la cadena es válida en el estado inicial', () => {
        expect(service.isValidChain()).toBe(true);
    });

    test('blockIndexMap arranca vacío', () => {
        expect(service.blockIndexMap.size).toBe(0);
    });

    test('no hay transacciones pendientes al inicio', () => {
        expect(service.getBlockchain().pendingTransactions).toHaveLength(0);
    });
});

describe('BlockchainService — createTransaction()', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('añade exactamente 1 transacción pendiente', () => {
        service.createTransaction('user1', 'contenido');
        expect(service.getBlockchain().pendingTransactions).toHaveLength(1);
    });

    test('la transacción creada tiene el author y content correctos', () => {
        const tx = service.createTransaction('autor42', 'hola mundo');
        expect(tx.author).toBe('autor42');
        expect(tx.content).toBe('hola mundo');
    });

    test('type por defecto es "post"', () => {
        const tx = service.createTransaction('u', 'c');
        expect(tx.type).toBe('post');
    });

    test('type personalizado se preserva', () => {
        const tx = service.createTransaction('u', 'c', 'comment');
        expect(tx.type).toBe('comment');
    });

    test('múltiples llamadas acumulan transacciones pendientes', () => {
        service.createTransaction('a', 'c1');
        service.createTransaction('b', 'c2');
        service.createTransaction('c', 'c3');
        expect(service.getBlockchain().pendingTransactions).toHaveLength(3);
    });

    test('la transacción tiene un hash calculable (64 hex chars)', () => {
        const tx = service.createTransaction('abc', 'def');
        expect(tx.calculateHash()).toMatch(/^[a-f0-9]{64}$/);
    });
});

describe('BlockchainService — mineBlock()', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('la cadena crece en 1 después de minar', () => {
        service.createTransaction('u', 'c');
        service.mineBlock('miner');
        expect(service.getBlockchain().chain).toHaveLength(2);
    });

    test('las transacciones pendientes se vacían después de minar', () => {
        service.createTransaction('u', 'c');
        service.mineBlock('miner');
        expect(service.getBlockchain().pendingTransactions).toHaveLength(0);
    });

    test('el bloque retornado tiene el índice correcto (1)', () => {
        service.createTransaction('u', 'c');
        const block = service.mineBlock('miner');
        expect(block.index).toBe(1);
    });

    test('el bloque se añade al blockIndexMap por su index', () => {
        service.createTransaction('u', 'c');
        const block = service.mineBlock('miner');
        expect(service.blockIndexMap.get(block.index)).toBe(block);
    });

    test('las transacciones del bloque quedan indexadas en blockIndexMap por su hash', () => {
        const tx = service.createTransaction('u', 'c');
        tx.hash = tx.calculateHash();
        const block = service.mineBlock('miner');
        block.data.forEach(t => {
            if (t.hash) {
                expect(service.blockIndexMap.get(t.hash)).toBeDefined();
            }
        });
    });

    test('la cadena sigue siendo válida después de minar', () => {
        service.createTransaction('u', 'c');
        service.mineBlock('miner');
        expect(service.isValidChain()).toBe(true);
    });

    test('minar 3 bloques consecutivos mantiene la cadena válida', () => {
        for (let i = 0; i < 3; i++) {
            service.createTransaction(`user${i}`, `content ${i}`);
            service.mineBlock(`miner${i}`);
        }
        expect(service.getBlockchain().chain).toHaveLength(4);
        expect(service.isValidChain()).toBe(true);
    });

    test('el hash del bloque minado cumple la dificultad (empieza con "00")', () => {
        service.createTransaction('u', 'c');
        const block = service.mineBlock('miner');
        expect(block.hash.startsWith('00')).toBe(true);
    });
});

describe('BlockchainService — getTransactionByHash()', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('retorna el bloque que contiene la transacción', async () => {
        const { tx, block } = mineOneTx(service);
        const found = await service.getTransactionByHash(tx.hash);
        expect(found).toBeDefined();
        expect(found.index).toBe(block.index);
    });

    test('retorna undefined para un hash inexistente', async () => {
        const result = await service.getTransactionByHash('hash_que_no_existe');
        expect(result).toBeUndefined();
    });

    test('retorna el bloque correcto con múltiples bloques minados', async () => {
        const { tx: tx1, block: b1 } = mineOneTx(service, 'user1', 'first post');
        const { tx: tx2, block: b2 } = mineOneTx(service, 'user2', 'second post');
        const found1 = await service.getTransactionByHash(tx1.hash);
        const found2 = await service.getTransactionByHash(tx2.hash);
        expect(found1.index).toBe(b1.index);
        expect(found2.index).toBe(b2.index);
    });
});

describe('BlockchainService — updateTransaction()', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('actualiza author y content de la transacción', async () => {
        const { tx } = mineOneTx(service, 'old_author', 'old content');
        const updated = await service.updateTransaction(tx.hash, 'new_author', 'new content');
        expect(updated.author).toBe('new_author');
        expect(updated.content).toBe('new content');
    });

    test('actualiza el timestamp de la transacción', async () => {
        const { tx } = mineOneTx(service);
        const before = Date.now();
        await service.updateTransaction(tx.hash, 'a', 'b');
        const after = Date.now();
        expect(tx.timestamp).toBeGreaterThanOrEqual(before);
        expect(tx.timestamp).toBeLessThanOrEqual(after);
    });

    test('recalcula el hash del bloque después de actualizar', async () => {
        const { tx, block } = mineOneTx(service);
        const hashAntes = block.hash;
        await service.updateTransaction(tx.hash, 'nuevo_autor', 'nuevo_contenido');
        expect(block.hash).not.toBe(hashAntes);
    });

    test('lanza error si el hash de la transacción no existe', async () => {
        await expect(
            service.updateTransaction('hash_que_no_existe', 'a', 'b')
        ).rejects.toThrow();
    });
});

describe('BlockchainService — removeBlockByhash() y removeBlockByIndex()', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('removeBlockByhash reduce la cadena en 1 bloque', async () => {
        const { tx } = mineOneTx(service);
        const lenAntes = service.getBlockchain().chain.length;
        await service.removeBlockByhash(tx.hash);
        expect(service.getBlockchain().chain.length).toBe(lenAntes - 1);
    });

    test('la cadena sigue siendo válida después de removeBlockByhash', async () => {
        const { tx } = mineOneTx(service);
        await service.removeBlockByhash(tx.hash);
        expect(service.isValidChain()).toBe(true);
    });

    test('removeBlockByIndex(0) lanza: no se puede eliminar el génesis', async () => {
        await expect(service.removeBlockByIndex(0))
            .rejects.toThrow('g\u00e9nesis');
    });

    test('removeBlockByIndex con índice fuera de rango lanza error', async () => {
        await expect(service.removeBlockByIndex(999))
            .rejects.toThrow('fuera de rango');
    });

    test('removeBlockByIndex(1) elimina el primer bloque minado', async () => {
        mineOneTx(service);
        const lenAntes = service.getBlockchain().chain.length;
        await service.removeBlockByIndex(1);
        expect(service.getBlockchain().chain.length).toBe(lenAntes - 1);
    });

    test('cadena válida después de removeBlockByIndex', async () => {
        mineOneTx(service);
        await service.removeBlockByIndex(1);
        expect(service.isValidChain()).toBe(true);
    });
});

describe('BlockchainService — reindexationBlockchain()', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('los índices son consecutivos: 0, 1, 2, ... después de reindexar', () => {
        for (let i = 0; i < 3; i++) {
            service.createTransaction('u', `c${i}`);
            service.mineBlock('m');
        }
        service.reindexationBlockchain(0);
        service.getBlockchain().chain.forEach((block, idx) => {
            expect(block.index).toBe(idx);
        });
    });

    test('retorna true si reindexación es exitosa', () => {
        service.createTransaction('u', 'c');
        service.mineBlock('m');
        expect(service.reindexationBlockchain(0)).toBe(true);
    });
});

describe('BlockchainService — mountBlockchain(posts)', () => {
    test('carga posts existentes en la blockchain y retorna true', async () => {
        const freshService = new BlockchainService();
        const posts = [
            { autor_id: 1, content: 'Primer post del blog', hashBlockchain: 'hash_post_1' },
            { autor_id: 2, content: 'Segundo post del blog', hashBlockchain: 'hash_post_2' },
        ];
        const result = await freshService.mountBlockchain(posts);
        expect(result).toBe(true);
        expect(freshService.getBlockchain().chain.length).toBeGreaterThan(1);
    });

    test('la cadena es válida después de mountBlockchain', async () => {
        const freshService = new BlockchainService();
        const posts = [
            { autor_id: 1, content: 'Post A', hashBlockchain: 'h1' },
            { autor_id: 1, content: 'Post B', hashBlockchain: 'h2' },
        ];
        await freshService.mountBlockchain(posts);
        expect(freshService.isValidChain()).toBe(true);
    });

    test('blockchain vacía (sin posts) permanece válida', async () => {
        const freshService = new BlockchainService();
        const result = await freshService.mountBlockchain([]);
        expect(result).toBe(true);
        expect(freshService.isValidChain()).toBe(true);
    });
});

describe('BlockchainService — getBlockchain() y getNetworkNodes()', () => {
    let service;
    beforeEach(() => { service = new BlockchainService(); });

    test('getBlockchain() retorna el objeto blockchain con propiedad chain', () => {
        const bc = service.getBlockchain();
        expect(bc).toBeDefined();
        expect(Array.isArray(bc.chain)).toBe(true);
    });

    test('getNetworkNodes() retorna la red de nodos (array o estructura)', () => {
        const nodes = service.getNetworkNodes();
        expect(nodes).toBeDefined();
    });
});
