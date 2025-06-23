const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});


app.get("/scrape", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send("Missing 'url' query parameter");
  }

  console.log(`Received scrape request for: ${url}`);
  await scrapeLogic(res, url);
});
app.get("/", (req, res) => {
  console.log("Recieved base get request")
  res.send("Puppeteer scraping server running!");
});
