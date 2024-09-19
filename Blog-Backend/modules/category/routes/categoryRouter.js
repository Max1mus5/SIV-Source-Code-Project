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

router.post('/createCategory', async (req, res) => {
    const CategoryInstance = new CategoryController();
    try {
        const newCategory = await CategoryInstance.createCategory(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error occured, in creating category' });
    }
});

router.post('/addPostsToCategory', async (req, res) => {
    const CategoryInstance = new CategoryController();
    try {
        const postId = req.body.postId;
        const categoryId = req.body.categoryId;
        const newPost = await CategoryInstance.addPostsToCategory(postId, categoryId);
        res.status(201).json({ message: 'Post added to category', newPost });
    } catch (error) {
        res.status(500).json({ message: 'Error occured, in adding posts to category' });
    }
});
