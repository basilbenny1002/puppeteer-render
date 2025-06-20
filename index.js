const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { url, timeout } = req.body;
  console.log(`Received scrape request for: ${url}, timeout: ${timeout}`);
  await scrapeLogic(res, url, timeout);
});

app.get("/", (req, res) => {
  res.send("Puppeteer server is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
