const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const mkdirAsync = promisify(fs.mkdir);
const Article = require("../models/article");

const saveApiResponseToFile = async (apiSourceDir, data) => {
  try {
    // Ensure PATH_PROJECT_RESOURCES is set
    const resourcesPath = path.join(
      process.env.PATH_PROJECT_RESOURCES,
      "api_requests_to_news_orgs",
      apiSourceDir
    );
    await mkdirAsync(resourcesPath, { recursive: true });
    if (!resourcesPath) {
      console.error("Error: PATH_PROJECT_RESOURCES is not set.");
      return;
    }

    // Generate timestamp in YYYYMMDD-HHMMSS format
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:]/g, "")
      .split(".")[0]
      .replace(/(\d{8})(\d{6})/, "$1-$2");

    // Define full file path
    const filePath = path.join(resourcesPath, `${timestamp}.json`);

    // Convert data to JSON and write to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    console.log(`API response saved to ${filePath}`);
  } catch (error) {
    console.error("Error saving API response to file:", error);
  }
};

async function checkForDupUrlAuthorTitle(articlesArray) {
  console.log("Checking for duplicate articles...");
  let dupCount = 0;
  const filteredArticles = [];

  for (const article of articlesArray) {
    const exists = await Article.findOne({
      where: {
        url: article.url,
        author: article.author || null,
        title: article.title,
      },
    });

    if (!exists) {
      filteredArticles.push(article);
    } else {
      dupCount++;
    }
  }

  console.log(`Filtered out ${dupCount} duplicate articles.`);
  return filteredArticles;
}

module.exports = { saveApiResponseToFile, checkForDupUrlAuthorTitle };
