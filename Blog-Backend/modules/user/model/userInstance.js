const Reader = require('./reader');
const Autor = require('./autor');
const Admin = require('./admin');
const User = require('./userModel');


class UserInstance {
  static createUser(id, username, email, password, bio, role, profileImage) {
      switch (role) {
          case 'reader':
              return new User(id, username, email, password, bio, role, profileImage, new Reader());
          case 'autor':
              return new User(id, username, email, password, bio, role, profileImage, new Autor());
          case 'admin':
              return new User(id, username, email, password, bio, role, profileImage, new Admin());
          default:
              throw new Error(`Invalid role: ${role}`);
      }
  }
}

module.exports = UserInstance;

