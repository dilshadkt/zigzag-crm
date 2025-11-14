const { contextBridge, ipcRenderer } = require("electron");

/**
 * Expose a minimal, secure surface area to the renderer.
 * Extend as new native integrations are required.
 */
contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  isPackaged: process.env.NODE_ENV === "production",
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  /**
   * Proxy a whitelist of IPC channels for future enhancements.
   */
  send(channel, payload) {
    ipcRenderer.send(channel, payload);
  },
  on(channel, listener) {
    const subscription = (_, data) => listener(data);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
});


