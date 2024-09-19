const express = require('express');
const router = express.Router();
const CategoryController = require('../controller/categoryController');

//#region Routes
router.get('/getCategory', async (req, res) => {
    const CategoryInstance = new CategoryController();
    try {
        const category = await CategoryInstance.getCategory();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error occured in getting categories' });
    }
});


router.get('/getPostsByCategory/:categoryName', async (req, res) => {
    const CategoryInstance = new CategoryController();
    try {
        const Posts_cateogory = await CategoryInstance.getPostsByCategory(req.params.categoryName);
        res.status(200).json(Posts_cateogory);
    } catch (error) {
        res.status(500).json({ message: 'Error occured, in getting posts by category' });
    }
});

router.get('/getPostsByCategory/:page', async (req, res) => {
    try {
        const page = req.params.page;
        const posts = await Posts.findAll({ where: { category: page } });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error occured in getPostsByCategory' });
    }
});
module.exports = router;
