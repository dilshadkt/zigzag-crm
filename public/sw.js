self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const showLeadNotification = (data = {}) => {
  const title = data.title || "New lead";
  const options = {
    body: data.body || "A new lead just arrived",
    icon: "/image/logo.svg",
    badge: "/image/logo.svg",
    tag: data.tag || (data.leadId ? `lead-${data.leadId}` : "new-lead"),
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || (data.leadId ? `/leads/${data.leadId}` : "/leads"),
      leadId: data.leadId || null,
    },
  };

  return self.registration.showNotification(title, options);
};

self.addEventListener("message", (event) => {
  const payload = event.data || {};
  if (payload.type !== "SHOW_LEAD_NOTIFICATION") return;
  event.waitUntil(showLeadNotification(payload));
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(showLeadNotification(data));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetPath =
    event.notification.data?.url ||
    (event.notification.data?.leadId
      ? `/leads/${event.notification.data.leadId}`
      : "/leads");

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          client.postMessage({
            type: "LEAD_NOTIFICATION_CLICK",
            url: targetPath,
          });
          return;
        }
      }

      if (self.clients.openWindow) {
        const origin = self.location.origin;
        return self.clients.openWindow(`${origin}${targetPath}`);
      }
    })
  );
});
