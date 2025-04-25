import { install, Browser, BrowserPlatform } from '@puppeteer/browsers';
import { promises as fs } from 'fs';
import { copy, remove } from 'fs-extra';
import path from 'path';
import os from 'os';

async function prepareChromium() {
  console.log('🔍 Detecting platform...');

  const platform = os.platform();
  const arch = os.arch();
  let browserPlatform: BrowserPlatform;

  if (platform === 'darwin' && arch === 'arm64') {
    browserPlatform = BrowserPlatform.MAC_ARM;
  } else if (platform === 'darwin' && arch === 'x64') {
    browserPlatform = BrowserPlatform.MAC;
  } else if (platform === 'win32') {
    browserPlatform = BrowserPlatform.WIN64;
  } else if (platform === 'linux') {
    browserPlatform = BrowserPlatform.LINUX;
  } else {
    throw new Error(`❌ Unsupported platform: ${platform} ${arch}`);
  }

  console.log(`✅ Platform detected: ${browserPlatform}`);

  // --- Download Chrome Headless Shell ---
  console.log('⏬ Downloading Chrome Headless Shell...');

  const installedBrowser = await install({
    cacheDir: path.join(__dirname, '..', '.chromium-cache'),
    browser: Browser.CHROMEHEADLESSSHELL,
    buildId: '135.0.7049.114',
    platform: browserPlatform,
  });

  const downloadedPath = path.dirname(installedBrowser.executablePath);
  console.log(`✅ Chrome downloaded to: ${downloadedPath}`);

  // --- Copy downloaded Chrome into /chrome-headless-shell ---
  const destFolder = path.join(__dirname, '..', 'chrome-headless-shell');
  console.log('📂 Copying Chrome Headless Shell...');

  await fs.mkdir(destFolder, { recursive: true });
  await copy(downloadedPath, destFolder);

  console.log(`✅ Chrome copied to: ${destFolder}`);

  // --- Clean download cache ---
  const cachePath = path.join(__dirname, '..', '.chromium-cache');
  console.log('🧹 Cleaning download cache...');
  await remove(cachePath);

  console.log('✅ Clean finished.');
}

prepareChromium().catch((err) => {
  console.error('❌ Error during prepare-chromium:', err);
  process.exit(1);
});
