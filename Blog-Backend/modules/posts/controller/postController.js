/// post controlle
const PostModel = require('../model/postModel');
const postModel = new PostModel();
class PostController {
    //create a new post
    createPost(post) {
        return postModel.createPost(post);
    }
    //get all posts
    getPosts() {
        return postModel.getPosts();
    }
    //get post by id
    getPostById(id) {
        return postModel.getPostById(id);
    }
    //update post by id
    updatePostById(id, post) {
        return postModel.updatePostById(id, post);
    }
    //delete post by id
    deletePostById(id) {
        return postModel.deletePostById(id);
    }
}

module.exports = PostController;
