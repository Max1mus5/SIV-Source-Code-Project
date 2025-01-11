const express = require('express');
const router = express.Router();
const PostController = require('../controller/postController');
const { handleErrorResponse } = require('../utils/utils');
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware');

//#region Routes
router.post('/create-new-publication', authenticateToken, async (req, res) => {
    const postController = new PostController();
    try {
        const newPost = await postController.createPost(req.body);
        res.status(200).json(newPost);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

router.get('/:hash/:autor',  async (req, res) => {
    const postController = new PostController();
    const { hash, autor } = req.params;
    try {
        const result = await postController.getUniquePublication(hash, autor);
        res.status(200).json(result);
    } catch (error) {
        handleErrorResponse(res, error, 404);
    }
});

router.get('/my-feed', authenticateToken, async (req, res) => {
    const postController = new PostController();
    try {
        const posts = await postController.getAllPosts(); 
        res.status(200).json({
            status: 'success',
            data: posts
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al obtener el feed' 
        });
    }
});

router.get('/get-list-post', authenticateToken, async (req, res) => {
    const postController = new PostController();
    try {
        const arrayPostId = req.query.arrayPostId;
        const result = await postController.getArrayPosts(arrayPostId);
        res.status(200).json(result);
    }
    catch (error) {
        handleErrorResponse(res, error);
        
    }
});

router.put('/update-publication', authenticateToken, async (req, res) => {
    const postController = new PostController();
    try {
        const updatedPost = await postController.updatePost(req.body);
        res.status(200).json({ message: 'Post updated', updatedPost });
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

router.delete('/delete-publication/:postid',authenticateToken, async (req, res) => {
    const postController = new PostController();
    try {
        let postId = req.params.postid;
        const deletedPost = await postController.deletePost(postId);
        res.status(200).json({message: 'Post Deleted',deletedPost});
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

//#region Documentation
router.get('/docs', (req, res) => {
    res.json({
        "/create-new-publication": {
            description: 'Create a new publication',
            method: 'POST',
            params: {
                body: 'Object'
            },
            returns: 'The newly created post'
        },
        "/:hash/:autor": {
            description: 'Get a unique publication by hash and author',
            method: 'GET',
            params: {
                hash: 'String',
                autor: 'String'
            },
            returns: 'The unique publication'
        },
        "/my-feed": {
            description: 'Get all posts',
            method: 'GET',
            params: {},
            returns: 'All posts'
        },
        "/get-list-post": {
            description: 'Get selected posts by ID provided by a category name query',
            method: 'GET',
            params: {
                arrayPostId: 'String'
            },
            returns: 'The selected posts'
        },
        "/update-publication": {
            description: 'Update a publication',
            method: 'PUT',
            params: {
                body: 'Object'
            },
            returns: 'The updated post'
        },
        "/delete-publication/:postid": {
            description: 'Delete a publication by id',
            method: 'DELETE',
            params: {
                postid: 'String'
            },
            returns: 'The deleted post'
        },
        
    });



});



module.exports = router;