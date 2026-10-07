import apiClient from "../api/client";

const STORAGE_DISMISSED = "crm_browser_notifications_dismissed";
const STORAGE_ENABLED = "crm_browser_notifications_enabled";
const SW_PATH = "/sw.js";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const isBrowserNotificationSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const getBrowserNotificationPermission = () => {
  if (!isBrowserNotificationSupported()) return "unsupported";
  return Notification.permission;
};

export const wasBrowserNotificationPromptDismissed = () => {
  try {
    return localStorage.getItem(STORAGE_DISMISSED) === "true";
  } catch {
    return false;
  }
};

export const dismissBrowserNotificationPrompt = () => {
  try {
    localStorage.setItem(STORAGE_DISMISSED, "true");
  } catch {
    // Ignore storage errors
  }
};

export const areBrowserNotificationsEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_ENABLED) !== "false";
  } catch {
    return true;
  }
};

export const setBrowserNotificationsEnabled = (enabled) => {
  try {
    localStorage.setItem(STORAGE_ENABLED, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors
  }
};

export const registerNotificationWorker = async () => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH);
  } catch (error) {
    console.error("Failed to register notification worker:", error);
    return null;
  }
};

const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const { data } = await apiClient.get("/notifications/push-config");
  if (!data?.enabled || !data?.publicKey) return;

  const registration = await registerNotificationWorker();
  if (!registration) return;

  const ready = await navigator.serviceWorker.ready;
  let subscription = await ready.pushManager.getSubscription();

  if (!subscription) {
    subscription = await ready.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
  }

  await apiClient.post("/notifications/push-subscribe", subscription.toJSON());
};

export const enableBrowserNotifications = async () => {
  if (!isBrowserNotificationSupported()) {
    return { permission: "unsupported" };
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    setBrowserNotificationsEnabled(true);
    try {
      await subscribeToPush();
    } catch (error) {
      console.error("Failed to subscribe to desktop push:", error);
    }
  }

  return { permission };
};

export const disableBrowserNotifications = async () => {
  setBrowserNotificationsEnabled(false);
  try {
    if ("serviceWorker" in navigator) {
      const ready = await navigator.serviceWorker.ready;
      const subscription = await ready.pushManager.getSubscription();
      if (subscription) {
        await apiClient.post("/notifications/push-unsubscribe", {
          endpoint: subscription.endpoint,
        });
        await subscription.unsubscribe();
      }
    }
  } catch (error) {
    console.error("Failed to disable desktop notifications:", error);
  }
};

const postToServiceWorker = async (payload) => {
  try {
    if (!("serviceWorker" in navigator)) return false;
    const registration =
      (await navigator.serviceWorker.getRegistration()) ||
      (await registerNotificationWorker());
    if (registration?.active) {
      registration.active.postMessage(payload);
      return true;
    }
  } catch {
    // fallthrough to Notification API
  }
  return false;
};

export const showBrowserNotification = async ({ title, body, url, tag, icon } = {}) => {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== "granted") return;
  if (!areBrowserNotificationsEnabled()) return;

  const resolvedUrl = url || "/";
  const resolvedTag = tag || `notif-${Date.now()}`;
  const resolvedIcon = icon || "/icons/pwa-192.png";

  const payload = {
    type: "SHOW_NOTIFICATION",
    title: title || "ZigZag CRM",
    body: body || "",
    url: resolvedUrl,
    tag: resolvedTag,
    icon: resolvedIcon,
  };

  const sent = await postToServiceWorker(payload);
  if (sent) return;

  // Fallback: direct Notification API (doesn't play sound in all browsers)
  try {
    const n = new Notification(payload.title, {
      body: payload.body,
      icon: resolvedIcon,
      badge: "/icons/pwa-192.png",
      tag: resolvedTag,
      renotify: true,
      data: { url: resolvedUrl },
    });
    n.onclick = () => {
      window.focus();
      window.location.assign(resolvedUrl);
      n.close();
    };
  } catch {
    // Ignore — permission may have changed
  }
};

export const showLeadBrowserNotification = async (data = {}) => {
  const leadName = data.leadName || "Someone";
  const campaignName = data.campaignName || "a campaign";
  const leadId = data.leadId || "";
  const url = data.url || (leadId ? `/leads/${leadId}` : "/leads");
  await showBrowserNotification({
    title: "New lead",
    body: `${leadName} interested in ${campaignName}`,
    url,
    tag: leadId ? `lead-${leadId}` : "new-lead",
  });
};

export const listenForNotificationClicks = (navigate) => {
  if (!("serviceWorker" in navigator)) return () => {};

  const handleMessage = (event) => {
    const payload = event.data || {};
    const isKnownClick =
      payload.type === "NOTIFICATION_CLICK" ||
      payload.type === "LEAD_NOTIFICATION_CLICK";
    if (!isKnownClick || !payload.url) return;
    window.focus();
    if (typeof navigate === "function") {
      navigate(payload.url);
    } else {
      window.location.assign(payload.url);
    }
  };

  navigator.serviceWorker.addEventListener("message", handleMessage);
  return () => {
    navigator.serviceWorker.removeEventListener("message", handleMessage);
  };
};
