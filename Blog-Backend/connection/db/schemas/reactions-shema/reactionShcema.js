const { sequelize } = require('../../database');
const { DataTypes } = require('sequelize');

const Reaction = sequelize.define("Reaction", { 
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
    allowNull: true,
  },
  reaction: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  comment_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  }
    
});

module.exports = { Reaction };