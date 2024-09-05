const Comment = require('./commentModel');

class CommentInstance {
    static createComment(autor, content, post_id, date, comment_id) {
        try {
            // Verificar si comment_id es null o undefined
            const commentId = comment_id ?? null;

            // Crear una nueva instancia del modelo Comment
            const newComment = new Comment(autor, content, date, post_id, commentId);

            // Establecer los valores usando los setters
            newComment.autor = autor;
            newComment.content = content;
            newComment.date = date;
            newComment.post_id = post_id;
            newComment.comment_id = commentId;

            return newComment;
        } catch (error) {
            console.error('Error al crear el comentario:', error);
            throw new Error(`Error al crear el comentario: ${error.message}`);
        }
    }
}

module.exports = CommentInstance;
