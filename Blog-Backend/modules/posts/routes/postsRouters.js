const express = require('express');
const router = express.Router();
const PostController = require('../controller/postController');
const { handleErrorResponse } = require('../utils/utils');

router.post('/create-new-publication', async (req, res) => {
    const postController = new PostController();
    try {
        const newPost = await postController.createPost(req.body);
        res.status(200).json(newPost);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

router.get('/:hash/:autor', async (req, res) => {
    const postController = new PostController();
    const { hash, autor } = req.params;
    try {
        const result = await postController.getUniquePublication(hash, autor);
        res.status(200).json(result);
    } catch (error) {
        handleErrorResponse(res, error, 404);
    }
});

router.get('/my-feed', async (req, res) => {
    const postController = new PostController();
    try {
        const result = await postController.getAllPosts();
        res.status(200).json(result);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

module.exports = router;
