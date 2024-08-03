class PostModel {
    constructor() {
        this.posts = [];
    }
    //create a new post
    createPost(post) {
        this.posts.push(post);
        return post;
    }
    //get all posts
    getPosts() {
        return this.posts;
    }
    //get post by id
    getPostById(id) {
        return this.posts.find(post => post.id === id);
    }
    //update post by id
    updatePostById(id, post) {
        const index = this.posts.findIndex(post => post.id === id);
        this.posts[index] = post;
        return post;
    }
    //delete post by id
    deletePostById(id) {
        this.posts = this.posts.filter(post => post.id !== id);
        return this.posts;
    }
}