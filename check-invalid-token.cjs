const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('Page error:', err.toString());
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });

  // Go to the domain first so we can set localStorage
  await page.goto('https://casaraihancoorg.com/robots.txt', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    localStorage.setItem('sb-iiykoruwgdjdltwnvacr-auth-token', JSON.stringify({
      access_token: "invalid_token",
      expires_at: Math.floor(Date.now() / 1000) - 3600,
      expires_in: 3600,
      refresh_token: "invalid_refresh",
      token_type: "bearer",
      user: { id: "123", role: "authenticated" }
    }));
  });

  await page.goto('https://casaraihancoorg.com/rooms', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  if (content.includes('OUR ROOMS')) {
    console.log("Page rendered successfully even with invalid token.");
  } else {
    console.log("Page is BLANK!");
  }
  
  await browser.close();
})();
