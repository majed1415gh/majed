const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

let browserInstance = null;

async function getBrowserInstance() {
    if (!browserInstance) {
        console.log("🚀 Launching browser for the first time...");
        browserInstance = await puppeteer.launch({ headless: "new" });
        console.log("✅ Browser is ready and running in the background.");
    }
    return browserInstance;
}

module.exports = { getBrowserInstance };