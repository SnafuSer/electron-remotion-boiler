// electron-main/main.ts

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import os from 'os';
import http from 'http';
import serveHandler from 'serve-handler';
import { ipcMain, app, BrowserWindow, shell } from 'electron';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { findAvailablePort } from './utils/findAvailablePort';
import { getChromiumExecutablePath } from './utils/getChromiumExecutablePath';
import { setupLogger, log, getLogFilePath } from './utils/logger';

// Initialize Remotion cache
const remotionCacheDir = path.join(os.tmpdir(), 'clipforge-remotion');
fs.mkdirSync(remotionCacheDir, { recursive: true });
process.env.REMOTION_CACHE_DIR = remotionCacheDir;
log('✅ REMOTION_CACHE_DIR initialized at:', remotionCacheDir);

// Open log file from renderer
setupLogger();

ipcMain.handle('open-log-file', async () => {
  const file = getLogFilePath();
  await shell.openPath(file);
});

// Create Electron window
let mainWindow: BrowserWindow | null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${__dirname}/preload.js`,
    },
  });

  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(app.getAppPath(), 'renderer', 'out', 'index.html')}`;

  log('🌐 Loading Electron window from:', url);
  mainWindow.loadURL(url);
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(createWindow);

// Optional: track the running Remotion server instance
let remotionServer: http.Server | null = null;

// Main video generation handler
ipcMain.handle('generate-video', async (_, inputProps) => {
  const startTime = Date.now();
  log('🎬 Video generation started with props:', JSON.stringify(inputProps));

  const projectRoot = app.getAppPath();
  const outputPath = path.join(app.getPath('videos'), 'clipforge-video.mp4');
  const bundlePath = path.join(projectRoot, 'remotion-video', 'build');

  if (!fs.existsSync(path.join(bundlePath, 'index.html'))) {
    log('❌ Remotion bundle missing:', bundlePath);
    throw new Error('Remotion bundle not found');
  }

  const port = await findAvailablePort(5050);
  const serveUrl = `http://127.0.0.1:${port}`;

  remotionServer = http.createServer((req, res) => serveHandler(req, res, { public: bundlePath }));
  await new Promise<void>((resolve) => remotionServer!.listen(port, resolve));
  log(`🚀 Remotion server started on ${serveUrl}`);

  const browserExecutable = getChromiumExecutablePath();
  log('🧠 Using browser executable:', browserExecutable);

  const binariesDirectory = app.isPackaged
    ? path.join(process.resourcesPath, 'node_remotion', 'compositor-darwin-arm64')
    : path.join(__dirname, '..', 'node_modules', '@remotion', 'compositor-darwin-arm64');

  log('📦 Using Remotion binaries from:', binariesDirectory);

  try {
    log('📥 Fetching compositions...');
    const compositions = await getCompositions(serveUrl, {
      inputProps,
      browserExecutable,
      binariesDirectory,
      logLevel: 'verbose',
      envVariables: {
        REMOTION_CACHE_DIR: process.env.REMOTION_CACHE_DIR ?? '',
        REMOTION_LOG_LEVEL: 'verbose',
      },
      chromiumOptions: {
        ignoreCertificateErrors: true,
        disableWebSecurity: true,
        headless: true,
      },
      timeoutInMilliseconds: 15000,
    });

    log('🎃 Compositions found:', compositions);
    const composition = compositions.find((c) => c.id === 'ClipForge');
    if (!composition) throw new Error('Composition "ClipForge" not found');

    log('✅ Composition "ClipForge" selected');

    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
      concurrency: 1,
      overwrite: true,
      browserExecutable,
      binariesDirectory,
      logLevel: 'verbose',
      envVariables: {
        REMOTION_CACHE_DIR: process.env.REMOTION_CACHE_DIR ?? '',
        REMOTION_LOG_LEVEL: 'verbose',
      },
      chromiumOptions: {
        ignoreCertificateErrors: true,
        disableWebSecurity: true,
        headless: true,
      }
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`✅ Video successfully rendered in ${duration}s → ${outputPath}`);
    return outputPath;
  } catch (err) {
    log('❌ Rendering error:', err);
    throw err;
  } finally {
    remotionServer?.close();
    log('🛑 Remotion server closed');
  }
});

app.on('window-all-closed', () => {
  remotionServer?.close(() => {
    log('🛑 Remotion server stopped after window closed');
    remotionServer = null;
  });
  app.quit();
});
