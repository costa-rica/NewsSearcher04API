const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");

const NewsApiKeywordContract = sequelize.define(
  "NewsApiKeywordContract",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    newsApiId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    keywordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requestDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    requestCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startDateOfRequest: {
      type: DataTypes.DATEONLY,
      // allowNull: false,
    },
    endDateOfRequest: {
      type: DataTypes.DATEONLY,
      // allowNull: false,
    },
  }
  // {
  //   timestamps: false,
  // }
);

module.exports = NewsApiKeywordContract;
