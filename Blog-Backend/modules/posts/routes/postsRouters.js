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

router.get('/post/:hash/:autor', async (req, res) => {
    const postController = new PostController();
    const hash  = req.params;
    const autor  = req.params;

    try {
        const result = await postController.getUniquePublication(hash, autor);
        res.status(200).json(result);
    } catch (error) {
        handleErrorResponse(res, error, 404);
    }
});

module.exports = router;
