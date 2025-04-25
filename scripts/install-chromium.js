const { BrowserFetcher } = require('puppeteer-core/lib/cjs/puppeteer/node/BrowserFetcher');
const path = require('path');

(async () => {
  const platform = process.arch === 'arm64' ? 'mac-arm64' : 'mac-x64';
  const cacheDir = path.join(__dirname, '../.chromium-cache');

  const fetcher = new BrowserFetcher(cacheDir, { platform });

  const revision = '1212215'; // Compatible avec Remotion v4

  try {
    const info = await fetcher.download(revision);
    console.log('✅ Chromium téléchargé :', info.executablePath);
  } catch (err) {
    console.error('❌ Erreur lors du téléchargement :', err);
    process.exit(1);
  }
})();
