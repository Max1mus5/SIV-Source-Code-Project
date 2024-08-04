const { sequelize } = require('../../database');
const { DataTypes } = require('sequelize');

const Posts = sequelize.define("Posts", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  autor_id:{
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  title:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  content:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  likes:{
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  post_image:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  hashBlockchain:{
    type: DataTypes.STRING,
    allowNull: true, //RECORDAR MODIFICAR ESTE CAMPO CUANDO SE IMPLEMENTE LA BLOCKCHAIN
  },
  comments:{
    type: DataTypes.STRING,
    allowNull: true,
  },

});
  
module.exports = { Posts };