const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");

const Keyword = sequelize.define("Keyword", {
  keyword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Keyword;
