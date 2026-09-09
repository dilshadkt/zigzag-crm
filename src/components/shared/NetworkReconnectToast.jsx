import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { RefreshCw, WifiOff } from "lucide-react";
import {
  hintConnectionAlive,
  initNetworkMonitor,
  subscribeToNetworkStatus,
} from "../../utils/networkMonitor";

const NetworkReconnectToast = () => {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    initNetworkMonitor();

    const unsubscribe = subscribeToNetworkStatus((status, extra = {}) => {
      if (status === "offline") {
        wasOffline.current = true;
        setIsReconnecting(true);
        return;
      }

      if (status !== "online" || !wasOffline.current) return;

      wasOffline.current = false;
      setIsReconnecting(false);

      if (extra.shouldReload) {
        toast.success("Connection restored. Refreshing...", {
          id: "network-restored",
          duration: 2000,
        });
        setTimeout(() => window.location.reload(), 800);
        return;
      }

      toast.success("You're back online", {
        id: "network-restored",
        duration: 3000,
      });
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") hintConnectionAlive();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!isReconnecting) return null;

  return (
    <div className="fixed top-4 right-4 z-[2147483647] flex items-center gap-3 rounded-xl bg-[#363636] text-white px-4 py-3 shadow-lg min-w-[280px]">
      <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="min-w-0">
        <p className="font-medium text-sm">Connection lost</p>
        <p className="text-xs text-gray-300 flex items-center gap-1.5 mt-0.5">
          <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
          Trying to reconnect...
        </p>
      </div>
    </div>
  );
};

export default NetworkReconnectToast;
