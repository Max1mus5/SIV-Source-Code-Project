const Comment = require('./commentModel');

class CommentInstance {
    static createComment(autor, content, date, postHash) {
        try {
            return new Comment(autor, content, date, postHash);
        } catch (error) {
            throw new Error(`Error al crear el comentario: ${error.message}`);
        }
    }
}

module.exports = CommentInstance;