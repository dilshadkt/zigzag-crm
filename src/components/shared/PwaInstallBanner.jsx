import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  isStandalonePwa,
  promptPwaInstall,
  subscribeInstallable,
} from "../../pwa/install";

const DISMISS_KEY = "crm_pwa_install_dismissed";

const PwaInstallBanner = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [installable, setInstallable] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeInstallable(setInstallable), []);

  if (isStandalonePwa() || !installable || dismissed || !isAuthenticated) return null;

  const install = async () => {
    setBusy(true);
    try {
      await promptPwaInstall();
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore storage errors
    }
    setDismissed(true);
  };

  return (
    <div className="fixed top-3 right-3 z-[1100] w-[260px] rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
      <div className="flex items-center gap-2.5">
        <img src="/icons/pwa-192.png" alt="" className="h-11 w-11 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Install Zigzag CRM</p>
          <p className="text-xs text-gray-500">Opens like an app on this device.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={install}
          disabled={busy}
          className="flex-1 rounded-lg bg-[#2155A3] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Installing..." : "Install"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
