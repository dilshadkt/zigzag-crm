import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getNudges } from "../../api/service";
import { FiX, FiBell } from "react-icons/fi";
import socketService from "../../services/socketService";
import { extractEntityId, syncSubtaskReviewFromNudge } from "../../services/realtimeNotificationHandler";

const GlobalNudges = () => {
  const [nudges, setNudges] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [toastVisibleIds, setToastVisibleIds] = useState([]);
  const isInitialFetch = React.useRef(true);
  const seenReviewNudgeIds = React.useRef(new Set());
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onCallsDesk = pathname.startsWith("/my-calls");
  const fabLift = onCallsDesk
    ? "bottom-[calc(7.75rem+env(safe-area-inset-bottom))] md:bottom-[5.75rem]"
    : "bottom-[4.75rem] md:bottom-[5.75rem]";
  const queryClient = useQueryClient();

  const applyReviewNudgesToTaskCache = (nextNudges) => {
    const reviewNudges = (nextNudges || []).filter((nudge) =>
      String(nudge?.id || "").startsWith("review-")
    );
    const currentIds = new Set(reviewNudges.map((nudge) => nudge.id));

    for (const id of [...seenReviewNudgeIds.current]) {
      if (!currentIds.has(id)) seenReviewNudgeIds.current.delete(id);
    }

    reviewNudges.forEach((nudge) => {
      if (seenReviewNudgeIds.current.has(nudge.id)) return;
      seenReviewNudgeIds.current.add(nudge.id);
      const subTaskId =
        extractEntityId(nudge.subTaskId) ||
        (String(nudge.id || "").startsWith("review-subtask-")
          ? String(nudge.id).slice("review-subtask-".length)
          : "");
      syncSubtaskReviewFromNudge(queryClient, {
        taskId: nudge.taskId,
        subTaskId,
      });
    });
  };

  const fetchNudges = async () => {
    try {
      const res = await getNudges();
      if (res.success) {
        setNudges(res.nudges);
        applyReviewNudgesToTaskCache(res.nudges);
        
        const storedSeen = JSON.parse(localStorage.getItem('seenNudgeIds') || '[]');
        const currentIds = res.nudges.map(n => n.id);
        
        // Find which ones are brand new
        const newlyDiscovered = currentIds.filter(id => !storedSeen.includes(id));
        
        if (!isInitialFetch.current && newlyDiscovered.length > 0) {
            setToastVisibleIds(prev => [...prev, ...newlyDiscovered]);
        }
        
        // Keep our seen list clean (only active nudges are remembered)
        const nextSeen = [...new Set([...storedSeen.filter(id => currentIds.includes(id)), ...newlyDiscovered])];
        localStorage.setItem('seenNudgeIds', JSON.stringify(nextSeen));
        
        if (isInitialFetch.current) {
            isInitialFetch.current = false;
        }
      }
    } catch (err) {
      console.error("Failed to fetch nudges", err);
    }
  };

  useEffect(() => {
    fetchNudges();
    // Every open tab was hitting /performance/nudges every 60s and again on
    // every route change. That alone can saturate an M0 free cluster. Rely on
    // sockets for immediacy; poll only as a backup.
    const interval = setInterval(fetchNudges, 1000 * 60 * 3);

    const handleUpdate = () => {
      fetchNudges();
    };

    socketService.onNewNotification(handleUpdate);
    socketService.onTaskStatusChange(handleUpdate);
    // Assignment fires this before the notification row exists, so it is the
    // earliest signal available.
    socketService.onSubtaskAssigned(handleUpdate);
    window.addEventListener("taskCreated", handleUpdate);
    window.addEventListener("taskUpdated", handleUpdate);

    return () => {
      clearInterval(interval);
      socketService.offNewNotification(handleUpdate);
      socketService.offTaskStatusChange(handleUpdate);
      socketService.offSubtaskAssigned(handleUpdate);
      window.removeEventListener("taskCreated", handleUpdate);
      window.removeEventListener("taskUpdated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    const visible = nudges.length > 0;
    window.__crmAlertsFabVisible = visible;
    window.dispatchEvent(
      new CustomEvent("crm:alerts-fab-visible", {
        detail: { visible },
      })
    );
  }, [nudges.length]);

  if (nudges.length === 0) return null;


  const handleDismissToast = (id, e) => {
    if (e) e.stopPropagation();
    setDismissed((prev) => [...prev, id]);
  };

  const handleNudgeClick = (nudge) => {
    setIsOpen(false); // Close the drawer
    setDismissed((prev) => [...prev, nudge.id]); // Auto-dismiss toast on click
    const subTaskId =
      extractEntityId(nudge.subTaskId) ||
      (String(nudge.id || "").startsWith("review-subtask-")
        ? String(nudge.id).slice("review-subtask-".length)
        : "");
    syncSubtaskReviewFromNudge(queryClient, {
      taskId: nudge.taskId,
      subTaskId,
    });
    if (nudge.id === 'review-nudge') {
      navigate('/task-on-review');
    } else if (nudge.projectId && nudge.taskId) {
      const projectId = extractEntityId(nudge.projectId);
      const taskId = extractEntityId(nudge.taskId);
      navigate(`/projects/${projectId}/${taskId}`);
    }
  };

  const toastVisibleNudges = nudges.filter((n) => toastVisibleIds.includes(n.id) && !dismissed.includes(n.id));

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed bottom-36 right-4 z-[9999] flex max-w-sm flex-col gap-3 pointer-events-none md:bottom-40 md:right-8">
        <AnimatePresence>
          {toastVisibleNudges.map((nudge) => (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              key={`toast-${nudge.id}`}
              onClick={() => handleNudgeClick(nudge)}
              className={`pointer-events-auto relative p-4 pr-8 rounded-2xl border shadow-xl backdrop-blur-md overflow-hidden cursor-pointer transition-all hover:scale-[1.02]
                ${
                  nudge.type === "danger"
                    ? "bg-red-50/90 border-red-200 text-red-800"
                    : nudge.type === "warning"
                    ? "bg-amber-50/90 border-amber-200 text-amber-800"
                    : "bg-green-50/90 border-green-200 text-green-800"
                }
              `}
            >
              {/* Glossy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/40 pointer-events-none" />
              
              <button
                onClick={(e) => handleDismissToast(nudge.id, e)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors z-10"
              >
                <FiX className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
              </button>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-lg">
                  {nudge.type === "danger" ? "🚨" : nudge.type === "warning" ? "⚡" : "🔥"}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm tracking-tight mb-0.5">
                    {nudge.title || (nudge.type === "danger" ? "Penalty Warning" : nudge.type === "warning" ? "Action Required" : "Opportunity")}
                  </h4>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {nudge.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${fabLift} right-4 z-[50] group transition-transform hover:scale-105 md:right-8`}
        aria-label="Action alerts"
      >
        <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md border border-gray-200">
          <FiBell className="w-5 h-5 text-gray-900" />

          {/* Badge count */}
          {nudges.length > 0 && (
            <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gray-900 text-white text-[10px] font-semibold leading-none rounded-full flex items-center justify-center border-2 border-white">
              {nudges.length > 99 ? "99+" : nudges.length}
            </div>
          )}
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[#F8FAFC] z-[70] shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiBell className="text-blue-500" /> Action Alerts
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {nudges.map((nudge) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={nudge.id}
                  onClick={() => handleNudgeClick(nudge)}
                  className={`relative p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md
                    ${
                      nudge.type === "danger"
                        ? "bg-red-50/90 border-red-200 text-red-800"
                        : nudge.type === "warning"
                        ? "bg-amber-50/90 border-amber-200 text-amber-800"
                        : "bg-green-50/90 border-green-200 text-green-800"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-lg">
                      {nudge.type === "danger" ? "🚨" : nudge.type === "warning" ? "⚡" : "🔥"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm tracking-tight mb-0.5">
                        {nudge.title || (nudge.type === "danger" ? "Penalty Warning" : nudge.type === "warning" ? "Action Required" : "Opportunity")}
                      </h4>
                      <p className="text-xs font-medium leading-relaxed opacity-90">
                        {nudge.message}
                      </p>
                      <div className="mt-2 text-[10px] uppercase tracking-wider font-bold bg-white/50 inline-block px-2 py-1 rounded">
                        Click to view
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalNudges;
