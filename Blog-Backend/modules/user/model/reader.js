class Reader {
  constructor() {
      this._favorites = [];
  }

  get favorites() {
      return this._favorites;
  }

  set favorites(value) {
      this._favorites = value;
  }

  addFavorite(postId) {
      // Add favorites
  }

  favoriteCounter() {
      // countFavs
  }

  deleteFavorite(postId) {
      // deletefav
  }
  toJSON() {
    return {
        favorites: this._favorites
    };
}
}

module.exports = Reader;
