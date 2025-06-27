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

    await page.evaluate(() => {
  const localStorageData = {
    "video_ads.stream_loudness": `{"loudness":-10.98,"timestamp":1751043681861}`,
    celebrationsEnabled: `true`,
    local_storage_device_id: `"b52e9dda01d0b4d4"`,
    lastAdDisplay: `1751043044638`,
    "tacos-properties": `{"lastCalledTime":1751043114705,"itemsToShow":[],"isNewUser":true}`,
    "CV7o9fRC/gx24wn2":
      "{tG\u000eJ\u0015\",]\u0013VFC\u001e\u001aQ\tYC'tO>fR\n\u0010R'3S,U\u000f7-[3\u0017YQ\u0019L\bCGp!#\u00112\u0002\u0007&G\u0004\u0016`E\u0017m!\u001fr]\u001d-\nZ5!\u00067\u0005Q\u001ca \u001cp\t\u001dS5bv\u001dT\u001e\u0006\u0004z-\u001eu\u0002  {\u0017BO07B\u0011\u001cs]0X0\u0015C5\n\u000b \u000ek\u001e\u0013s\u0004\u0014\u0018y\b&\u0005\u0019\u0005;s1FU\u0014\\:e\u0006\u0000T-f$d\u00154{q\u0015)V\u0012;V#oM\r\u0006\u000671Hp\u0003U\u001cNV\u00055}WL\u000b\u0004  G\u001b\u0018Si9B\u0002\u001eB\f\u0017p\u0019bo\u000bi\u00017\nwQ\tue4\u0000J\u0015\u001an\t\u0007WifE\u0001\u001aS73E\u001dV\u000137F\b\u0016f]\u001a\u000b]\u0014\u0003s$$\u00141-X\nQ\u0007ag\u001a-\n$\u001a\u0012\u001e6Z\u001e\u0016\u0001\u000f^\b\u0013b?\"\u001c)f\rUD\brg\u0005_\u0001Pk{\u001eST\u0010W\u0005\u0017B\u0015\u0018t97\u0019)!Y\u0003\u0016x-7U\u0003\\\u0002py[\u0015\rW\u0018U\u001bA\u0004\u0005v63\u001b1f\rF>R9?[\u0003XIgm\u001fGPe]\u0019\n]\u0016\u0004\u0017\u001f\u0002Utt\u0019TH\u001d\u0014?YY\r]r;\u0019SQ\u0012u\u0007\u001e^\u0004 R3\u001d\u001c1k\u0002WD\u0013p`\u0017Gr.\u0006\u000ecKX^]\u001c\u000b\u0012&\u0012T:9\\e\u0007_\u0016\u001cP&y\u0006\\\u000eHbm\u001fIH\u0012g\u0016\bS\u0013\u001e\u0018deBkw\u0001F_\u001f03E\u0019\\\u0014\u0006*B\u0002Z\b\u0005@[\u0003QC\u0005fnDrq\u0001HQ^/?R\u0001M2;.JEB\u0003\u0003B_\u0002UE\u0000igLpuJHQZ2:\u0019\u001bN\u000f& GI\fD\u0016M\u0015\u0010\u0004\u0019T>2\u0010!\u0007[\r\u0016S7\u0002X\u0004\\\bpy\rW6|\f4<^\u0005\u0006Z(7M\n\u0016bUFW;gr=\u0017\u0011\u0005hWJ|~'8\u000b)-Ed$E\u001f\u001ey-\u001b_\u00115\u000e\ru\t<p|+:cR?Z}$\u0005G8\u00142+'G.\u0014Y7\u001fv \t<gpg\u0004\u0013\u0007G.\u0000\u0000) G\u0014\u001f\u0018\u000f6S3BR!,\u000f\u0002\r\r9\u001bF\u001e\u001dWQ\r8\u0005RA\u000e3\u0002&(\u000eR\u0003\u0007D\u0002\u001a` @-'\u000e_\u0013/h\u0005\u0002&\u000bY\u001bR\u0015b-5\u0014d)&rsaD\u0015]\u0003\u001b.\u0016 /h`UB\u0010\u0013\u0012^?\"\u001076X\u0003\u0012I*9Y;P\u000b7,Z\u0013<GF\u0016\u001a[\u000e\u0019\u0015ktDh\u0006\u0004\bFy-\u001b\u0015C\u001b\u00103/F\u0003-\\@\u001e\u0002\u0010[F\u0000dgDwt\u000fSB\u0004zg\u001bMZ\u0014+3[\b;ZU\u001b\u0002W\u000f\u0010R\u00148\u0014'(R\u0000Q\u00077$B\n\u0015D'0J\u00159UQ\u0019\u001a\u0010[Uz>,\u001c)(VKF\u0013sv\u001f8P\b6,X\u0014X|`W_\u0002OG\fq\u0001\u001c+r\u0003_SEub\u001eOx\u0016\"/J0\u001dP\u001e\u001a\u001dTD\u0000eCel|,'p\u000fz\u0017\u0003P\r7ch\u0002\u001bY[^Nq\t\u0005X<3Ztw\u0000JC\u0013sx\u0007Oj\u00074\"]\u000eW\u0007\u0007@@\u0001WU\u001bs%\u001072R\u0016'T.3\u0015U\bQgr\u001fSJ\u0005\fCZ\u0001R[\u00152:\u001c *C0\u001aP&t\r^\u000eScs\u001bUO\n\u0000@^\u0003\u001c\n",
    ads_bitrate_bps: `{"value":3400873,"__expireTimeEpoch":1752252737605}`,
    "bits_power_ups_callout_dismissed.1326785290": `true`,
    chatSettings: `{"fadeSharedChats":false,"fontSizePreference":"default","lastUsedFollowerDurations":{},"lastUsedSlowModeDurations":{},"repliesAppearancePreference":"expanded","screenReaderAutoAnnounceEnabled":true,"showAutoModActions":true,"showAutoModBaselineActions":true,"showAutoModBlockedTermsActions":true,"showMessageFlags":true,"showModerationActions":true,"enableMessageEffects":true,"showModIcons":false,"showTimestamps":false,"viewerChatFilterSettings":{"A":true,"I":true,"P":false,"S":true},"zachModeStatus":"control","viewerChatFilterEnabled":false}`,
    "cosmic_abyss_callout_dismissed.1326785290": `true`,
    emoteAnimationsEnabled: `true`,
    lastPrerollAdDisplay: `{"channelId":"121111915","time":1751043044638}`,
    local_copy_unique_id: `"Wg7eCDAjuzAW0IDGTqRk6tt8I1QP3Awe"`,
    local_storage_app_session_id: `"340959393c677f26"`,
    "money-banners-extended-dismissal": `{}`,
    "money-banners-status": `{"value":{},"__expireTimeEpoch":1751129518007}`,
    searchSuggestionHistory: `{"id":"1326785290","suggestions":[]}`,
    sentry_device_id: `"cd6d03ba9b733bfa"`,
    shareResubNotificationIDs: `{}`,
    "turn-off-animated-emotes-callout-seen": `false`,
    "twilight.emote_picker_history": `{"9":{"emote":{"id":"9","token":"<3","type":"SMILIES"},"lastUpdatedAt":4,"uses":0},"25":{"emote":{"id":"25","token":"Kappa","type":"GLOBALS"},"lastUpdatedAt":9,"uses":0},"41":{"emote":{"id":"41","token":"Kreygasm","type":"GLOBALS"},"lastUpdatedAt":1,"uses":0},"245":{"emote":{"id":"245","token":"ResidentSleeper","type":"GLOBALS"},"lastUpdatedAt":2,"uses":0},"28087":{"emote":{"id":"28087","token":"WutFace","type":"GLOBALS"},"lastUpdatedAt":3,"uses":0},"30259":{"emote":{"id":"30259","token":"HeyGuys","type":"GLOBALS"},"lastUpdatedAt":10,"uses":0},"58765":{"emote":{"id":"58765","token":"NotLikeThis","type":"GLOBALS"},"lastUpdatedAt":5,"uses":0},"64138":{"emote":{"id":"64138","token":"SeemsGood","type":"GLOBALS"},"lastUpdatedAt":0,"uses":0},"81274":{"emote":{"id":"81274","token":"VoHiYo","type":"GLOBALS"},"lastUpdatedAt":6,"uses":0},"425618":{"emote":{"id":"425618","token":"LUL","type":"GLOBALS"},"lastUpdatedAt":8,"uses":0},"305954156":{"emote":{"id":"305954156","token":"PogChamp","type":"GLOBALS"},"lastUpdatedAt":7,"uses":0}}`,
    "twilight.sessionID": `"ea165a6d25332a90"`,
    useHighContrastColors: `true`,
    vodResumeTimes: `{"v2488042195":22}`,
    "__last-unload": `1751043110584`,
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
