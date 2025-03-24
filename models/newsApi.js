const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");

const NewsApi = sequelize.define(
  "NewsApi",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    apiName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    urlBase: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
  // {
  //   timestamps: false, // No createdAt or updatedAt fields
  // }
);

module.exports = NewsApi;
