import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../../components/shared/modal";
import { attendanceApi } from "../api/attendanceApi";
import { formatAttendanceTime, formatBreakMinutes } from "../utils";
import EditAttendanceModal from "./EditAttendanceModal";

// Every clock-in session of one employee on one day: edit, delete, or add one.
const DaySessionsModal = ({
  isOpen,
  onClose,
  employee,
  dateYmd,
  dateLabel,
  records = [],
  canEdit,
  canCreate,
  canDelete,
  onChanged,
}) => {
  const queryClient = useQueryClient();
  const [editingRecord, setEditingRecord] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIn, setNewIn] = useState("");
  const [newOut, setNewOut] = useState("");
  const [newNote, setNewNote] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const sessions = [...records].sort(
    (a, b) => new Date(a.clockInTime || 0) - new Date(b.clockInTime || 0)
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dailyReport"] });
    queryClient.invalidateQueries({ queryKey: ["dateRangeReport"] });
    queryClient.invalidateQueries({ queryKey: ["employeeAttendance"] });
    onChanged?.();
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Delete this session? Its hours and breaks are removed from the report.")) return;
    setBusyId(record.id);
    try {
      await attendanceApi.deleteAttendance(record.id);
      toast.success("Session deleted");
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete session");
    } finally {
      setBusyId(null);
    }
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setNewIn("");
    setNewOut("");
    setNewNote("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newIn) {
      toast.error("Check-in time is required");
      return;
    }
    const clockIn = new Date(`${dateYmd}T${newIn}`);
    const clockOut = newOut ? new Date(`${dateYmd}T${newOut}`) : null;
    if (clockOut && clockOut <= clockIn) {
      toast.error("Check-out must be after check-in");
      return;
    }
    // Two sessions of one person cannot run at the same time
    const overlaps = sessions.some((session) => {
      const start = new Date(session.clockInTime);
      const end = session.clockOutTime ? new Date(session.clockOutTime) : null;
      const newEnd = clockOut || clockIn;
      return clockIn < (end || start) && newEnd > start;
    });
    if (overlaps) {
      toast.error("This overlaps another session on the same day");
      return;
    }

    setIsAdding(true);
    try {
      await attendanceApi.createAttendance({
        employeeId: employee.id,
        date: dateYmd,
        clockInTime: clockIn.toISOString(),
        clockOutTime: clockOut ? clockOut.toISOString() : null,
        adminNotes: newNote,
      });
      toast.success("Session added");
      resetAddForm();
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to add session");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  // Editing one session replaces this dialog until it is closed again
  if (editingRecord) {
    return (
      <EditAttendanceModal
        isOpen
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
        onSaved={refresh}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetAddForm();
        onClose();
      }}
      title={`${employee?.name || "Attendance"} · ${dateLabel}`}
      maxWidth="sm:max-w-xl"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {sessions.length === 0
              ? "No sessions on this day."
              : `${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
          </p>
          {canCreate && !showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#3F8CFF] shadow-sm ring-1 ring-gray-100 hover:bg-blue-50"
            >
              <FiPlus className="h-3.5 w-3.5" />
              Add session
            </button>
          )}
        </div>

        {sessions.map((record, index) => (
          <div
            key={record.id || index}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#F7F9FC] p-3"
          >
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-gray-800">
                {formatAttendanceTime(record.clockInTime)}
                {" – "}
                {record.clockOutTime ? (
                  formatAttendanceTime(record.clockOutTime)
                ) : (
                  <span className="text-amber-600">not checked out</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {Number(record.totalHours || 0).toFixed(2)} hrs · {formatBreakMinutes(record.breakTime || 0)} break
                {record.isLate ? ` · late ${record.lateBy}m` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditingRecord({ ...record, _id: record.id, employee: { firstName: employee?.name || "" } })}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#3F8CFF] hover:bg-blue-50"
                >
                  <FiEdit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  disabled={busyId === record.id}
                  onClick={() => handleDelete(record)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                  {busyId === record.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        ))}

        {showAddForm && (
          <form onSubmit={handleAdd} className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-3">
            <p className="text-sm font-semibold text-gray-800">New session</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-xs">
                <span className="font-medium text-gray-600">Check-in</span>
                <input
                  type="time"
                  value={newIn}
                  onChange={(e) => setNewIn(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm"
                />
              </label>
              <label className="block text-xs">
                <span className="font-medium text-gray-600">Check-out</span>
                <input
                  type="time"
                  value={newOut}
                  onChange={(e) => setNewOut(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs">
              <span className="font-medium text-gray-600">Admin note (optional)</span>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm"
                placeholder="Why this session was added"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetAddForm}
                className="h-9 rounded-xl px-3 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="h-9 rounded-xl bg-[#3F8CFF] px-4 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isAdding ? "Adding..." : "Add session"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default DaySessionsModal;
