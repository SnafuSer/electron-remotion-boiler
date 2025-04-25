import { install, Browser, BrowserPlatform } from '@puppeteer/browsers';
import { promises as fs } from 'fs';
import { copy, remove } from 'fs-extra';
import path from 'path';
import os from 'os';

async function main() {
  console.log('🔍 Détection de la plateforme...');

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
    throw new Error(`❌ Plateforme non supportée: ${platform} ${arch}`);
  }

  console.log(`✅ Plateforme détectée : ${browserPlatform}`);

  // 📥 Téléchargement de Chrome Headless Shell
  console.log('⏬ Téléchargement de Chrome Headless Shell...');

  const installedBrowser = await install({
    cacheDir: path.join(__dirname, '..', '.chromium-cache'),
    browser: Browser.CHROMEHEADLESSSHELL,
    buildId: '135.0.7049.114',
    platform: browserPlatform,
  });

  const downloadedPath = path.dirname(installedBrowser.executablePath);
  console.log(`✅ Chrome téléchargé à : ${downloadedPath}`);

  // 📦 Copie complète du dossier téléchargé
  const destFolder = path.join(__dirname, '..', 'chrome-headless-shell');
  console.log('📂 Copie de Chrome Headless Shell...');

  await fs.mkdir(destFolder, { recursive: true });
  await copy(downloadedPath, destFolder);

  console.log(`✅ Chrome copié dans : ${destFolder}`);

  // 🧹 Nettoyage du cache temporaire
  const cachePath = path.join(__dirname, '..', '.chromium-cache');
  console.log('🧹 Nettoyage du cache de téléchargement...');
  await remove(cachePath);

  console.log('✅ Clean terminé.');
}

main().catch((err) => {
  console.error('❌ Erreur durant prepare-chromium:', err);
  process.exit(1);
});
