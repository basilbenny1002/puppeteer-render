const puppeteer = require("puppeteer");
require("dotenv").config();
const fs = require("fs").promises;

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
      headless: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    console.log("Browser opened");
    const cookies = [
  { name: "unique_id", value: "Wg7eCDAjuzAW0IDGTqRk6tt8I1QP3Awe", domain: ".twitch.tv" },
  { name: "twitch.lohp.countryCode", value: "IN", domain: ".twitch.tv" },
  { name: "referrer_url", value: "https://www.youtube.com/", domain: ".twitch.tv" },
  { name: "experiment_overrides", value: '{"experiments":{},"disabled":[]}', domain: ".twitch.tv" },
  { name: "login", value: "apple_juice_is_fine", domain: ".twitch.tv" },
  { name: "name", value: "apple_juice_is_fine", domain: ".twitch.tv" },
  { name: "last_login", value: "2025-06-27T16:51:49Z", domain: ".twitch.tv" },
  { name: "api_token", value: "9311df6c6d6af5b9904a15c78330f656", domain: ".twitch.tv" },
  { name: "twilight-user", value: '{"authToken":"0bnm6vsthetgctlnksj8hs2g2zxplt","displayName":"apple_juice_is_fine","id":"1326785290","login":"apple_juice_is_fine","roles":{"isStaff":false},"version":2}', domain: ".twitch.tv" },
  { name: "auth-token", value: "0bnm6vsthetgctlnksj8hs2g2zxplt", domain: ".twitch.tv" },
  { name: "server_session_id", value: "3d9dfee2eead45fdafc4114e5d1c3114", domain: ".twitch.tv" }
];
  browser.setCookie(cookies)


    const page = await browser.newPage();    
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

    await page.setUserAgent("Mozilla/5.0 ...");

    // Navigate to the Twitch streamer's about page (hardcoded URL)
    const url = "https://www.twitch.tv/mooda/about"; // Change this to the desired Twitch URL
    console.log("Navigating to Twitch streamer's about page");
    // Faster load with domcontentloaded
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });
    await page.evaluate(() => {
  const localStorageData = {
    "video_ads.stream_loudness": `{"loudness":-10.98,"timestamp":1751043681861}`,
    "celebrationsEnabled": `true`,
    "local_storage_device_id": `"b52e9dda01d0b4d4"`,
    "lastAdDisplay": `1751043044638`,
    "tacos-properties": `{"lastCalledTime":1751043114705,"itemsToShow":[],"isNewUser":true}`,
    "CV7o9fRC/gx24wn2": `{tG\u000eJ\u0015",]\u0013VFC\u001e\u001aQ\tYC'tO>fR\n\u0010R'3S,U\u000f7-[3\u0017YQ\u0019L\bCGp!#...`,  // shortened here just for display; you can paste the full value you have
    "ads_bitrate_bps": `{"value":3400873,"__expireTimeEpoch":1752252737605}`,
    "bits_power_ups_callout_dismissed.1326785290": `true`,
    "chatSettings": `{"fadeSharedChats":false,"fontSizePreference":"default","lastUsedFollowerDurations":{},"lastUsedSlowModeDurations":{},"repliesAppearancePreference":"expanded","screenReaderAutoAnnounceEnabled":true,"showAutoModActions":true,"showAutoModBaselineActions":true,"showAutoModBlockedTermsActions":true,"showMessageFlags":true,"showModerationActions":true,"enableMessageEffects":true,"showModIcons":false,"showTimestamps":false,"viewerChatFilterSettings":{"A":true,"I":true,"P":false,"S":true},"zachModeStatus":"control","viewerChatFilterEnabled":false}`,
    "cosmic_abyss_callout_dismissed.1326785290": `true`,
    "emoteAnimationsEnabled": `true`,
    "lastPrerollAdDisplay": `{"channelId":"121111915","time":1751043044638}`,
    "local_copy_unique_id": `"Wg7eCDAjuzAW0IDGTqRk6tt8I1QP3Awe"`,
    "local_storage_app_session_id": `"340959393c677f26"`,
    "money-banners-extended-dismissal": `{}`,
    "money-banners-status": `{"value":{},"__expireTimeEpoch":1751129518007}`,
    "searchSuggestionHistory": `{"id":"1326785290","suggestions":[]}`,
    "sentry_device_id": `"cd6d03ba9b733bfa"`,
    "shareResubNotificationIDs": `{}`,
    "turn-off-animated-emotes-callout-seen": `false`,
    "twilight.emote_picker_history": `{"9":{"emote":{"id":"9","token":"<3","type":"SMILIES"},"lastUpdatedAt":4,"uses":0},"25":{"emote":{"id":"25","token":"Kappa","type":"GLOBALS"},"lastUpdatedAt":9,"uses":0},"41":{"emote":{"id":"41","token":"Kreygasm","type":"GLOBALS"},"lastUpdatedAt":1,"uses":0},"245":{"emote":{"id":"245","token":"ResidentSleeper","type":"GLOBALS"},"lastUpdatedAt":2,"uses":0},"28087":{"emote":{"id":"28087","token":"WutFace","type":"GLOBALS"},"lastUpdatedAt":3,"uses":0},"30259":{"emote":{"id":"30259","token":"HeyGuys","type":"GLOBALS"},"lastUpdatedAt":10,"uses":0},"58765":{"emote":{"id":"58765","token":"NotLikeThis","type":"GLOBALS"},"lastUpdatedAt":5,"uses":0},"64138":{"emote":{"id":"64138","token":"SeemsGood","type":"GLOBALS"},"lastUpdatedAt":0,"uses":0},"81274":{"emote":{"id":"81274","token":"VoHiYo","type":"GLOBALS"},"lastUpdatedAt":6,"uses":0},"425618":{"emote":{"id":"425618","token":"LUL","type":"GLOBALS"},"lastUpdatedAt":8,"uses":0},"305954156":{"emote":{"id":"305954156","token":"PogChamp","type":"GLOBALS"},"lastUpdatedAt":7,"uses":0}}`,
    "twilight.sessionID": `"ea165a6d25332a90"`,
    "useHighContrastColors": `true`,
    "vodResumeTimes": `{"v2488042195":22}`,
    "__last-unload": `1751043110584`
    };

    for (const [key, value] of Object.entries(localStorageData)) {
      localStorage.setItem(key, value);
    }
  });
  await page.reload({ waitUntil: "domcontentloaded" });

    // // Wait only for the About section to load
    await page.waitForFunction(
      () => {
        const panel = document.querySelector('[data-a-target="about-panel"]');
        return panel && panel.innerText.trim().length > 10; // adjust if needed
      },
      { timeout: 0 }
    );

    // Extract and log the innerHTML of the about section
    const aboutHTML = await page.$eval(
      '[data-a-target="about-panel"]',
      (el) => el.innerHTML
    );

    // console.log("About Panel HTML:\n", aboutHTML);
    const content = await page.content();
    await fs.writeFile("page.html", content, "utf8");
    await fs.writeFile("about.html", aboutHTML, "utf8");

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
