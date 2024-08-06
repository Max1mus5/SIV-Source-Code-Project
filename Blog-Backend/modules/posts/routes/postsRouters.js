const express = require('express');
const router = express.Router();
const PostController = require('../controller/postController');

router.post('/create-new-publication', PostController.createPost);

module.exports = router;
