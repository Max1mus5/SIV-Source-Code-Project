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


module.exports = router;
