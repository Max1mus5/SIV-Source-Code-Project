const express = require('express');
const router = express.Router();
const ReactionController = require('../controller/reactionController');
const { handleErrorResponse } = require('../utils/utils');
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware');

router.post('/create', authenticateToken, async (req, res) => {
  const reactionController = new ReactionController();
  try {
      const newReaction = await reactionController.createReaction(req.body);
      res.status(201).json(newReaction);
  } catch (error) {
      handleErrorResponse(res, error);
  }
});

router.delete('/delete/:reactionId', authenticateToken, async (req, res) => {
  const reactionController = new ReactionController();
  try {
      const result = await reactionController.deleteReaction(req.params.reactionId, req.user.id);
      res.status(200).json(result);
  } catch (error) {
      handleErrorResponse(res, error);
  }
});

router.get('/post/:postId', async (req, res) => {
  const reactionController = new ReactionController();
  try {
      const reactions = await reactionController.getReactionsByPost(req.params.postId);
      res.status(200).json(reactions);
  } catch (error) {
      handleErrorResponse(res, error);
  }
});

// Obtener reacciones de un comentario
router.get('/comment/:commentId', async (req, res) => {
  const reactionController = new ReactionController();
  try {
      const reactions = await reactionController.getReactionsByComment(req.params.commentId);
      res.status(200).json(reactions);
  } catch (error) {
      handleErrorResponse(res, error);
  }
});

// Obtener reacciones de un usuario
router.get('/user/:userId', async (req, res) => {
  const reactionController = new ReactionController();
  try {
      const reactions = await reactionController.getUserReactions(req.params.userId);
      res.status(200).json(reactions);
  } catch (error) {
      handleErrorResponse(res, error);
  }
});

router.get('/docs', (req, res) => {
  res.json({
      "/create": {
          description: 'Crear una nueva reacción',
          method: 'POST',
          requiresAuth: true,
          body: {
              user_id: 'Integer (required)',
              post_id: 'Integer (optional)',
              comment_id: 'Integer (optional)',
              reaction: 'String (required)'
          }
      },
      "/delete/:reactionId": {
          description: 'Eliminar una reacción',
          method: 'DELETE',
          requiresAuth: true,
          params: {
              reactionId: 'Integer'
          }
      },
      "/post/:postId": {
          description: 'Obtener reacciones de un post',
          method: 'GET',
          params: {
              postId: 'Integer'
          }
      },
      "/comment/:commentId": {
          description: 'Obtener reacciones de un comentario',
          method: 'GET',
          params: {
              commentId: 'Integer'
          }
      },
      "/user/:userId": {
          description: 'Obtener reacciones de un usuario',
          method: 'GET',
          params: {
              userId: 'Integer'
          }
      }
  });
});

module.exports = router;
