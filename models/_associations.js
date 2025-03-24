const NewsApi = require("./newsApi");
const Keyword = require("./keyword");
const NewsApiKeywordContract = require("./newsApiKeywordContracts");

// Associations

// NewsApi has many NewsApiKeywordContracts
NewsApi.hasMany(NewsApiKeywordContract, {
  foreignKey: "newsApiId",
  onDelete: "CASCADE",
});
NewsApiKeywordContract.belongsTo(NewsApi, {
  foreignKey: "newsApiId",
});

// Keyword has many NewsApiKeywordContracts
Keyword.hasMany(NewsApiKeywordContract, {
  foreignKey: "keywordId",
  onDelete: "CASCADE",
});
NewsApiKeywordContract.belongsTo(Keyword, {
  foreignKey: "keywordId",
});
