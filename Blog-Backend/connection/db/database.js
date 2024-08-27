const { Sequelize, DataTypes } = require('sequelize');



const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite3',
});

sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));
    
module.exports = { sequelize };


const { User } = require('./schemas/user-schema/userSchema');
const { Posts } = require('./schemas/posts-schema/postSchema');
const { Category } = require('./schemas/category-schema/categorySchema');
const { Post_Category } = require('./schemas/category-schema/post_categorySchema');
const { Comment } = require('./schemas/comments-schema/commentSchema');
const { Notification } = require('./schemas/notification-schema/notificationSchema');
const { Reaction } = require('./schemas/reactions-shema/reactionShcema');
const { Config } = require('./schemas/config-schema/configSchema');
// Relaciones
User.hasMany(Posts, { foreignKey: 'autor_id' });
Posts.belongsTo(User, { foreignKey: 'autor_id' });

Posts.belongsToMany(Category, { through: Post_Category, foreignKey: 'postId' }); // it means that Post has many Categories and the foreign key is postId in the Post_Category table
Category.belongsToMany(Posts, { through: Post_Category, foreignKey: 'categoryId' }); // it means that Category has many Posts and the foreign key is categoryId in the Post_Category table

//a comment belongs to a post 
Posts.hasMany(Comment, { foreignKey: 'post_id' }); 
Comment.belongsTo(Posts, { foreignKey: 'post_id' });

//a comment belongs to a user
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

//a user has a reaction 1:1
User.hasOne(Reaction, { foreignKey: 'user_id' });
Reaction.belongsTo(User, { foreignKey: 'user_id' });

//a post has many reactions 1:*
Posts.hasMany(Reaction, { foreignKey: 'post_id' });
Reaction.belongsTo(Posts, { foreignKey: 'post_id' });

//a comment has many reactions 1:*
Comment.hasMany(Reaction, { foreignKey: 'comment_id' });
Reaction.belongsTo(Comment, { foreignKey: 'comment_id' });

// a user has many notifications
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

//a user has a configuration 1:1
User.hasOne(Config, { foreignKey: 'user_id' });
Config.belongsTo(User, { foreignKey: 'user_id' });

// Definir modelo Users_backup
const Users_backups = sequelize.define('Users_backups', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  bio: DataTypes.STRING,
  role: DataTypes.ENUM('admin', 'autor', 'reader'),
  profileImage: DataTypes.STRING,
  favorites: DataTypes.ARRAY(DataTypes.INTEGER),
  posts: DataTypes.ARRAY(DataTypes.INTEGER),
  validationToken: DataTypes.STRING,
  tokenExpiration: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  timestamps: false
});

// Crear tabla Users_backup si no existe
sequelize.sync({ alter: true }).then(async () => {
  try {
    // Migrar datos de User a Users_backup
    const users = await User.findAll();
    for (let user of users) {
      const existingUser = await Users_backups.findOne({ where: { email: user.email } });
      if (existingUser) {
        // Actualizar usuario existente
        await existingUser.update({
          name: user.name,
          password: user.password,
          bio: user.bio,
          role: user.role,
          profileImage: user.profileImage,
          favorites: user.favorites,
          posts: user.posts,
          validationToken: user.validationToken,
          tokenExpiration: user.tokenExpiration,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      } else {
        // Crear nuevo usuario
        await Users_backups.create({
          name: user.name,
          email: user.email,
          password: user.password,
          bio: user.bio,
          role: user.role,
          profileImage: user.profileImage,
          favorites: user.favorites,
          posts: user.posts,
          validationToken: user.validationToken,
          tokenExpiration: user.tokenExpiration,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        });
      }
    }
    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Error migrating data:', error);
  }
}).catch(err => console.error('Error al crear tabla Users_backups:', err));

module.exports = { sequelize, User, Posts, Category, Post_Category, Comment, Notification, Reaction, Config, Users_backups };
