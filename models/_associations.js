const Keyword = require("./keyword");
const NewsApiRequest = require("./newsApiRequest"); // const NewsApiKeywordContract
const NewsArticleAggregatorSource = require("./newsArticleAggregatorSource"); // const NewsApi = require("./newsApi");
const Article = require("./article");
const RssLinkRequest = require("./rssLinkRequest");

// One (SchemaA) to Many (SchemaB)
// hasMany: SchemaA hasMany(SchemaB, {foreignKey: "schemaAId"})
// belongsTo: SchemaB belongsTo(SchemaA, {foreignKey: "schemaAId"})

// Associations
NewsArticleAggregatorSource.hasMany(Article, {
  foreignKey: "newsArticleAggregatorSourceId",
  onDelete: "CASCADE",
});

Article.belongsTo(NewsArticleAggregatorSource, {
  foreignKey: "newsArticleAggregatorSourceId",
});

// NewsArticleAggregatorSource (former: NewsApi) has many NewsApiRequest
NewsArticleAggregatorSource.hasMany(NewsApiRequest, {
  foreignKey: "newsArticleAggregatorSourceId",
  onDelete: "CASCADE",
});
NewsApiRequest.belongsTo(NewsArticleAggregatorSource, {
  foreignKey: "newsArticleAggregatorSourceId",
});

NewsArticleAggregatorSource.hasMany(RssLinkRequest, {
  foreignKey: "newsArticleAggregatorSourceId",
  onDelete: "CASCADE",
});
RssLinkRequest.belongsTo(NewsArticleAggregatorSource, {
  foreignKey: "newsArticleAggregatorSourceId",
});

// Keyword has many NewsApiRequest
Keyword.hasMany(NewsApiRequest, {
  foreignKey: "keywordId",
  onDelete: "CASCADE",
});
NewsApiRequest.belongsTo(Keyword, {
  foreignKey: "keywordId",
});
