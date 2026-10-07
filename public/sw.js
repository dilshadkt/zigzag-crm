self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Required for the browser to offer "Install app". Requests still go to the network.
self.addEventListener("fetch", () => {});

const showNotification = (data = {}) => {
  const title = data.title || "ZigZag CRM";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/pwa-192.png",
    badge: "/icons/pwa-192.png",
    tag: data.tag || `notif-${Date.now()}`,
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
    },
  };
  return self.registration.showNotification(title, options);
};

// Messages from the page (foreground notifications)
self.addEventListener("message", (event) => {
  const payload = event.data || {};

  // Legacy lead notification format
  if (payload.type === "SHOW_LEAD_NOTIFICATION") {
    const leadId = payload.leadId || "";
    event.waitUntil(
      showNotification({
        title: payload.title || "New lead",
        body: payload.body || "A new lead just arrived",
        tag: payload.tag || (leadId ? `lead-${leadId}` : "new-lead"),
        url: payload.url || (leadId ? `/leads/${leadId}` : "/leads"),
      })
    );
    return;
  }

  // Generic notification (tickets, tasks, etc.)
  if (payload.type === "SHOW_NOTIFICATION") {
    event.waitUntil(
      showNotification({
        title: payload.title,
        body: payload.body,
        tag: payload.tag,
        url: payload.url,
        icon: payload.icon,
      })
    );
  }
});

// PWA push notification (app is closed / in background)
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(showNotification(data));
});

// Notification tray click → open / focus the app and navigate
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetPath = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.focus();
            // Tell the React app to navigate
            client.postMessage({ type: "NOTIFICATION_CLICK", url: targetPath });
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(`${self.location.origin}${targetPath}`);
        }
      })
  );
});
