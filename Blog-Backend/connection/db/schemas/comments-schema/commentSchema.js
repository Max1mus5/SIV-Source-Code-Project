const { sequelize } = require('../../database');
const { DataTypes } = require('sequelize');

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment_id:{
    type: DataTypes.INTEGER,// it will works for answers, a comment can have a comment as an answer
    allowNull: true // if it is null, it means that it is a comment to a post, else it is a comment to a comment
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = { Comment };