class Post {
    constructor(autor, date, title, content, image, hashBlockchain = '', likes = 0, comments = []) {
        this._autor = autor;
        this._date = date;
        this._title = title;
        this._content = content;
        this._image = image;
        this._hashBlockchain = hashBlockchain;
        this._likes = likes;
        this._comments = comments;
    }

    get autor() {
        return this._autor;
    }

    set autor(value) {
        this._autor = value;
    }

    get date() {
        return this._date;
    }

    set date(value) {
        this._date = value;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get content() {
        return this._content;
    }

    set content(value) {
        this._content = value;
    }

    get image() {
        return this._image;
    }

    set image(value) {
        this._image = value;
    }   

    get hashBlockchain() {
        return this._hashBlockchain;
    }   

    set hashBlockchain(value) {
        this._hashBlockchain = value;
    }

    get likes() {
        return this._likes;
    }

    set likes(value) {
        this._likes = value;
    }

    get comments() {
        return this._comments;
    }

    set comments(value) {
        this._comments = value;
    }


}


module.exports = Post;