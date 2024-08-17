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

router.get('/post/:hash', async (req, res) => {
    /* solicitud get de la forma: GET /post/abc123?autor=1
 */
    const postController = new PostController();
    const { hash } = req.params;
    const { autor } = req.query;//id del autor

    try {
        const post = await postController.getUniquePublication(hash, autor);
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
