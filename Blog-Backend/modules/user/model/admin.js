const Author = require('./autor');

class Admin extends Author {
    /* delete user function  */
    deleteUser() {
       console.log("User Deleted");
    }

    deletePost(postId) {
        // delete post
    }

    createCategory(category) {
        //create category
    }

    toJSON() {
        return {
            ...super.toJSON(),
            role: 'admin'
        };
    }
}

module.exports = Admin;
