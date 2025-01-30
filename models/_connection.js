const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  // storage: path.join(__dirname, "../database.sqlite"), // Database file location
  storage: path.join(process.env.PATH_DB, "news_searcher.db"), // Database file location
  logging: false, // Disable logging
});

module.exports = sequelize;
