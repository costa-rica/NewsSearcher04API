require("dotenv").config();
const sequelize = require("./models/_connection");
require("./models/_associations");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var keywordsRouter = require("./routes/keywords");
var newsSearcheRouter = require("./routes/newsSearches");
var adminDbRouter = require("./routes/adminDb");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/keywords", keywordsRouter);
app.use("/news-searches", newsSearcheRouter);
app.use("/admin-db", adminDbRouter);

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    console.log("✅ Database connected & synced");
    // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("Error syncing database:", error));

module.exports = app;
