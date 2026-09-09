const NETWORK_CODES = new Set([
  "ERR_NETWORK",
  "ERR_NETWORK_CHANGED",
  "ERR_INTERNET_DISCONNECTED",
  "ERR_CONNECTION_RESET",
  "ERR_CONNECTION_REFUSED",
  "ERR_CONNECTION_CLOSED",
  "ERR_CONNECTION_ABORTED",
  "ERR_CONNECTION_TIMED_OUT",
  "ERR_NAME_NOT_RESOLVED",
  "ERR_FAILED",
  "ECONNABORTED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
]);

const RESTORE_COOLDOWN_MS = 5000;

const listeners = new Set();

let initialized = false;
let isOffline = false;
let confirming = false;
let lastSource = "browser";
let failedCriticalResource = false;
let probeTimer = null;
let probeInFlight = false;
let probeFailures = 0;
let ignoreReportsUntil = 0;

const getApiProbeUrl = () => {
  if (import.meta.env.DEV) return "http://localhost:5000/api";
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  return `${window.location.origin}/api`;
};

const withCacheBust = (url) => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_reconnect=${Date.now()}`;
};

const isBrowserOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false;

const isNetworkMessage = (text) =>
  /net::ERR_|ERR_NETWORK|Network Error|Failed to fetch|networkerror|Load failed|dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed|internet disconnected|Failed to load/i.test(
    String(text || "")
  );

export const isNetworkError = (error) => {
  if (error == null) return false;

  if (typeof error === "string") return isNetworkMessage(error);

  const code = String(error.code || error.cause?.code || "");
  const message = String(error.message || "");
  const name = String(error.name || "");

  if (
    error.code === "ERR_CANCELED" ||
    name === "CanceledError" ||
    name === "AbortError" ||
    /canceled|aborted/i.test(message)
  ) {
    return false;
  }

  if (NETWORK_CODES.has(code) || NETWORK_CODES.has(message)) return true;
  if (isNetworkMessage(`${code} ${message}`)) return true;

  if ((error.isAxiosError || name === "AxiosError") && !error.response) {
    return true;
  }

  if (name === "TypeError" && isNetworkMessage(message)) return true;

  return false;
};

const emit = (status, extra = {}) => {
  listeners.forEach((listener) => {
    try {
      listener(status, extra);
    } catch (err) {
      console.error("Network status listener failed:", err);
    }
  });
};

const isReachable = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    await fetch(withCacheBust(url), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { "Cache-Control": "no-cache" },
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const confirmOffline = async (source) => {
  if (source === "offline" || isBrowserOffline()) return true;

  if (source === "api" || source === "socket") {
    return !(await isReachable(getApiProbeUrl()));
  }

  return !(await isReachable(window.location.origin));
};

const stopProbe = () => {
  if (!probeTimer) return;
  clearInterval(probeTimer);
  probeTimer = null;
};

const restoreConnection = () => {
  if (!isOffline) return;
  if (isBrowserOffline()) return;

  const shouldReload = failedCriticalResource && probeFailures > 0;
  isOffline = false;
  lastSource = "browser";
  failedCriticalResource = false;
  probeFailures = 0;
  ignoreReportsUntil = Date.now() + RESTORE_COOLDOWN_MS;
  stopProbe();
  emit("online", { shouldReload });
};

const probe = async () => {
  if (probeInFlight) return;
  if (isBrowserOffline()) {
    probeFailures += 1;
    return;
  }

  probeInFlight = true;
  try {
    const originOk = await isReachable(window.location.origin);
    if (!originOk) {
      probeFailures += 1;
      return;
    }

    if (lastSource === "api" || lastSource === "socket") {
      const apiOk = await isReachable(getApiProbeUrl());
      if (!apiOk) {
        probeFailures += 1;
        return;
      }
    }

    restoreConnection();
  } finally {
    probeInFlight = false;
  }
};

const startProbe = () => {
  if (probeTimer) return;
  probe();
  probeTimer = setInterval(probe, 2500);
};

export const subscribeToNetworkStatus = (listener) => {
  listeners.add(listener);
  if (isOffline) listener("offline", { shouldReload: false });
  return () => listeners.delete(listener);
};

export const reportNetworkIssue = (source = "browser", options = {}) => {
  if (options.needsReload) failedCriticalResource = true;
  if (isOffline || confirming) return;
  if (Date.now() < ignoreReportsUntil && source !== "offline") return;

  confirming = true;
  confirmOffline(source)
    .then((offline) => {
      confirming = false;
      if (!offline) {
        if (source === "resource" && probeFailures === 0) {
          failedCriticalResource = false;
        }
        return;
      }

      lastSource = source;
      isOffline = true;
      emit("offline", { shouldReload: false });
      startProbe();
    })
    .catch(() => {
      confirming = false;
      lastSource = source;
      isOffline = true;
      emit("offline", { shouldReload: false });
      startProbe();
    });
};

export const hintConnectionAlive = () => {
  if (!isOffline || isBrowserOffline()) return;
  probe();
};

export const initNetworkMonitor = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("offline", () => reportNetworkIssue("offline"));
  window.addEventListener("online", () => {
    if (!isOffline || isBrowserOffline()) return;
    startProbe();
    probe();
  });

  window.addEventListener(
    "error",
    (event) => {
      const el = event.target;
      if (el && el !== window) {
        const tag = el.tagName;
        const rel = String(el.rel || "");
        const isScript = tag === "SCRIPT";
        const isStyle =
          tag === "LINK" && /stylesheet|modulepreload|preload|module/i.test(rel);
        if (isScript || isStyle) {
          reportNetworkIssue("resource", { needsReload: true });
        }
        return;
      }

      if (isNetworkMessage(event.message)) {
        reportNetworkIssue("error");
      }
    },
    true
  );

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = reason?.message || reason;
    if (!isNetworkError(reason) && !isNetworkMessage(message)) return;

    const needsReload =
      /dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed/i.test(
        String(message || "")
      );
    reportNetworkIssue(needsReload ? "resource" : "error", { needsReload });
  });

  if (isBrowserOffline()) {
    reportNetworkIssue("offline");
  }
};
