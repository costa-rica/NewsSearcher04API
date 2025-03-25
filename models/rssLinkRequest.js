const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");

const RssLinkRequest = sequelize.define("RssLinkRequest", {
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
  requestDate: {
    type: DataTypes.DATEONLY,
  },
  requestCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  statusOfResponse: {
    type: DataTypes.STRING,
  },
  response: {
    type: DataTypes.JSON,
  },
});

module.exports = RssLinkRequest;
