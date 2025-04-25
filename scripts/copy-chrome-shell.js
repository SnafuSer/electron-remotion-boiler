// scripts/copy-chrome-shell.js

const fs = require('fs');
const path = require('path');

const sourceBase = path.join(__dirname, '../node_modules/.remotion');
const destinationDir = path.join(__dirname, '../chrome-headless-shell');

// Fonction récursive pour trouver chrome-headless-shell et retourner son dossier parent
function findChromeShellDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const result = findChromeShellDirectory(fullPath);
      if (result) return result;
    } else if (entry.isFile() && entry.name === 'chrome-headless-shell') {
      return path.dirname(fullPath); // Retourne le dossier parent, pas juste le fichier
    }
  }
  return null;
}

// Fonction pour copier tout un dossier
function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 🔥 Nettoyer l'ancien dossier destination s'il existe
function cleanDestination() {
  if (fs.existsSync(destinationDir)) {
    fs.rmSync(destinationDir, { recursive: true, force: true });
    console.log(`🧹 Ancien chrome-headless-shell supprimé.`);
  }
}

// --- EXECUTION ---
console.log('🚀 Préparation de chrome-headless-shell...');

const chromeShellFolder = findChromeShellDirectory(sourceBase);
if (!chromeShellFolder) {
  console.error('❌ chrome-headless-shell introuvable dans .remotion');
  process.exit(1);
}

cleanDestination(); // Nettoyer
copyDirectory(chromeShellFolder, destinationDir); // Copier TOUT le dossier

console.log(`✅ Chrome headless shell copié dans : ${destinationDir}`);
