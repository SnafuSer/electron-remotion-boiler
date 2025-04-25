const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const searchDirs = [
  './',
  './.chromium-cache',
  './node_modules',
  './dist',
];

const binaryNames = ['Chromium', 'chrome', 'chrome.exe'];

function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function searchExecutables(baseDir) {
  const results = [];

  function walk(dir) {
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        if (binaryNames.includes(file)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(baseDir);
  return results;
}

let allMatches = [];

for (const dir of searchDirs) {
  const found = searchExecutables(path.resolve(dir));
  allMatches.push(...found);
}

if (allMatches.length === 0) {
  console.log('❌ Aucun exécutable Chromium/Chrome trouvé dans le projet.');
} else {
  console.log(`🔍 ${allMatches.length} fichier(s) trouvé(s) :\n`);
  allMatches.forEach((match, i) => {
    const execFlag = isExecutable(match) ? '✅' : '❌';
    console.log(`${execFlag} ${match}`);
  });
}
