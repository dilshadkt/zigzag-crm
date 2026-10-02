import { useEffect } from "react";
import { useGetCurrentAttendanceStatus } from "../../api/hooks";
import { allowAppClose, blockAppClose, setOnBreak, setOpenShift } from "../../pwa/closeGuard";

const RELEASED = new Set(["checked-out", "absent"]);
const OPEN_SHIFT = new Set(["checked-in", "break", "overtime"]);

const AppCloseGuard = () => {
  const { data: attendanceData, isFetched } = useGetCurrentAttendanceStatus();
  const status = attendanceData?.attendance?.status || attendanceData?.status || "";
  const shiftOpen = OPEN_SHIFT.has(status);
  const onBreak = status === "break";

  useEffect(() => {
    if (!isFetched) {
      blockAppClose();
      return undefined;
    }

    if (RELEASED.has(status)) {
      setOnBreak(false);
      setOpenShift(false);
      allowAppClose();
    } else {
      blockAppClose();
      setOpenShift(shiftOpen);
      setOnBreak(onBreak);
    }
    return undefined;
  }, [isFetched, onBreak, shiftOpen, status]);

  if (!shiftOpen) return null;

  return (
    <div className="pointer-events-none fixed top-3 left-1/2 z-[1300] -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-1.5 text-center text-xs font-medium text-white shadow-lg">
      {onBreak
        ? "Closing this window ends your break and checks you out."
        : "Closing this window checks you out."}
    </div>
  );
};

export default AppCloseGuard;
