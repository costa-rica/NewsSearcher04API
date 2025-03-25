const express = require("express");
// const Keyword = require("../models/keyword");
const { Keyword } = require("newsshareddb");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const router = express.Router();

router.get("/add-keywords-from-csv", async (req, res) => {
  const filePath = path.join(
    process.env.PATH_PROJECT_RESOURCES,
    "keywords.csv"
  );
  console.log(`filePath: ${filePath}`);
  const records = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // fix headers in csv file - for some reason they don't get recognized well ( category gets read as string instead of key).
      const normalizedRow = {};
      Object.keys(row).forEach((key) => {
        const trimmedKey = key.trim().toLowerCase();
        normalizedRow[trimmedKey] = row[key].trim();
      });

      console.log(normalizedRow); // Check what the row now looks like

      if (normalizedRow.keyword && normalizedRow.category) {
        records.push({
          keyword: normalizedRow.keyword,
          category: normalizedRow.category,
        });
      }
    })
    .on("end", async () => {
      console.log("CSV file successfully processed");
      try {
        // Insert into database using bulkCreate
        await Keyword.bulkCreate(records);
        res
          .status(200)
          .json({ message: "CSV data uploaded successfully!", data: records });
      } catch (dbError) {
        console.error("Database error:", dbError);
        res
          .status(500)
          .json({ error: "Failed to insert data into the database." });
      }
    });
});

// POST route to add keywords
router.post("/add-keyword", async (req, res) => {
  const { keyword, category } = req.body;
  const newKeyword = await Keyword.create({
    keyword: keyword,
    category: category,
  });

  res.json({ result: true });
});

// POST route to add keywords
router.post("/add-keywords-array", async (req, res) => {
  const { keywordsArray } = req.body;
  console.log(keywordsArray);
  console.log(typeof keywordsArray);

  for (elem of keywordsArray) {
    console.log(elem);
  }
  // const newCategory = await Category.create({
  //   keyword: keyword,
  //   category: category,
  // });

  res.json({ result: true });
});

// POST route to add keywords
router.post("/add-keywords", async (req, res) => {
  try {
    const { keywords } = req.body;

    if (!Array.isArray(keywords)) {
      return res
        .status(400)
        .json({ error: "Invalid format. Expected an array of objects." });
    }

    // Validate that each object contains keyword and category
    for (const item of keywords) {
      if (!item.keyword || !item.category) {
        return res.status(400).json({
          error: 'Each object must have "keyword" and "category" properties.',
        });
      }
    }

    // Insert keywords into the database
    await Keyword.bulkCreate(keywords);

    res.status(201).json({ message: "Keywords added successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
