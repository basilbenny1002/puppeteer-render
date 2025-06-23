const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  console.log(`Received scrape request for: ${url}`);
  await scrapeLogic(res, url);
});

app.get("/", (req, res) => {
  res.send("Puppeteer scraping server running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
