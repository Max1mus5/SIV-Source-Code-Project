class Comment {
  constructor(autor, content, date, postHash) {
      this._autor = autor;
      this._content = content;
      this._date = date;
      this._postHash = postHash;
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

  get postHash() {
      return this._postHash;
  }

  set postHash(value) {
      this._postHash = value;
  }
}

module.exports = Comment;
