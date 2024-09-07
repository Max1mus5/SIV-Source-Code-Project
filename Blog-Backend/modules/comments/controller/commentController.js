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
            post.comments = parseInt(post.comments, 10) + 1;
            await post.save({ transaction });
            await transaction.commit();
            return newComment;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }


    async getComments(post_id) {
        // Obtener los comentarios asociados a un post
        const comments = await Comment.findAll({ where: { post_id: post_id } });
    
        // Ordenar los comentarios por fecha de creación en orden descendente
        comments.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
    
        // Crear un mapa para organizar comentarios por su id
        const commentMap = new Map();
        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, children: [] });
        });
    
        // Agrupar los comentarios por su comentario padre
        const result = [];
        comments.forEach(comment => {
            if (!comment.comment_id) {
                // Comentario padre
                result.push([commentMap.get(comment.id)]);
            } else {
                // Comentario hijo
                const parentComment = commentMap.get(comment.comment_id);
                if (parentComment) {
                    parentComment.children.push(commentMap.get(comment.id));
                }
            }
        });
    
        // Función recursiva para ordenar los hijos de cada comentario de manera descendente
        const orderChildComments = (commentGroup) => {
            commentGroup.forEach(group => {
                const [parentComment] = group;
                if (parentComment.children.length > 0) {
                    parentComment.children.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
                    parentComment.children.forEach(child => orderChildComments([[child]]));
                }
            });
        };
    
        // Ordenar los comentarios hijos recursivamente
        result.forEach(group => {
            const [parentComment] = group;
            orderChildComments([[parentComment]]);
        });
    
        // Para cada grupo padre, agregar los hijos en el formato deseado
        const finalResult = result.map(group => {
            const [parentComment] = group;
            const sortedChildren = parentComment.children.map(child => [child]);
            return [parentComment, ...sortedChildren];
        });
    
        return finalResult;
    }

    async deleteComment(comment_id) {
        const transaction = await sequelize.transaction();
        try {
            // Buscar el comentario a eliminar
            const comment = await Comment.findOne({ where: { id: comment_id }, transaction });
            if (!comment) {
                throw new Error('No se encontró el comentario');
            }

            const asscoiatedComments = await Comment.findAll({ where: { comment_id: comment.id }, transaction });

            // convert to null
            asscoiatedComments.forEach(async (comment) => {
                comment.comment_id = null;
                await comment.save({ transaction });
            });

            // Eliminar el comentario
            await comment.destroy({ transaction });

            // Actualizar el contador de comentarios en el post asociado
            const post = await Posts.findOne({ where: { id: comment.post_id }, transaction });
            post.comments = parseInt(post.comments, 10) - 1;
            await post.save({ transaction });

            await transaction.commit();
            return comment;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

}

module.exports = CommentController;
