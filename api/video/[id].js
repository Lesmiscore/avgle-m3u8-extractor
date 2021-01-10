const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const { id } = req.params;
  const { puppeteer } = chromium;
  const browser = await puppeteer.launch({
    args: [...chromium.args, "--autoplay-policy=no-user-gesture-required"],
    executablePath: await chromium.executablePath,
    env: process.env,
  });
  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url() == "https://avgle.com/templates/frontend/videojs-contrib-hls.js") {
        request.continue({
          url: "PLAHEHOLDER",
        });
      } else if (request.url().endsWith("?adblock_detected")) {
        // easy adblocking
        request.abort();
      } else if (request.url().includes("jads.co")) {
        // easy adblocking
        request.abort();
      } else {
        request.continue();
      }
    });
    await page.goto(`https://avgle.com/video/${id}/`);
    res.send(`Hello ${id}!`);
  } finally {
    await page.close();
  }
};
