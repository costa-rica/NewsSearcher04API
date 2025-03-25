const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");
const NewsArticleAggregatorSource = require("./newsArticleAggregatorSource"); // was NewsApi model

const Article = sequelize.define("Article", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sourceName: {
    type: DataTypes.STRING,
  },
  author: {
    type: DataTypes.STRING,
  },
  title: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  urlToImage: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true,
    },
  },
  publishedDate: {
    type: DataTypes.DATE,
  },
  content: {
    type: DataTypes.TEXT,
  },
  // apiSource: {
  newsArticleAggregatorSourceId: {
    type: DataTypes.INTEGER,
    references: {
      model: NewsArticleAggregatorSource, // Foreign key reference
      key: "id",
    },
  },
  keywordId: {
    type: DataTypes.INTEGER,
  },
  contentWebscraped: {
    type: DataTypes.TEXT,
  },
});

module.exports = Article;
