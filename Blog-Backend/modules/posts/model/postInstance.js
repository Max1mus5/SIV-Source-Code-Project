const Post = require('./postModel');

class PostInstance {
    static createPost(autor, title, content, image, date = '', hashBlockchain = '', likes = 0, comments = []) {
        try {
            return new Post(autor, date, title, content, image, hashBlockchain, likes, comments);
        } catch (error) {
            throw new Error(`Error al crear el post: ${error.message}`);
        }
    }
}

module.exports = PostInstance;
