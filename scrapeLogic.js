const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
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

  // Navigate the page to a URL
  console.log("Navigating to URL");
  await page.goto("https://developer.chrome.com/");

  // Set screen size
  console.log("Setting screen size");
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  console.log("Typing into search box");
  await page.type(".devsite-search-field", "automate beyond recorder");

  // Wait and click on first result

  console.log("Waiting and clicking on first result");
  const searchResultSelector = ".devsite-result-item-link";
  console.log("Waiting for selector");
  await page.waitForSelector(searchResultSelector, { visible: true });
  console.log("Selector found");
  const element = await page.$(searchResultSelector);
  console.log("Element found");
  await page.evaluate((el) => el.click(), element);
  console.log("Element clicked");
  // Locate the full title with a unique string
  console.log("Locating full title");
  const textSelector = await page.waitForSelector(
    "text/Customize and automate"
  );

  // Print the full title
  const fullTitle = await textSelector.evaluate((el) => el.textContent);

  // Print the full title
  const logStatement = `The title of this blog post is ${fullTitle}`;
  console.log(logStatement);
  res.send(logStatement);
  await browser.close();
};

module.exports = { scrapeLogic };

// const puppeteer = require("puppeteer");
// require("dotenv").config();

// const scrapeLogic = async (res) => {
//   const browser = await puppeteer.launch({
//     args: [
//       "--disable-setuid-sandbox",
//       "--no-sandbox",
//       "--single-process",
//       "--no-zygote",
//     ],
//     executablePath:
//       process.env.NODE_ENV === "production"
//         ? process.env.PUPPETEER_EXECUTABLE_PATH
//         : puppeteer.executablePath(),
//   });
// const page = await browser.newPage();

// await page.goto(url, { waitUntil: 'networkidle2' });

// // Extract social media links
// const links = await page.evaluate(() => {
//     return Array.from(document.querySelectorAll('a[href]'))
//         .map(a => a.href)
//         .filter(link =>
//             link.includes('twitter.com') ||
//             link.includes('instagram.com') ||
//             link.includes('youtube.com') ||
//             link.includes('tiktok.com') ||
//             link.includes('discord.gg') ||
//             link.includes('facebook.com') ||
//             link.includes('linkedin.com')
//         );
// });

// // Extract emails from page text
// const emailsFromText = await page.evaluate(() => {
//     const text = document.body.innerText;
//     const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
//     return text.match(emailRegex) || [];
// });

// // Extract emails from the entire HTML source
// const pageHTML = await page.content();
// const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// const emailsFromHTML = pageHTML.match(emailRegex) || [];

// // Merge and remove duplicates
// const emails = [...new Set([...emailsFromText, ...emailsFromHTML])];

// await browser.close();
// res.send({ links, emails });
// }

// const url = "https://www.twitch.tv/phoenixsclive/about";
// module.exports = { scrapeLogic };
