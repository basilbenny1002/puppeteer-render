const puppeteer = require("puppeteer");
require("dotenv").config();

const cache = {}; // Simple in-memory cache
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const scrapeLogic = async (res, targetUrl, customTimeout) => {
  const timeout = Number(customTimeout) || 10000;

  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).send({ error: "Invalid or missing URL" });
  }

  // Check cache first
  const cached = cache[targetUrl];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_EXPIRY_MS) {
    console.log(`Cache hit for ${targetUrl}`);
    return res.send({ html: cached.html, cached: true });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const blocked = [
        "twitchads", "doubleclick", "googletagmanager", "google-analytics", "amazon-adsystem"
      ];
      const shouldBlock = blocked.some((domain) => req.url().includes(domain));
      shouldBlock ? req.abort() : req.continue();
    });

    await page.setUserAgent("Mozilla/5.0 ...");
    await page.setViewport({ width: 1366, height: 768 });

    console.log(`Navigating to ${targetUrl}`);
    try {
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: timeout,
      });
    } catch (err) {
      console.warn("Navigation failed or timed out:", err.message);
      return res.status(408).send({ error: "Navigation timeout or failure", details: err.message });
    }

    console.log(`Waiting ${timeout}ms before capturing HTML...`);
    await new Promise((resolve) => setTimeout(resolve, timeout));

    const html = await page.content();
    await browser.close();

    // Save to cache
    cache[targetUrl] = {
      html,
      timestamp: Date.now(),
    };

    return res.send({ html, cached: false });
  } catch (error) {
    console.error("Scraping error:", error);
    if (!res.headersSent) {
      res.status(500).send({ error: "Internal scraping error", details: error.message });
    }
    if (browser) await browser.close();
  }
};

module.exports = { scrapeLogic };


setInterval(() => {
  const now = Date.now();
  for (const url in cache) {
    if (now - cache[url].timestamp > CACHE_EXPIRY_MS) {
      console.log(`Evicting cache for: ${url}`);
      delete cache[url];
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes
