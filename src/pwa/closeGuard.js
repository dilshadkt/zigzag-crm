const STORAGE_KEY = "crm_block_app_close";
const OPEN_SHIFT_KEY = "crm_open_shift";
const ON_BREAK_KEY = "crm_on_break";
const CLOSE_MESSAGE = "Check out or log out before closing Zigzag CRM.";

let blocked = false;

const readFlag = (storage, key = STORAGE_KEY) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const writeFlag = (storage, value, key = STORAGE_KEY) => {
  try {
    if (value == null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // Ignore storage failures.
  }
};

const apiBase = () => {
  if (import.meta.env.DEV) return "http://localhost:5000/api";
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  return "http://localhost:5000/api";
};

export const hasOpenShift = () =>
  readFlag(sessionStorage, OPEN_SHIFT_KEY) === "1" ||
  readFlag(localStorage, OPEN_SHIFT_KEY) === "1";

export const setOpenShift = (open) => {
  writeFlag(sessionStorage, open ? "1" : "0", OPEN_SHIFT_KEY);
  writeFlag(localStorage, open ? "1" : null, OPEN_SHIFT_KEY);
};

export const setOnBreak = (onBreak) => {
  writeFlag(sessionStorage, onBreak ? "1" : "0", ON_BREAK_KEY);
  writeFlag(localStorage, onBreak ? "1" : null, ON_BREAK_KEY);
};

const isOnBreak = () =>
  readFlag(sessionStorage, ON_BREAK_KEY) === "1" ||
  readFlag(localStorage, ON_BREAK_KEY) === "1";

export const checkoutOnLeave = () => {
  if (!hasOpenShift() || window.__crmCheckoutSent) return;
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch {
    token = null;
  }
  if (!token) return;
  window.__crmCheckoutSent = true;

  const url = `${apiBase()}/attendance/clock-out-on-close`;
  const onBreak = isOnBreak();
  const body = JSON.stringify({
    token,
    workDescription: onBreak
      ? "Break ended and checked out by closing the window"
      : "Checked out by closing the window",
  });
  const blob = new Blob([body], { type: "text/plain" });
  const queued = typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url, blob);
  if (!queued) {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
      keepalive: true,
      mode: "cors",
    }).catch(() => {});
  }
};

export const shouldBlockAppClose = () => {
  if (readFlag(sessionStorage) === "0") return false;
  return blocked || readFlag(sessionStorage) === "1" || readFlag(localStorage) === "1";
};

const onBeforeUnload = (event) => {
  if (!shouldBlockAppClose()) return undefined;
  event.preventDefault();
  event.returnValue = CLOSE_MESSAGE;
  return CLOSE_MESSAGE;
};

export const installCloseGuard = () => {
  if (typeof window === "undefined" || window.__crmCloseGuardInstalled) return;
  window.__crmCloseGuardInstalled = true;
  window.addEventListener("beforeunload", onBeforeUnload);
  window.addEventListener("pagehide", checkoutOnLeave);
  window.onbeforeunload = onBeforeUnload;
};

export const blockAppClose = () => {
  blocked = true;
  writeFlag(sessionStorage, "1");
  writeFlag(localStorage, "1");
  installCloseGuard();
};

export const allowAppClose = () => {
  blocked = false;
  writeFlag(sessionStorage, "0");
  writeFlag(localStorage, null);
};

export const signOutOfApp = (redirect = "/auth/signin") => {
  setOnBreak(false);
  setOpenShift(false);
  allowAppClose();
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("authState");
  } catch {
    // Ignore storage failures.
  }
  window.location.replace(redirect);
};
