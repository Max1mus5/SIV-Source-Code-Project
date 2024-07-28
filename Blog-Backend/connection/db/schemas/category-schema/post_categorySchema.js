const { sequelize } = require('../../database');
const { DataTypes } = require('sequelize');

const Post_Category = sequelize.define("Post_Category", {
  postId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Posts',
      key: 'id',
    },
  },
  categoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
});

module.exports = { Post_Category };