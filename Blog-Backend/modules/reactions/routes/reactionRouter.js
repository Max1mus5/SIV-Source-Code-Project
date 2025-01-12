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