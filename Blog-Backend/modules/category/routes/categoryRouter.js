const express = require('express');
const router = express.Router();
const CategoryController = require('../controller/categoryController');

//#region Routes
router.get('/getCategory', async (req, res) => {
    try {
        const category = await CategoryController.getCategory();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error occured in getCategory' });
    }
});

