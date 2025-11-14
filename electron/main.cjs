const { app, BrowserWindow, shell, nativeTheme } = require("electron");
const path = require("node:path");

const isDev = !app.isPackaged;
const devServerURL = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
const preloadPath = path.join(__dirname, "preload.cjs");
const productionIndex = path.join(__dirname, "..", "dist", "index.html");

/**
 * Create the main application window.
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0F172A" : "#ffffff",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      sandbox: true,
      devTools: true,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (isDev) {
    win.loadURL(devServerURL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(productionIndex);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
