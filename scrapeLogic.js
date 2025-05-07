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

  // Navigate to the developer chrome page
  console.log("Navigating to URL");
  await page.goto("https://developer.chrome.com/", {
    waitUntil: "domcontentloaded",
  });

  // Wait for the specific h2 element to appear
  const elementId =
    "#a-powerful-web-span-stylecolor-000-display-blockmade-easierspan";
  await page.waitForSelector(elementId, { visible: true });

  // Extract the text content
  const text = await page.$eval(elementId, (el) => el.innerText.trim());

  const logStatement = "Extracted text: " + text;
  console.log(logStatement);

  await browser.close();

  // Send the extracted text in the response
  res.send(logStatement);
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
