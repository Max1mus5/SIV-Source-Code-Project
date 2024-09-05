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
            validateRequiredFields(commentData, ['autor', 'content', 'post_id']);

            // Crear instancia de Comment
            const newCommentInstance = commentInstance.createComment(
                commentData.autor,
                commentData.content,
                commentData.post_id,
                new Date().toISOString(),
                commentData.answerComment_id
            );
            console.log(newCommentInstance);

            let postid = parseInt(commentData.post_id, 10)
            const post = await Posts.findOne({ where: { id: postid }, transaction });
            if (!post) {
                console.log(post);
                throw new Error('No se encontró el post asociado');
            }
            // Verificar si answerComment_id existe y es diferente de null
            let answerComment;
            if (commentData.answerComment_id) {
                answerComment = await Comment.findOne({
                    where: { id: commentData.answerComment_id },
                    transaction
                });

                if (!answerComment) {
                    console.log('No se encontró el comentario asociado');
                    answerComment = null;
                }

                newCommentInstance.comment_id = answerComment.id;
            }

            // Crear el comentario en la base de datos con la transacción activa
            const newComment = await Comment.create({
                user_id: newCommentInstance.autor,
                post_id: post.id,
                content: newCommentInstance.content,
                creationDate: newCommentInstance.date,
                comment_id: answerComment ? answerComment.id : null
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
