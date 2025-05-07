const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  try {
    console.log("Starting scrapeLogic...");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log(
      "PUPPETEER_EXECUTABLE_PATH:",
      process.env.PUPPETEER_EXECUTABLE_PATH
    );

    // Launch the browser and open a new blank page
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      headless: true, // Explicitly set headless mode
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
        "--disable-gpu",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      slowMo: 100, // Add delay between actions to make things less likely to break in an unfamiliar environment
    });
    console.log("Browser launched");

    const page = await browser.newPage();
    console.log("New page opened");

    // Navigate to the Twitch streamer's about page (hardcoded URL)
    const url = "https://www.twitch.tv/hjune/about"; // Change this to the desired Twitch URL
    console.log(`Navigating to ${url}...`);

    try {
      // Add timeout for debugging
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 60000,
        visible: true,
      }); // 60 seconds timeout
      console.log("Page loaded successfully");
    } catch (err) {
      console.error("Error during page.goto:", err);
      throw new Error("Page navigation failed");
    }

    // Extract YouTube link or Gmail address
    console.log("Extracting social media links and emails...");

    // Extract social media links
    const links = await page.evaluate(() => {
      console.log("Extracting links...");
      return Array.from(document.querySelectorAll("a[href]"))
        .map((a) => a.href)
        .filter(
          (link) => link.includes("youtube.com") || link.includes("gmail.com") // Add other social media as needed
        );
    });
    console.log("Links extracted:", links);

    // Extract emails from page text (regex for email matching)
    const emailsFromText = await page.evaluate(() => {
      console.log("Extracting emails...");
      const text = document.body.innerText;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const foundEmails = text.match(emailRegex) || [];
      console.log("Emails extracted:", foundEmails);
      return foundEmails;
    });

    // Merge the links and emails, removing duplicates
    const result = [...new Set([...links, ...emailsFromText])];
    console.log("Merged result:", result);

    const logStatement = `Extracted Links/Emails: ${result.join(", ")}`;
    console.log("Final result:", logStatement);

    await browser.close();
    console.log("Browser closed");

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
