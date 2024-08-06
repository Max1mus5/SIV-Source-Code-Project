const express = require('express');
const router = express.Router();
const PostController = require('../controller/postController');

router.post('/create-new-publication', async (req, res) => {
    const postController = new PostController();
    try {
        const newPost = await postController.createPost(req.body);
        res.status(200).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
