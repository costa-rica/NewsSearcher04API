const { DataTypes } = require("sequelize");
const sequelize = require("./_connection");
const NewsApi = require("./newsApi"); // Import the NewsApi model

const Article = sequelize.define(
  "Article",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sourceName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceId: {
      type: DataTypes.STRING,
    },
    author: {
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
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
    apiSource: {
      type: DataTypes.INTEGER,
      references: {
        model: NewsApi, // Foreign key reference
        key: "id",
      },
    },
    keywordSearch: {
      type: DataTypes.TEXT,
    },
    contentWebscraped: {
      type: DataTypes.TEXT,
    },
  }
  // {
  //   timestamps: false,
  // }
);

// Define the relationship
NewsApi.hasMany(Article, { foreignKey: "apiSource", onDelete: "CASCADE" });
Article.belongsTo(NewsApi, { foreignKey: "apiSource" });

module.exports = Article;
