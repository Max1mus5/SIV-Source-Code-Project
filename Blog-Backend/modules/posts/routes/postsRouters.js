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

router.get('/post/:hash', async (req, res) => {
     /* solicitud get de la forma: GET /post/abc123?autor=1
 */
    const postController = new PostController();
    const { hash } = req.params;
    const { autor } = req.query;

    try {
        const result = await postController.getUniquePublication(hash, autor);
        res.status(200).json(result);
    } catch (error) {
        handleErrorResponse(res, error, 404);
    }
});

module.exports = router;
