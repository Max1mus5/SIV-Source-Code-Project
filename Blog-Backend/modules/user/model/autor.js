const Reader = require('./reader');

class Autor extends Reader {
    constructor() {
        super();
        this._posts = [];
    }

    get posts() {
        return this._posts;
    }

    set posts(value) {
        this._posts = value;
    }

    createPost(post) {
        // create post
    }

    updatePost(postId, updatedPost) {
        // update post
    }

    contributionCounter() {
        // count posts posted by the author
    }

    toJSON() {
        return {
            ...super.toJSON(),
            posts: this._posts
        };
    }
}

module.exports = Autor;
