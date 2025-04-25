// utils/getChromiumExecutablePath.ts
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { log } from './logger';

export function getChromiumExecutablePath(): string | null {
  if (!app.isPackaged) {
    log('🔧 Dev mode: using default browser (Remotion will download)');
    return null;
  }
  
  const chromiumPath = path.join(
    process.resourcesPath,
    'chrome-headless-shell',
    'chrome-headless-shell'
  );

  log('🧠 Chromium path resolved to:', chromiumPath);
  if (!fs.existsSync(chromiumPath)) {
    log('❌ Chromium NOT FOUND at resolved path');
  } else {
    log('✅ Chromium found');
  }

  return chromiumPath;
}
