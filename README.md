# 📰 News Searcher

#### 0.4.0

Express JS API that interfaces with database and can make requests to news sources apis but designed to communicate with micro services for api and rss requests and web scraping.

## How this works

1. add a news api route ex: POST /news-searches/add-news-api. This route has a preset news api record in the route it will add to the database
2. add keywords through a keyword route ex: POST /keywords/add-keywords-from-csv
3. call news api route ex: POST /news-searches/call-news-api-api. This route has a preset date range and page size, but you need to pass a keyword in the body.

## urls

### New API /everything route

- one example that worked:
  `https://newsapi.org/v2/everything?q=product+recall&from=2025-01-19&to=2025-01-29&pageSize=1&language=en&apiKey=API_KEY`

- alternatly using `AND` and `%20` for spaces: `https://newsapi.org/v2/everything?q=product%20AND%20recall&from=2025-01-19&to=2025-01-29&pageSize=1&language=en&apiKey=API_KEY`

## Folder Structure

```sh
.
├── README.md
├── app.js
├── bin
│   └── www
├── models
│   ├── _connection.js
│   ├── article.js
│   ├── keyword.js
│   └── newsApi.js
├── modules
│   ├── adminDb.js
│   ├── common.js
│   └── utilitiesApiCalls.js
├── node_modules
├── package.json
├── public
│   ├── index.html
│   └── stylesheets
├── routes
│   ├── adminDb.js
│   ├── adminDb_obe.js
│   ├── index.js
│   ├── keywords.js
│   ├── newsSearches.js
│   └── users.js
├── server.js
└── yarn.lock
```

## News Sources

### NewsAPI

- limit 100 per day
- https://newsapi.org
- up to a month old articles

### GNEWS

- limit 100 per day
- https://gnews.io
- 1 request per second
- there is an essential tier that offers Full article content and pagination (50€/month)

## Routes

### Admin DB

#### GET /admin-db/create-database-backup

- Creates a database backup zip file in the PATH_DB_BACKUPS directory

#### POST /admin-db/import-db-backup

- Imports a database backup zip file
- expected body: { backupFile: File }
- using Postman: Body type form-data

### News Search

#### POST /news-searches/request-gnews

- expected body: { startDate: string, endDate: string, keywordId: number, max: number }

- startDate and endDate should be in the format YYYY-MM-DD
