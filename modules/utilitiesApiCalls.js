const fs = require("fs");
const path = require("path");

/**
 * Saves API response data to a JSON file in the project resources folder.
 * @param {Object} data - The API response data to be saved.
 */
const saveApiResponseToFile = (data) => {
  try {
    // Ensure PATH_PROJECT_RESOURCES is set
    const resourcesPath = process.env.PATH_PROJECT_RESOURCES;
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

module.exports = { saveApiResponseToFile };
