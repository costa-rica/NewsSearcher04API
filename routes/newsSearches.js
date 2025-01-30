var express = require("express");
var router = express.Router();
const os = require("os");
const fs = require("fs");
const path = require("path");
const NewsApi = require("../models/newsApi");
const Article = require("../models/article");
const { saveApiResponseToFile } = require("../modules/utilitiesApiCalls");
const { createObjectCsvWriter } = require("csv-writer");

router.post("/call-news-api-api", async (req, res) => {
  console.log("In /call-news-api-api route");

  try {
    const { keyword } = req.body;
    const pageSize = 100;
    const fromDate = "2025-01-19";
    const toDate = "2025-01-29";

    // Fetch API configuration from database
    const newsApiRecord = await NewsApi.findOne({
      where: { apiName: "NewsAPI" },
    });

    if (!newsApiRecord) {
      return res.status(404).json({ error: "NewsAPI record not found in DB" });
    }

    // Construct the NewsAPI endpoint URL
    const urlNewsApiEverything = `${
      newsApiRecord.urlBase
    }everything?q=${encodeURIComponent(
      keyword
    )}&from=${fromDate}&to=${toDate}&pageSize=${pageSize}&language=en&apiKey=${
      newsApiRecord.apiKey
    }`;

    console.log(`Fetching data from: ${urlNewsApiEverything}`);

    // Make the API call
    const response = await fetch(urlNewsApiEverything);
    const data = await response.json();

    if (data.status !== "ok" || !data.articles) {
      console.error("NewsAPI returned an error:", data);
      return res
        .status(500)
        .json({ error: "Failed to fetch news articles", details: data });
    }

    // Save the response data to a JSON file
    saveApiResponseToFile(data);
    // Map and save articles to the database
    const articlesToInsert = data.articles.map((article) => ({
      sourceName: article.source?.name || "Unknown Source",
      sourceId: article.source?.id || null,
      author: article.author || "Unknown Author",
      title: article.title,
      description: article.description || null,
      url: article.url,
      urlToImage: article.urlToImage || null,
      publishedDate: article.publishedAt || null,
      content: article.content || null,
      apiSource: newsApiRecord.id, // Link to NewsApi
      keywordSearch: keyword,
    }));

    // Insert into database
    await Article.bulkCreate(articlesToInsert);

    res.status(201).json({
      message: "News articles fetched and saved successfully!",
      insertedArticles: articlesToInsert,
    });
  } catch (error) {
    console.error("Error in /call-news-api-api:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/report", async (req, res) => {
  try {
    // Ensure reports directory exists
    const reportsDir = path.join(process.env.PATH_PROJECT_RESOURCES, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate timestamp for file name
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:]/g, "")
      .split(".")[0]
      .replace(/(\d{8})(\d{6})/, "$1-$2");

    const filePath = path.join(reportsDir, `articlesReport-${timestamp}.csv`);

    // Query all articles
    const articles = await Article.findAll();

    if (articles.length === 0) {
      return res.status(404).json({ error: "No articles found." });
    }

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "id", title: "ID" },
        { id: "sourceName", title: "Source Name" },
        { id: "title", title: "Title" },
        { id: "author", title: "Author" },
        { id: "description", title: "Description" },
        { id: "url", title: "URL" },
        { id: "keywordSearch", title: "Keyword Search" }, // Assuming keywordSearch is stored somewhere
      ],
    });

    // Transform articles data for CSV
    const records = articles.map((article) => ({
      id: article.id,
      sourceName: article.sourceName,
      title: article.title,
      author: article.author || "Unknown",
      description: article.description || "",
      url: article.url,
      keywordSearch: article.keywordSearch, // Replace this with the actual keyword if stored
    }));

    // Write to CSV file
    await csvWriter.writeRecords(records);

    console.log(`Report saved to: ${filePath}`);

    res.status(200).json({
      message: "Report generated successfully!",
      reportPath: filePath,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/report", async (req, res) => {
//   console.log("in report");

//   const articles = await Article.findAll();

//   res.json({ articles });
// });

/* test adding to API and Articles tables */
router.get("/add-news-api", async (req, res) => {
  console.log("in news-searches/test");
  const api = await NewsApi.create({
    apiName: "NewsAPI",
    urlBase: "https://newsapi.org/v2/",
    apiKey: process.env.API_KEY_NEWS_API,
  });

  res.json({ result: true, api });
});

module.exports = router;
