var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");

const {
  Article,
  Keyword,
  NewsArticleAggregatorSource,
  NewsApiRequest,
} = require("newsshareddb");
const {
  saveApiResponseToFile,
  checkForDupUrlAuthorTitle,
} = require("../modules/utilitiesApiCalls");
const { createObjectCsvWriter } = require("csv-writer");

// POST news-searches/request-gnews
router.post("/request-gnews", async (req, res) => {
  try {
    const { startDate, endDate, keywordId, max } = req.body;

    if (!startDate || !endDate || !keywordId || !max) {
      return res.status(400).json({
        result: false,
        message:
          "Missing required fields: startDate, endDate, keywordId, or max",
      });
    }

    // 1. Get the keyword from DB
    const keywordObj = await Keyword.findByPk(keywordId);
    if (!keywordObj) {
      return res
        .status(404)
        .json({ result: false, message: "Keyword not found" });
    }
    // 2. Get the GNews API base url from the NewsArticleAggregatorSource table
    const newsApiRecord = await NewsArticleAggregatorSource.findByPk(2); // GNews is id = 2
    if (!newsApiRecord) {
      return res
        .status(404)
        .json({ result: false, message: "GNews API not found" });
    }

    const keyword = keywordObj.keyword;
    const token = newsApiRecord.apiKey;

    // 2. Construct the GNews API URL
    // const urlGnews = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    const urlGnews = `${newsApiRecord.urlBase}search?q=${encodeURIComponent(
      keyword
    )}&from=${startDate}&to=${endDate}&max=${max}&lang=en&token=${token}`;

    const response = await fetch(urlGnews);
    const data = await response.json();

    // 3. Save raw API response to file
    await saveApiResponseToFile("gnews", data);

    if (!data.articles || !Array.isArray(data.articles)) {
      return res
        .status(500)
        .json({ result: false, message: "Invalid response from GNews" });
    }
    const filteredArticles = await checkForDupUrlAuthorTitle(data.articles);
    // 4. Save each article to the Article table
    let articleCount = 0;
    for (const item of filteredArticles) {
      try {
        await Article.create({
          sourceName: item.source?.name || null,
          sourceId: item.source?.url || null,
          author: null, // Not provided by GNews
          title: item.title,
          description: item.description,
          url: item.url,
          urlToImage: item.image,
          publishedDate: item.publishedAt,
          content: item.content,
          apiSource: 2, // GNews = id 2
          keywordSearch: keyword,
        });
        articleCount++;
      } catch (err) {
        console.warn("Skipping article due to DB error:", err.message);
      }
    }

    // 5. Add a tracking row in NewsApiRequest (former NewsApiKeywordContract)
    await NewsApiRequest.create({
      keywordId,
      newsApiId: 2, // GNews
      requestDate: new Date().toISOString().slice(0, 10), // today
      requestCount: articleCount,
      startDateOfRequest: startDate,
      endDateOfRequest: endDate,
    });

    res.json({
      result: true,
      message: `Imported ${articleCount} articles from GNews.`,
    });
  } catch (error) {
    console.error("Error in /request-gnews:", error);
    res.status(500).json({
      result: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// POST news-searches/request-news-api
router.post("/request-news-api", async (req, res) => {
  try {
    const { startDate, endDate, keywordId, max } = req.body;

    if (!startDate || !endDate || !keywordId || !max) {
      return res.status(400).json({
        result: false,
        message:
          "Missing required fields: startDate, endDate, keywordId, or max",
      });
    }

    // 1. Get the keyword from DB
    const keywordObj = await Keyword.findByPk(keywordId);
    if (!keywordObj) {
      return res
        .status(404)
        .json({ result: false, message: "Keyword not found" });
    }

    // 2. Get the NewsAPI config from the NewsArticleAggregatorSource table (id = 1)
    const newsApiRecord = await NewsArticleAggregatorSource.findByPk(1);
    if (!newsApiRecord) {
      return res
        .status(404)
        .json({ result: false, message: "NewsAPI config not found" });
    }

    const keyword = keywordObj.keyword;
    const token = newsApiRecord.apiKey;

    // 3. Construct the NewsAPI URL
    const urlNewsArticleAggregatorSource = `${
      newsApiRecord.urlBase
    }everything?q=${encodeURIComponent(
      keyword
    )}&from=${startDate}&to=${endDate}&pageSize=${max}&language=en&apiKey=${token}`;

    const response = await fetch(urlNewsArticleAggregatorSource);
    const data = await response.json();

    // 4. Save raw API response to file
    await saveApiResponseToFile("newsapi", data);

    if (!data.articles || !Array.isArray(data.articles)) {
      return res.status(500).json({
        result: false,
        message: "Invalid response from NewsAPI",
        details: data,
      });
    }

    // 5. Filter out existing articles
    const filteredArticles = await checkForDupUrlAuthorTitle(data.articles);

    // 6. Save each new article to the DB
    let articleCount = 0;
    for (const item of filteredArticles) {
      try {
        await Article.create({
          sourceName: item.source?.name || "Unknown Source",
          sourceId: item.source?.id || null,
          author: item.author || "Unknown Author",
          title: item.title,
          description: item.description || null,
          url: item.url,
          urlToImage: item.urlToImage || null,
          publishedDate: item.publishedAt || null,
          content: item.content || null,
          apiSource: newsApiRecord.id,
          keywordSearch: keyword,
        });
        articleCount++;
      } catch (err) {
        console.warn("Skipping article due to DB error:", err.message);
      }
    }

    // 7. Add tracking to NewsApiRequest (former: NewsApiKeywordContract)
    await NewsApiRequest.create({
      keywordId,
      newsApiId: newsApiRecord.id,
      requestDate: new Date().toISOString().slice(0, 10),
      requestCount: articleCount,
      startDateOfRequest: startDate,
      endDateOfRequest: endDate,
    });

    res.status(201).json({
      result: true,
      message: `Imported ${articleCount} articles from NewsAPI.`,
    });
  } catch (error) {
    console.error("Error in /call-news-api-api:", error);
    res.status(500).json({
      result: false,
      message: "Internal server error",
      error: error.message,
    });
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

// POST /news-searches/add-news-aggregator-source
router.post("/add-news-aggregator-source", async (req, res) => {
  console.log("in POST /news-searches/add-news-aggregator-source");
  const { nameOfOrg, url, apiKey, state, isApi, isRss } = req.body;
  const newApi = await NewsArticleAggregatorSource.create({
    nameOfOrg,
    url,
    apiKey,
    state,
    isApi: isApi === "true",
    isRss: isRss === "true",
  });
  res.json({ result: true, newApi });
});

// /* test adding to API and Articles tables */
// router.get("/add-news-api", async (req, res) => {
//   console.log("in news-searches/test");
//   const api = await NewsArticleAggregatorSource.create({
//     apiName: "GNews",
//     urlBase: "https://gnews.io/api/v1/",
//     apiKey: process.env.API_KEY_GNEWS,
//   });

//   res.json({ result: true, api });
// });

module.exports = router;
