const { Reaction } = require('../../../connection/db/schemas/reaction-schema/reactionSchema');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { Comment } = require('../../../connection/db/schemas/comments-schema/commentSchema');
const { sequelize } = require('../../../connection/db/database');
const { validateRequiredFields } = require('../utils/utils');
