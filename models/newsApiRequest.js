const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");

// const NewsApiKeywordContract = sequelize.define(
const NewsApiRequest = sequelize.define("NewsApiRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  //newsApiId
  newsArticleAggregatorSourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  keywordId: {
    type: DataTypes.INTEGER,
  },
  requestDate: {
    type: DataTypes.DATEONLY,
  },
  requestCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  startDateOfRequest: {
    type: DataTypes.DATEONLY,
  },
  endDateOfRequest: {
    type: DataTypes.DATEONLY,
  },
});

module.exports = NewsApiRequest;
