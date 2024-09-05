class Comment {
  constructor(autor, content, date,  post_id, comment_id) {
      this._autor = autor;
      this._content = content;
      this._date = date;
      this._post_id =  post_id;
  }

  get autor() {
      return this._autor;
  }

  set autor(value) {
      this._autor = value;
  }

  get content() {
      return this._content;
  }

  set content(value) {
      this._content = value;
  }

  get date() {
      return this._date;
  }

  set date(value) {
      this._date = value;
  }

  get  post_id() {
      return this._post_id;
  }

  set  post_id(value) {
      this._post_id = value;
  }
  
  get comment_id() {
        return this._comment_id;
    }
  
  set comment_id(value) {
        this._comment_id = value;
    }
}

module.exports = Comment;
