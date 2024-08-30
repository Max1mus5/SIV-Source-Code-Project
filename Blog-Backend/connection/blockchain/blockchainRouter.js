const express = require('express');
const router = express.Router();
const blockchainService = require('./blockchainInstance');
const dotenv = require('dotenv');
dotenv.config();

//ruta de docs
router.get('/docs', (req, res) => {
    res.json({

        "/create-transaction": {
            description: 'Create a new transaction',
            method: 'POST',
            params: {
                from: 'String',
                content: 'String'
            },
            returns: 'The newly created transaction'
        },
        "/mine-block": {
            description: 'Mine a new block',
            method: 'POST',
            params: {
                minerAddress: 'String'
            },
            returns: 'The newly mined block'
        },
        "/blockchain": {
            description: 'Get the entire blockchain',
            method: 'GET',
            params: {},
            returns: 'The entire blockchain'
        },
        "/validate-blockchain": {
            description: 'Validate the blockchain',
            method: 'GET',
            params: {},
            returns: 'The validation result'
        },
        "/blockchain/transaction/:hash": {
            description: 'Get a transaction by its hash',
            method: 'GET',
            params: {
                hash: 'String'
            },
            returns: 'The transaction'
        },
        "/add-node": {
            description: 'Add a new node to the network',
            method: 'POST',
            params: {},
            returns: 'The updated list of nodes'
        },
        "/blockchain/block/:index": {
            description: 'Delete a block by its index',
            method: 'DELETE',
            params: {
                index: 'Number'
            },
            returns: 'Success message'
        },
        "/update-transaction": {
            description: 'Update a transaction',
            method: 'PUT',
            params: {
                originalHash: 'post to update',
            },
            returns: 'The updated transaction'
        }
    });
});



// Crear una nueva transacción
router.post('/create-transaction', (req, res) => {
    const { from, content } = req.body;
    try {
        const transaction = blockchainService.createTransaction(from, content);
        res.status(201).json({
            message: 'Transacción creada exitosamente',
            transaction
        });
        return transaction;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Minar un nuevo bloque
router.post('/mine-block', (req, res) => {
    const { minerAddress } = req.body;
    try {
        const newBlock = blockchainService.mineBlock(minerAddress);
        res.status(201).json({
            message: 'Bloque minado exitosamente',
            block: newBlock
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener la blockchain completa
router.get('/blockchain', (req, res) => {
    try {
        const blockchain = blockchainService.getBlockchain();
        res.status(200).json(blockchain);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Validar la blockchain
router.get('/validate-blockchain', (req, res) => {
    try {
        const isValid = blockchainService.isValidChain();
        res.status(200).json({
            message: isValid ? 'La blockchain es válida' : 'La blockchain no es válida',
            isValid
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/blockchain/transaction/:hash', (req, res) => {
    const { hash } = req.params;
    try {
        const transaction = blockchainService.getTransactionByHash(hash);
        if (transaction) {
            res.status(200).json(transaction);
        } else {
            res.status(404).json({ message: 'Transacción no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sincronizar la blockchain con un nuevo nodo
router.post('/add-node', (req, res) => {
    try {
        const newNode = new BlockchainService();
        blockchainService.addNode(newNode);
        blockchainService.synchronizeBlockchain();
        res.status(201).json({
            message: 'Nuevo nodo añadido y blockchain sincronizada',
            nodes: blockchainService.getNetworkNodes()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/blockchain/block/:index', (req, res) => {
    const { index } = req.params;
    try {
        const isDeleted = blockchainService.removeBlockByIndex(parseInt(index));
        if (isDeleted) {
            res.status(200).json({ message: 'Bloque eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Bloque no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//actualizar transacción
router.put('/update-transaction', (req, res) => {
    const { originalHash, autor, content } = req.body;
    try {
        const updatedTransaction = blockchainService.updateTransaction(originalHash, autor, content);
        res.status(200).json({
            message: 'Transacción actualizada exitosamente',
            transaction: updatedTransaction
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//eliminar un bloque
router.delete('/blockchain/block/:hash', (req, res) => {
    const { hash } = req.params;
    try {
        const isDeleted = blockchainService.removeBlockByhash(parseInt(hash));
        if (isDeleted) {
            res.status(200).json({ message: 'Bloque eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Bloque no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
