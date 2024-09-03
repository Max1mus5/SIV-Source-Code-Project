const { sequelize } = require('../../../connection/db/database');
const commentInstance = require('../model/commmentInstance');
const { Comment } = require('../../../connection/db/schemas/comments-schema/commentSchema');
const { Posts } = require('../../../connection/db/schemas/posts-schema/postSchema');
const { validateRequiredFields } = require('../utils/utils');
const dotenv = require('dotenv');
dotenv.config();

class CommentController {
    async createComment(commentData) {
        const transaction = await sequelize.transaction();
        try {
            // Validar campos requeridos
            validateRequiredFields(commentData, ['autor', 'content', 'postHash']);

            // Crear instancia de Comment
            const newCommentInstance = commentInstance.createComment(
                commentData.autor,
                commentData.content,
                new Date().toISOString(),
                commentData.postHash
            );
              
            // Actualizar cantidad de comentario asociados al post en la base de datos
            const post = await Posts.findOne({ where: { hashBlockchain: newCommentInstance.postHash } }, { transaction });
            post.comments = post.comments + 1;

             // Crear el comentario en la base de datos con la transacción activa
             const newComment = await Comment.create({
                user_id: newCommentInstance.autor,
                post_id:post.id,
                content: newCommentInstance.content,
                creationDate: newCommentInstance.date,
            }, { transaction });
              

            await transaction.commit();
            return newComment;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = CommentController;