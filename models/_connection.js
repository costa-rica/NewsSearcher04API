const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(process.env.PATH_DB, process.env.NAME_DB), // Database file location
  logging: false, // Disable logging
});

module.exports = sequelize;
