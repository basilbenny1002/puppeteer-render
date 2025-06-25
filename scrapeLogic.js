// const puppeteer = require("puppeteer");
require("dotenv").config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

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
  // const cached = cache[targetUrl];
  // const now = Date.now();
  // if (cached && now - cached.timestamp < CACHE_EXPIRY_MS) {
  //   console.log(`Cache hit for ${targetUrl}`);
  //   return res.send({ html: cached.html, cached: true });
  // }

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

const scrapeTwitchAbout = async (res, twitch_link) => {
   try {
    console.log(process.env.NODE_ENV);
    console.log(process.env.PUPPETEER_EXECUTABLE_PATH);

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
  
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
    console.log("Browser opened");
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
      });
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: () => ({ timeZone: 'Asia/Kolkata' }),
      });
    });

    // Block unnecessary resources to speed things up
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();

      // Block only known ad/tracking domains
      if (
        url.includes("twitchads") ||
        url.includes("doubleclick") ||
        url.includes("googletagmanager") ||
        url.includes("google-analytics") ||
        url.includes("amazon-adsystem")
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // await page.setUserAgent("Mozilla/5.0 ...");
    await page.setViewport({ width: 1366, height: 768 });

    // Navigate to the Twitch streamer's about page (hardcoded URL)
    const url = twitch_link; // Change this to the desired Twitch URL
    console.log("Navigating to Twitch streamer's about page");
    console.log(url);
    // Faster load with domcontentloaded
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
        await page.waitForFunction(
      () => {
        const panel = document.querySelector('[data-a-target="about-panel"]');
        return panel && panel.innerText.trim().length > 10; // adjust if needed
      },
      { timeout: 0 }
    );
    // Wait only for the About section to load
  //   await page.waitForFunction(() => {
  //     const panel = document.querySelector('[data-a-target="about-panel"]');
  //     if (!panel) return false;

  //     const count = panel.querySelectorAll('a').length;

  //     if (!window.__lastLinkCheck) {
  //       window.__lastLinkCheck = { count, time: Date.now() };
  //       return false;
  //     }

  //     if (window.__lastLinkCheck.count !== count) {
  //       window.__lastLinkCheck = { count, time: Date.now() };
  //       return false;
  //     }

  //   return Date.now() - window.__lastLinkCheck.time > 500; // no new links for 500ms
  // }, { timeout: 10000 });


    // Extract and log the innerHTML of the about section
    const aboutHTML = await page.$eval(
      '[data-a-target="about-panel"]',
      (el) => el.innerHTML
    );
    console.log("About Panel HTML:\n", aboutHTML);
    const hrefs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
                  .map(a => a.href)
                  .filter(href => href && href.trim() !== '');
    });

console.log(hrefs);

    // Extract YouTube link or Gmail address
    console.log("Extracting social media links and emails");

    // Extract social media links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.href)
        .filter(
          (link) => link.includes("youtube.com") || link.includes("instagram.com") || link.includes("x.com") || link.includes("twitter.com") || link.includes("facebook.com") || link.includes("linkedin.com")  // Add other social media as needed
        );
    });

    // Extract emails from page text (regex for email matching)
    const emailsFromText = await page.evaluate(() => {
      const text = document.body.innerText;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      return text.match(emailRegex) || [];
    });

    // Merge the links and emails, removing duplicates
    const result = [...new Set([...links, ...emailsFromText])];

    // Logging and sending the extracted links/emails
    // const logStatement = `Extracted Links/Emails: ${result.join(", ")}`;
    // console.log(logStatement);

    // await browser.close();

    // // Send the extracted links and emails in the response
    // res.send(logStatement);
    await browser.close();

  // Separate links and emails
  const socialLinks = result.filter(link => link.includes("http"));
  const emailAddresses = result.filter(item => item.includes("@") && !item.includes("http"));

  // Send structured JSON response
  res.status(200).json({
    status: "success",
    links: socialLinks,
    emails: emailAddresses
  });

  } catch (error) {
    console.error("Error occurred during scraping:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .send({ error: "Scraping failed", details: error.message });
    }
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
