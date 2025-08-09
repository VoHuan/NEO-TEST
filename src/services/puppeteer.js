const puppeteer = require('puppeteer');
const config = require('../ultils/config');

async function captureThumbnail(url, screenshotPath) {
  const browser = await puppeteer.launch({
    args: config.puppeteerArgs,
    executablePath: config.puppeteerExecutablePath
  });
  const page = await browser.newPage();
  await page.goto(url, { 
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Hide YouTube player controls
  await page.addStyleTag({
    content: `
      .ytp-chrome-bottom { display: none !important; }
      .ytp-chrome-top { display: none !important; }
      .ytp-gradient-bottom { display: none !important; }
      .ytp-gradient-top { display: none !important; }
      .ytp-progress-bar-container { display: none !important; }
    `
  });

  // Wait and play video
  const played = await page.evaluate(() => {
    return new Promise(resolve => {
      const v = document.querySelector('video');
      if (!v) return resolve(false);
      
      function checkPlaying() {
        if (!v.paused && v.currentTime > 0) return resolve(true);
        setTimeout(() => resolve(false), 10000);
      }
      
      v.play().catch(()=>{});
      v.addEventListener('playing', ()=> resolve(true));
      setTimeout(checkPlaying, 5000);
    });
  });

  // Wait for video to play
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take screenshot
  const playerHandle = await page.$('video') || await page.$('#player');
  if (playerHandle) {
    await playerHandle.screenshot({ 
      path: screenshotPath,
      type: 'png' 
    });
  } else {
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: false,
      type: 'png'
    });
  }
  
  await browser.close();
  return played;
}

module.exports = { captureThumbnail };