const { sequelize } = require('../../database');
const { DataTypes } = require('sequelize');

const Posts = sequelize.define("Posts", {

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
  resume:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estado:{
    type: DataTypes.STRING,
    defaultValue: 'draft',
    allowNull: false,
  },
  hashBlockchain:{
    type: DataTypes.STRING,
    allowNull: true,  // NULL para borradores
  },
  comments:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },

});
  
module.exports = { Posts };