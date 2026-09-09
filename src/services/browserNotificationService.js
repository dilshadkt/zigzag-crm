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

export const showLeadBrowserNotification = async (data = {}) => {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== "granted") return;
  if (!areBrowserNotificationsEnabled()) return;

  const leadName = data.leadName || "Someone";
  const campaignName = data.campaignName || "a campaign";
  const leadId = data.leadId || "";
  const url = data.url || (leadId ? `/leads/${leadId}` : "/leads");
  const payload = {
    type: "SHOW_LEAD_NOTIFICATION",
    title: "New lead",
    body: `${leadName} interested in ${campaignName}`,
    leadId,
    url,
    tag: leadId ? `lead-${leadId}` : "new-lead",
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration =
        (await navigator.serviceWorker.getRegistration()) ||
        (await registerNotificationWorker());
      if (registration) {
        const ready = await navigator.serviceWorker.ready;
        ready.active?.postMessage(payload);
        return;
      }
    }
  } catch (error) {
    console.error("Service worker notification failed:", error);
  }

  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: "/image/logo.svg",
    tag: payload.tag,
    renotify: true,
    requireInteraction: true,
    data: { url },
  });

  notification.onclick = () => {
    window.focus();
    if (url) {
      window.location.assign(url);
    }
    notification.close();
  };
};

export const listenForNotificationClicks = (navigate) => {
  if (!("serviceWorker" in navigator)) return () => {};

  const handleMessage = (event) => {
    const payload = event.data || {};
    if (payload.type !== "LEAD_NOTIFICATION_CLICK" || !payload.url) return;
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
