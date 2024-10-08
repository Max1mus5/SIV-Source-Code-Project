const express = require('express');
const router = express.Router();
const CommentController = require('../controller/commentController');
const { handleErrorResponse } = require('../utils/utils');
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware');

//#region Routes
router.post('/create-comment', async (req, res) => {
    const commentController = new CommentController();
    try {
        const newComment = await commentController.createComment(req.body);
        res.status(200).json(newComment);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});


router.get('/get-comments/:post_id', async (req, res) => {
    const commentController = new CommentController();
    try {
        const comments = await commentController.getComments(req.params.post_id);
        res.status(200).json(comments);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

router.delete('/delete-comment/:comment_id', async (req, res) => {
    const commentController = new CommentController();
    try {
        const comment = await commentController.deleteComment(req.params.comment_id);
        res.status(200).json(comment);
    } catch (error) {
        handleErrorResponse(res, error);
    }
});

router.get('/docs', (req, res) => {
    res.json({
        "/create-comment": {
            description: 'Create a new comment',
            method: 'POST',
            params: {
                body: 'Object'
            },
            returns: 'The newly created comment'
        },
        "/get-comments/:post_id": {
            description: 'Get comments by post id',
            method: 'GET',
            params: {
                post_id: 'String'
            },
            returns: 'The comments'
        },
        "/delete-comment/:comment_id": {
            description: 'Delete a comment by id',
            method: 'DELETE',
            params: {
                comment_id: 'String'
            },
            returns: 'The deleted comment'
        },
        
    });
});



module.exports = router;
