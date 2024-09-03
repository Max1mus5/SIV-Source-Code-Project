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
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creationDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { Comment };