const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('Page error:', err.toString());
  });

  page.on('error', err => {
    console.error('Error:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });

  try {
    console.log("Navigating to https://casaraihancoorg.com/rooms...");
    await page.goto('https://casaraihancoorg.com/rooms', { waitUntil: 'networkidle0' });
    console.log("Done. Checking if the page is blank...");
    const content = await page.content();
    if (!content.includes('OUR ROOMS')) {
      console.log("Page is indeed blank or missing OUR ROOMS text.");
    }
  } catch (err) {
    console.error("Navigation failed:", err);
  } finally {
    await browser.close();
  }
})();
