const express = require('express');
const router = express.Router();
const BlockchainService = require('./blockchainServices');
const dotenv = require('dotenv');
dotenv.config();

// Instancia del servicio de blockchain
const blockchainService = new BlockchainService();

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

module.exports = router;