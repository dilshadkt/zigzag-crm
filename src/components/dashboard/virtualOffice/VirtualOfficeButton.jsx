import { lazy, Suspense, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";

// The whole office (art, animations, data) lives in its own chunk and is only
// downloaded the first time someone opens it, so the dashboard stays as light as before.
const VirtualOfficeModal = lazy(() => import("./VirtualOfficeModal"));

// Same people the API lets in: admins, admin-dashboard access, view-all tasks, or create + edit tasks
export const useCanSeeOffice = () => {
  const { user } = useAuth();
  const { hasPermission, hasAdminDashboardAccess } = usePermissions();
  return (
    user?.role === "company-admin" ||
    hasAdminDashboardAccess() ||
    hasPermission("tasks", "viewAll") ||
    (hasPermission("tasks", "create") && hasPermission("tasks", "edit"))
  );
};

const VirtualOfficeButton = ({ className = "" }) => {
  const [open, setOpen] = useState(false);
  const canSee = useCanSeeOffice();
  if (!canSee) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => import("./VirtualOfficeModal")}
        className={`h-11 sm:h-12 flex items-center gap-2 px-3 sm:px-4 rounded-[14px] bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold text-xs sm:text-sm transition-colors shrink-0 ${className}`}
        title="See the whole team at work"
      >
        <span className="text-base leading-none" aria-hidden="true">🏢</span>
        <span className="hidden sm:inline whitespace-nowrap">Virtual Office</span>
      </button>
      {open && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
            </div>
          }
        >
          <VirtualOfficeModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default VirtualOfficeButton;
