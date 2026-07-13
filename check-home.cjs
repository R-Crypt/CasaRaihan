const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('https://casaraihancoorg.com/', { waitUntil: 'networkidle0' });
  const content = await page.content();
  console.log("Found text 'CASA RAIHAN':", content.includes('CASA RAIHAN'));
  await browser.close();
})();
