const { sequelize } = require('../../database');
const { DataTypes } = require('sequelize');

const Config = sequelize.define("Config", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING, // this configs will be a json string
    defaultValue: 'default'
  },
});

module.exports = { Config };
