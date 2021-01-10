const chromium = require("chrome-aws-lambda");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async (req, res) => {
  const { id, take } = req.query;
  const { puppeteer } = chromium;
  const browser = await puppeteer.launch({
    args: [...chromium.args, "--autoplay-policy=no-user-gesture-required"],
    executablePath: (await chromium.executablePath) || process.env.CHROMIUM_PATH,
    env: process.env,
  });
  const page = await browser.newPage();
  try {
    await new Promise((resolve, reject) => {
      (async () => {
        page
          .on("console", (message) => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
          .on("pageerror", ({ message }) => console.log(message))
          .on("response", (response) => console.log(`${response.status()} ${response.url()}`))
          .on("requestfailed", (request) => console.log(`${request.failure().errorText} ${request.url()}`));
        await page.exposeFunction("reportResponseText", (response) => {
          res.setHeader("Content-Type", "application/x-mpegurl");
          res.send(response);
          resolve();
        });
        await page.setRequestInterception(true);
        page.on("request", (request) => {
          if (request.url() == "https://avgle.com/templates/frontend/videojs-contrib-hls.js") {
            console.log("replacing url 1");
            request.continue({
              // replace with patched code
              url: "https://avgle-m3u8-extractor.vercel.app/videojs-contrib-hls.js",
            });
          } else if (request.url().endsWith("?adblock_detected")) {
            // easy adblocking
            request.abort();
          } else if (request.url().includes("jads.co")) {
            // easy adblocking
            request.abort();
          } else if (request.url().includes("ads.")) {
            // easy adblocking
            request.abort();
          } else if (request.url().includes("recaptcha/api/siteverify")) {
            // you don't need to honor recaptcha
            console.log("responding with fake response");
            request.continue({
              // replace with fake response
              body: '{"success":true}',
            });
          } else if (request.url().includes("recaptcha")) {
            // you don't need to honor recaptcha
            console.log("replacing url 2");
            request.continue({
              // replace with fake code
              url: "https://avgle-m3u8-extractor.vercel.app/recaptcha.js",
            });
          } else {
            request.continue();
          }
        });
        try {
          await page.goto(`https://avgle.com/video/${id}/`, {
            timeout: 2000,
          });
        } catch (e) {}
        console.log("loaded");
        const [button] = await page.$x("//span[@id='player_3x2_close']");
        if (button) {
          await button.click();
        }
        console.log("clicked");
        await page.evaluate((_) => {
          /* eslint no-undef: 0 */
          closeAd({ screenX: 1, originalEvent: { isTrusted: true } });
        });
        console.log("ad closed");
        await wait(100);
        await page.evaluate((_) => {
          /* eslint no-undef: 0 */
          for (const p of Object.values(videojs.getPlayers())) {
            p.play();
          }
        });
        console.log("video played");
        if (take == "yes" || take == "take") {
          // send screenshot for debugging
          const img = await page.screenshot({ type: "png" });
          res.setHeader("Content-Type", "image/png");
          res.send(img);
        }
      })().catch(reject);
    });
  } finally {
    await page.close();
    await browser.close();
  }
};
