const { sequelize } = require('../../database');
const { DataTypes } = require('sequelize');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'author', 'reader'),
    defaultValue: 'reader',
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  favorites:{
    type: DataTypes.ARRAY(DataTypes.INTEGER),//Array of post ids
    allowNull: true
  },
  posts:{
    type: DataTypes.ARRAY(DataTypes.INTEGER),//Array of post ids
    allowNull: true
  },
  validationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tokenExpiration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
});

module.exports = { User };
