const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");

// const NewsApi = sequelize.define(
const NewsArticleAggregatorSource = sequelize.define(
  "NewsArticleAggregatorSource",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    //apiName
    nameOfOrg: {
      type: DataTypes.STRING,
    },
    //urlBase
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiKey: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    isApi: {
      type: DataTypes.BOOLEAN,
    },
    isRss: {
      type: DataTypes.BOOLEAN,
    },
  }
);

module.exports = NewsArticleAggregatorSource;
