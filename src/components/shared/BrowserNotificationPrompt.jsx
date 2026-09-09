import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  dismissBrowserNotificationPrompt,
  enableBrowserNotifications,
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  listenForNotificationClicks,
  registerNotificationWorker,
  wasBrowserNotificationPromptDismissed,
} from "../../services/browserNotificationService";

const BrowserNotificationPrompt = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isBrowserNotificationSupported()) return;

    const permission = getBrowserNotificationPermission();
    if (permission === "granted") {
      enableBrowserNotifications();
      return;
    }

    if (permission !== "default") return;
    if (wasBrowserNotificationPromptDismissed()) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    registerNotificationWorker();
    return listenForNotificationClicks(navigate);
  }, [navigate]);

  if (!visible) return null;

  const handleEnable = async () => {
    setBusy(true);
    try {
      await enableBrowserNotifications();
    } finally {
      setBusy(false);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissBrowserNotificationPrompt();
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[2147483000] mx-auto max-w-lg rounded-2xl border border-blue-100 bg-white p-4 shadow-xl md:left-auto md:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Enable desktop notifications
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Get an alert on your computer when a new lead arrives, even if this
            tab is in the background.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleEnable}
              disabled={busy}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Enabling..." : "Enable"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserNotificationPrompt;
