let deferredPrompt = null;
const listeners = new Set();

const INSTALLED_DISPLAY_MODES = [
  "standalone",
  "minimal-ui",
  "fullscreen",
  "window-controls-overlay",
];

export const isStandalonePwa = () => {
  if (typeof window === "undefined") return false;
  if (INSTALLED_DISPLAY_MODES.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches)) {
    return true;
  }
  return window.navigator.standalone === true;
};

const notify = () => {
  const available = Boolean(deferredPrompt) && !isStandalonePwa();
  listeners.forEach((listener) => listener(available));
};

export const initPwa = () => {
  if (typeof window === "undefined") return;
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
};

export const subscribeInstallable = (listener) => {
  listeners.add(listener);
  listener(Boolean(deferredPrompt) && !isStandalonePwa());
  return () => listeners.delete(listener);
};

export const promptPwaInstall = async () => {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return choice?.outcome === "accepted";
};
