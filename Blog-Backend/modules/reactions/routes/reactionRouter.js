const express = require('express');
const router = express.Router();
const ReactionController = require('../controller/reactionController');
const { handleErrorResponse } = require('../utils/utils');
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware');

