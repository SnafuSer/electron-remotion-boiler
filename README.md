# Electron Remotion Boilerplate

A fully-featured starter to build **Electron applications** capable of **generating Remotion videos**, with a **Next.js frontend**.

---

## 🔥 Main Features

- ⚡ Electron for the desktop application
- 🎬 Remotion for dynamic video generation
- ⚙️ Next.js (React) for the frontend engine
- 🚀 Chrome Headless Shell automatically integrated during build
- 🛠 Proper internal Remotion server management (dynamic port handling)
- 🧹 Correctly relocated Remotion Compositing Binary for production
- 📦 Ready for packaging with **electron-builder**

---

## 📜 Available Scripts

| Command                     | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `npm run dev`                | Launch the project in development mode              |
| `npm run build`              | Compile the renderer (Next.js) + backend (Electron)  |
| `npm run dist`               | Build the final installable app (via electron-builder) |
| `npm run prepare-chromium`   | Download **Chrome Headless Shell** if missing         |
| `npm run install-chromium`   | (alias) Manually install Chromium                   |

---

## 🚀 Quick Start

1. **Clone the repo**:
   ```bash
   git clone your-repo-url
   cd your-project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Download Chromium** (required for Remotion):
   ```bash
   npm run prepare-chromium
   ```

4. **Run in development**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Package the app (.dmg, .exe, etc.)**:
   ```bash
   npm run dist
   ```

---

## 📚 Techniques Used

### 🛠 Chrome Headless Shell Integration
- **Why?**  
  Standard Chromium does not work properly with packaged Remotion apps.
- **How?**  
  A `prepare-chromium` script downloads the appropriate **chrome-headless-shell** for the system (`mac-arm64`, `mac-x64`, `win64`, `linux`) during build.

### 🧩 Remotion Compositing Binary
- **Why?**  
  The `@remotion/compositor-xxx` binary cannot work from inside Electron's `asar` archive.
- **How?**  
  It is extracted into a `node_remotion` folder via `extraResources` during packaging, so Remotion can access it correctly at runtime.

### 🌐 Local HTTP Server for Remotion
- **Why?**  
  Remotion requires an HTTP server to load HTML/JS files locally.
- **How?**  
  A local server (`serve-handler`) is automatically launched on a free port between **5050** and **5100** every time a video is generated.

### 🧠 Dynamic Port Usage
- **How?**  
  Before launching the Remotion server, the app checks if the port is available, otherwise increments until it finds a free one.

---

## 🧩 Tech Stack

- Electron (backend + desktop window)
- Remotion (React-based video rendering)
- Next.js (frontend UI)
- Puppeteer/Browsers (Chrome headless management)
- Serve-handler (temporary HTTP server)
- Electron-builder (cross-platform packaging)
- Typescript (strict typing)

---

## 📝 Important Notes

- This boilerplate generates videos **locally** only — no external server required.
- Everything works offline after downloading Chromium once.
- Compatible with Mac ARM, Mac Intel, Windows, and Linux.

---

## 🛠️ To Customize

- Edit `remotion-video/` to change the generated video
- Edit `renderer/` to customize the UI
- Adapt `inputProps` in `ipcMain.handle('generate-video')` to pass your own data to Remotion
