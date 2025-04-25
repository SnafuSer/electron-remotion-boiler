# Electron Remotion Boilerplate

Un starter ultra-complet pour créer des **applications Electron** capables de **générer des vidéos Remotion**, avec un frontend **Next.js** intégré.

---

## 🔥 Fonctionnalités principales

- ⚡ Electron pour l'application desktop
- 🎬 Remotion pour générer dynamiquement des vidéos
- ⚙️ Next.js (React) comme moteur d'interface
- 🚀 Téléchargement et intégration de **Chrome Headless Shell** au build
- 🛠 Gestion propre du serveur Remotion interne (port dynamique)
- 🧹 Remotion Compositing Binary correctement déplacé pour fonctionnement en production
- 📦 Prêt pour être packagé avec **electron-builder**

---

## 📜 Scripts disponibles

| Commande                   | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `npm run dev`               | Lance le projet en mode développement                |
| `npm run build`             | Compile le renderer (Next.js) + le backend (Electron) |
| `npm run dist`              | Génére l'application installable (via electron-builder) |
| `npm run prepare-chromium`  | Télécharge **Chrome Headless Shell** si absent        |
| `npm run install-chromium`  | (alias possible) Installe manuellement Chromium      |

---

## 🚀 Démarrage rapide

1. **Cloner le repo** :
   ```bash
   git clone your-repo-url
   cd your-project
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Télécharger Chromium** (nécessaire pour Remotion) :
   ```bash
   npm run prepare-chromium
   ```

4. **Lancer en développement** :
   ```bash
   npm run dev
   ```

5. **Compiler pour la production** :
   ```bash
   npm run build
   ```

6. **Créer un exécutable (.dmg, .exe, etc.)** :
   ```bash
   npm run dist
   ```

---

## 📚 Techniques utilisées

### 🛠 Chrome Headless Shell intégré
- **Pourquoi ?**  
  Chromium standard ne fonctionne plus correctement avec Remotion packagé.
- **Comment ?**  
  Un script `prepare-chromium` télécharge **chrome-headless-shell** adapté au système (`mac-arm64`, `mac-x64`, `win64`, `linux`) au moment du build.

### 🧩 Remotion Compositing Binary
- **Pourquoi ?**  
  Le binaire `@remotion/compositor-xxx` ne fonctionne pas depuis l'`asar` d'Electron.
- **Comment ?**  
  Il est extrait dans un dossier `node_remotion` via `extraResources` dans `electron-builder` pour pouvoir être utilisé par Remotion à l'exécution.

### 🌐 Serveur HTTP local pour Remotion
- **Pourquoi ?**  
  Remotion nécessite un serveur pour accéder aux fichiers HTML/JS en local.
- **Comment ?**  
  À chaque génération vidéo, un serveur HTTP (`serve-handler`) est lancé automatiquement sur un port libre entre **5050** et **5100**.

### 🧠 Utilisation dynamique du port
- **Comment ?**  
  Avant de lancer le serveur Remotion, on vérifie que le port est disponible, sinon on incrémente jusqu’à trouver un port libre.

---

## 🧩 Stack technique

- Electron (backend + fenêtre desktop)
- Remotion (vidéo dynamique React)
- Next.js (UI frontend)
- Puppeteer/Browsers (gestion de Chrome headless)
- Serve-handler (serveur HTTP local temporaire)
- Electron-builder (packaging multiplateforme)
- Typescript (strict typing)

---

## 📝 Notes importantes

- Ce boilerplate ne génère que des vidéos **localement**, aucun serveur externe nécessaire.
- Tout fonctionne offline après installation de Chromium.
- Compatible Mac ARM, Mac Intel, Windows, Linux.

---

## 🛠️ À personnaliser

- Modifier `remotion-video/` pour changer la vidéo générée
- Modifier `renderer/` pour changer l'interface utilisateur
- Adapter les `inputProps` dans `ipcMain.handle('generate-video')` pour passer vos propres paramètres à Remotion
