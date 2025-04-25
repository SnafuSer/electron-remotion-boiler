// electron-remotion-boiler/start-electron.js
const { spawn } = require('child_process');
const path = require('path');

const electron = require('electron');
const electronPath = electron.toString();

const appPath = path.join(__dirname, 'dist-electron', 'main.js');

const child = spawn(electronPath, [appPath], {
  env: {
    ...process.env,
    REMOTION_CACHE_DIR: '/tmp/clipforge-remotion',
  },
  stdio: 'inherit',
});
