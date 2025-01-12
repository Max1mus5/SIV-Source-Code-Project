const { Reaction } = require('../../../connection/db/schemas/reaction-schema/reactionSchema');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { Comment } = require('../../../connection/db/schemas/comments-schema/commentSchema');
const { sequelize } = require('../../../connection/db/database');
const { validateRequiredFields } = require('../utils/utils');

async createReaction(reactionData) {
  const transaction = await sequelize.transaction();
  try {
      validateRequiredFields(reactionData, ['user_id', 'reaction']);
      
      // Validar que se proporcione post_id o comment_id
      if (!reactionData.post_id && !reactionData.comment_id) {
          throw new Error('Debe proporcionar post_id o comment_id');
      }

      // Verificar si ya existe una reacción del usuario
      const existingReaction = await Reaction.findOne({
          where: {
              user_id: reactionData.user_id,
              ...(reactionData.post_id ? {post_id: reactionData.post_id} : {comment_id: reactionData.comment_id})
          },
          transaction
      });

      if (existingReaction) {
          throw new Error('El usuario ya ha reaccionado a este contenido');
      }

      // Crear la reacción
      const newReaction = await Reaction.create({
          user_id: reactionData.user_id,
          post_id: reactionData.post_id || null,
          comment_id: reactionData.comment_id || null,
          reaction: reactionData.reaction,
          creationDate: new Date()
      }, { transaction });

      // Actualizar contador de likes si es un post
      if (reactionData.post_id) {
          await Posts.increment('likes', { 
              by: 1,
              where: { id: reactionData.post_id },
              transaction 
          });
      }

      await transaction.commit();
      return newReaction;
  } catch (error) {
      await transaction.rollback();
      throw error;
  }
}
