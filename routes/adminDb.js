const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const archiver = require("archiver");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
// const User = require("../models/user");
const Article = require("../models/article");
const Keyword = require("../models/keyword");
const NewsApi = require("../models/newsApi");

dotenv.config();

const EXPORT_DIR = process.env.PATH_PROJECT_RESOURCES || "./exports";

// Ensure the export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

const exportTableToCSV = async (model, filename) => {
  try {
    const records = await model.findAll({ raw: true });
    if (!records.length) return null;

    const parser = new Parser();
    const csv = parser.parse(records);
    const filePath = path.join(EXPORT_DIR, filename);
    fs.writeFileSync(filePath, csv);
    return filePath;
  } catch (error) {
    console.error(`Error exporting ${filename}:`, error);
    return null;
  }
};

router.get("/export-db", async (req, res) => {
  try {
    console.log("Starting database export...");

    const files = await Promise.all([
      // exportTableToCSV(User, "users.csv"),
      exportTableToCSV(Article, "articles.csv"),
      exportTableToCSV(Keyword, "keywords.csv"),
      exportTableToCSV(NewsApi, "newsapi.csv"),
    ]);

    const zipFilePath = path.join(EXPORT_DIR, "database_export.zip");
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`Database export completed: ${zipFilePath}`);
      res.download(zipFilePath);
    });

    archive.on("error", (err) => res.status(500).json({ error: err.message }));

    archive.pipe(output);
    files.forEach(
      (file) => file && archive.file(file, { name: path.basename(file) })
    );
    archive.finalize();
  } catch (error) {
    console.error("Error exporting database:", error);
    res.status(500).json({ error: "Failed to export database" });
  }
});

module.exports = router;
