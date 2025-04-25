import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import os from 'os';
import http from 'http';
import serveHandler from 'serve-handler';
import { pathToFileURL } from 'url';
import { ipcMain, app, BrowserWindow, shell } from 'electron';
import { getCompositions, renderMedia } from '@remotion/renderer';
import net from 'net';

// --- LOG SETUP ---
const logFile = path.join(os.tmpdir(), 'clipforge-log.txt');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
function log(...args: any[]) {
  const message = `[${new Date().toISOString()}] ` + args.join(' ');
  logStream.write(message + '\n');
  console.log('[LOG]', ...args);
}

ipcMain.handle('open-log-file', async () => {
  await shell.openPath(logFile);
});

// --- CACHE DIR ---
const remotionCacheDir = path.join(os.tmpdir(), 'clipforge-remotion');
fs.mkdirSync(remotionCacheDir, { recursive: true });
process.env.REMOTION_CACHE_DIR = remotionCacheDir;
log('✅ REMOTION_CACHE_DIR initialisé dans:', remotionCacheDir);

// --- CHROMIUM PATH ---
function getChromiumExecutablePath(): string {
    if (!app.isPackaged) {
        log('🔧 Dev mode : utilisation du navigateur par défaut (Remotion téléchargera)');
        return null; // <- Remotion s’en charge en dev
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

// --- ELECTRON WINDOW ---
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

  log('🌐 Chargement de la fenêtre Electron depuis :', url);
  mainWindow.loadURL(url);
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => (mainWindow = null));
}

app.whenReady().then(createWindow);


// --- PORT DYNAMIQUE ---
async function findAvailablePort(startAt = 5050): Promise<number> {
    const isFree = (port: number): Promise<boolean> =>
      new Promise((resolve) => {
        const server = net.createServer()
          .once('error', () => resolve(false))
          .once('listening', () => server.close(() => resolve(true)))
          .listen(port);
      });
  
    let port = startAt;
    while (!(await isFree(port))) {
      port++;
      if (port > 5100) throw new Error('🛑 Aucun port disponible entre 5050 et 5100');
    }
    return port;
}
  
let remotionServer: http.Server | null = null;

// --- GENERATE VIDEO ---
ipcMain.handle('generate-video', async (_, inputProps) => {
  const startTime = Date.now();
  log('🎬 Début de la génération avec props :', JSON.stringify(inputProps));

  const projectRoot = app.getAppPath();
  const outputPath = path.join(app.getPath('videos'), 'clipforge-video.mp4');
  const bundlePath = path.join(projectRoot, 'remotion-video', 'build');

  if (!fs.existsSync(path.join(bundlePath, 'index.html'))) {
    log('❌ Remotion bundle introuvable :', bundlePath);
    throw new Error('Remotion bundle introuvable');
  }

  const port = await findAvailablePort(5050);
  const serveUrl = `http://127.0.0.1:${port}`;

  remotionServer = http.createServer((request, response) => {
    return serveHandler(request, response, { public: bundlePath });
  });

  await new Promise<void>((resolve) => remotionServer!.listen(port, resolve));
  log(`🚀 Serveur Remotion lancé sur ${serveUrl}`);

  const browserExecutable = getChromiumExecutablePath();
  log('🧠 Final browser executable:', browserExecutable);

  const binariesDirectory = app.isPackaged
  ? path.join(process.resourcesPath, 'node_remotion', 'compositor-darwin-arm64')
  : path.join(__dirname, '..', 'node_modules', '@remotion', 'compositor-darwin-arm64');

  log('📦 binariesDirectory utilisé pour Remotion :', binariesDirectory);

  try {
    log('📥 Appel de getCompositions...');
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

    log('🎃 Compositions trouvées:', compositions);

    const composition = compositions.find((c) => c.id === 'ClipForge');
    if (!composition) {
      log('❌ Composition "ClipForge" non trouvée');
      throw new Error('Composition "ClipForge" non trouvée');
    }

    log('✅ Composition ClipForge trouvée');

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
    log(`✅ Vidéo générée en ${duration}s à ${outputPath}`);
    return outputPath;
  } catch (err) {
    log('❌ Erreur de rendu :', err);
    throw err;
  } finally {
    remotionServer.close();
    log('🛑 Serveur HTTP Remotion stoppé');
  }
});
app.on('window-all-closed', () => {
    if (remotionServer) {
        remotionServer.close(() => {
          log('🛑 Serveur Remotion fermé suite à la fermeture de la fenêtre Electron');
          remotionServer = null;
        });
    }
    app.quit()
});

// mainWindow.on('closed', () => {
//     if (remotionServer) {
//       remotionServer.close(() => {
//         log('🛑 Serveur Remotion fermé suite à la fermeture de la fenêtre Electron');
//         remotionServer = null;
//       });
//     }
//     mainWindow = null;
// });
  