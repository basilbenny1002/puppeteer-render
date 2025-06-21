const puppeteer = require("puppeteer");
require("dotenv").config();

const cache = {};
const CACHE_EXPIRY_MS = 10 * 60 * 1000;

const scrapeLogic = async (res, targetUrl) => {
  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).send({ error: "Invalid or missing URL" });
  }

  // Handle Instagram: return full HTML after 10s
  if (targetUrl.includes("instagram.com")) {
    return scrapeInstagram(res, targetUrl);
  }

  // Handle Twitch About panel scraping
  if (targetUrl.includes("twitch.tv")) {
    return scrapeTwitchAbout(res, targetUrl);
  }

  // Default logic with cache
  const cached = cache[targetUrl];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_EXPIRY_MS) {
    console.log(`Cache hit for ${targetUrl}`);
    return res.send({ html: cached.html, cached: true });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const blocked = ["twitchads", "doubleclick", "googletagmanager", "google-analytics", "amazon-adsystem"];
      const shouldBlock = blocked.some((domain) => req.url().includes(domain));
      shouldBlock ? req.abort() : req.continue();
    });

    await page.setUserAgent("Mozilla/5.0 ...");
    await page.setViewport({ width: 1366, height: 768 });

    console.log(`Navigating to ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const html = await page.content();
    await browser.close();

    cache[targetUrl] = { html, timestamp: Date.now() };
    return res.send({ html, cached: false });
  } catch (error) {
    console.error("Scraping error:", error);
    if (!res.headersSent) {
      res.status(500).send({ error: "Scraping failed", details: error.message });
    }
    if (browser) await browser.close();
  }
};

const scrapeTwitchAbout = async (res, url) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const blocked = ["twitchads", "doubleclick", "googletagmanager", "google-analytics", "amazon-adsystem"];
      blocked.some((d) => req.url().includes(d)) ? req.abort() : req.continue();
    });

    await page.setUserAgent("Mozilla/5.0 ...");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for the about panel
    await page.waitForSelector('[data-a-target="about-panel"]', { timeout: 30000 });

    const links = await page.evaluate(() => {
      const socialSites = ["youtube.com", "twitter.com", "instagram.com", "tiktok.com", "discord.gg", "facebook.com", "linkedin.com", "x.com"];
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      return anchors
        .map((a) => a.href)
        .filter((href) => socialSites.some((site) => href.includes(site)));
    });

    const emails = await page.evaluate(() => {
      const text = document.body.innerText;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      return text.match(emailRegex) || [];
    });

    await browser.close();
    return res.send({ extracted: [...new Set([...links, ...emails])] });
  } catch (err) {
    console.error("Twitch scraping error:", err);
    if (!res.headersSent) {
      res.status(500).send({ error: "Twitch scraping failed", details: err.message });
    }
    if (browser) await browser.close();
  }
};

const scrapeInstagram = async (res, url) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 ...");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await new Promise((r) => setTimeout(r, 10000));
    const html = await page.content();
    await browser.close();

    return res.send({ html });
  } catch (err) {
    console.error("Instagram scraping error:", err);
    if (!res.headersSent) {
      res.status(500).send({ error: "Instagram scraping failed", details: err.message });
    }
    if (browser) await browser.close();
  }
};

module.exports = { scrapeLogic };
