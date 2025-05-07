const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
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

    // Navigate to the Twitch streamer's about page (hardcoded URL)
    const url = "https://www.twitch.tv/hjune/about"; // Change this to the desired Twitch URL
    console.log("Navigating to Twitch streamer's about page");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    // Extract YouTube link or Gmail address
    console.log("Extracting social media links and emails");

    // Extract social media links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.href)
        .filter(
          (link) => link.includes("youtube.com") || link.includes("gmail.com") // Add other social media as needed
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
    const logStatement = `Extracted Links/Emails: ${result.join(", ")}`;
    console.log(logStatement);

    await browser.close();

    // Send the extracted links and emails in the response
    res.send(logStatement);
  } catch (error) {
    console.error("Error occurred during scraping:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .send({ error: "Scraping failed", details: error.message });
    }
  }
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
