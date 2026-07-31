import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getNudges } from "../../api/service";
import { FiX, FiBell } from "react-icons/fi";
import socketService from "../../services/socketService";

const GlobalNudges = () => {
  const [nudges, setNudges] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchNudges = async () => {
    try {
      const res = await getNudges();
      if (res.success) {
        setNudges(res.nudges);
      }
    } catch (err) {
      console.error("Failed to fetch nudges", err);
    }
  };

  useEffect(() => {
    fetchNudges();
    const interval = setInterval(fetchNudges, 60000);

    const handleUpdate = () => {
      fetchNudges();
    };

    socketService.onNewNotification(handleUpdate);
    
    // Add global event listener for when local tasks are created via the modal
    window.addEventListener("taskCreated", handleUpdate);
    window.addEventListener("taskUpdated", handleUpdate);

    return () => {
      clearInterval(interval);
      socketService.offNewNotification(handleUpdate);
      window.removeEventListener("taskCreated", handleUpdate);
      window.removeEventListener("taskUpdated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    fetchNudges();
  }, [location.pathname]);

  if (nudges.length === 0) return null;

  const dangerCount = nudges.filter(n => n.type === 'danger').length;
  const warningCount = nudges.filter(n => n.type === 'warning').length;
  const successCount = nudges.filter(n => n.type === 'success').length;

  // Determine priority color for the bubble
  const bubbleColor = dangerCount > 0 ? "bg-red-500" : warningCount > 0 ? "bg-amber-500" : "bg-green-500";
  const ringColor = dangerCount > 0 ? "ring-red-200" : warningCount > 0 ? "ring-amber-200" : "ring-green-200";

  const handleDismissToast = (id, e) => {
    e.stopPropagation();
    setDismissed((prev) => [...prev, id]);
  };

  const handleNudgeClick = (nudge) => {
    setIsOpen(false); // Close the drawer
    if (nudge.id === 'review-nudge') {
      navigate('/task-on-review');
    } else if (nudge.projectId && nudge.taskId) {
      navigate(`/projects/${nudge.projectId}/${nudge.taskId}`);
    }
  };

  const toastVisibleNudges = nudges.filter((n) => !dismissed.includes(n.id));

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed bottom-28 right-28 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
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
        className="fixed bottom-28 right-8 z-[50] group transition-transform hover:scale-105"
        title="Performance Alerts"
      >
        <div className={`relative flex items-center justify-center w-16 h-16 ${bubbleColor} rounded-full shadow-lg border-2 border-white ring-4 ${ringColor}`}>
          <FiBell className="w-6 h-6 text-white" />
          
          {/* Pulse effect if danger exists */}
          {dangerCount > 0 && (
            <span className="absolute w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
          )}

          {/* Badge count */}
          <div className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
            {nudges.length}
          </div>
        </div>
        <div className="absolute -top-10 right-0 items-center justify-center w-max hidden group-hover:flex">
          <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
            Action Alerts
          </span>
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
