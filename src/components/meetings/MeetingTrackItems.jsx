import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";

const personName = (person) =>
  `${person?.firstName || ""} ${person?.lastName || ""}`.trim() ||
  person?.name ||
  "Unassigned";

const personId = (person) => String(person?._id || person || "");

const MeetingTrackItems = ({
  meeting,
  employees = [],
  canAdd,
  currentUserId,
  onAdd,
  onToggle,
  onDelete,
  isSaving,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const items = meeting?.actionItems || [];
  const doneCount = items.filter((item) => item.status === "done").length;
  const assigneeOptions = useMemo(() => {
    const fromInvitees = (meeting?.invitees || []).map((person) => ({
      value: personId(person),
      label: personName(person),
    }));
    if (fromInvitees.length > 0) return fromInvitees;
    return employees.map((employee) => ({
      value: employee._id,
      label: employee.name || personName(employee),
    }));
  }, [meeting, employees]);

  const resetForm = () => {
    setTitle("");
    setAssignedTo("");
    setDueDate("");
    setIsAdding(false);
  };

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error("Add a title for this tracked item");
      return;
    }
    onAdd({
      title: title.trim(),
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
    });
    resetForm();
  };

  if (meeting?.status === "cancelled" && items.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-gray-100 bg-[#F7F9FC] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Tracked items
          </p>
          <p className="text-[11px] text-gray-500">
            {items.length === 0
              ? "Create follow-ups under this meeting to track them."
              : `${doneCount}/${items.length} done`}
          </p>
        </div>
        {canAdd && meeting?.status !== "cancelled" && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-[#3F8CFF] shadow-sm hover:bg-blue-50"
          >
            <FiPlus className="h-3 w-3" /> Create
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-3 space-y-2 rounded-xl border border-blue-100 bg-white p-2.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What should be tracked?"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 outline-none"
            >
              <option value="">Assign to...</option>
              {assigneeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-2 text-xs text-gray-700 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={isSaving}
              className="rounded-lg bg-[#3F8CFF] px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              Add item
            </button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item) => {
            const done = item.status === "done";
            const overdue =
              !done && item.dueDate && new Date(item.dueDate) < new Date(new Date().toDateString());
            const canToggle =
              canAdd ||
              personId(item.assignedTo) === String(currentUserId) ||
              personId(item.createdBy) === String(currentUserId);
            const canRemove =
              canAdd || personId(item.createdBy) === String(currentUserId);

            return (
              <div
                key={item._id}
                className="flex items-start gap-2 rounded-xl bg-white px-2.5 py-2"
              >
                <button
                  type="button"
                  disabled={!canToggle}
                  onClick={() => onToggle(item, done ? "open" : "done")}
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-gray-300 bg-white text-transparent"
                  } ${canToggle ? "cursor-pointer" : "opacity-50"}`}
                >
                  <FiCheck className="h-3 w-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      done ? "text-gray-400 line-through" : "text-gray-800"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {item.assignedTo ? personName(item.assignedTo) : "Unassigned"}
                    {item.dueDate
                      ? ` · ${new Date(item.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}`
                      : ""}
                    {overdue ? " · overdue" : ""}
                  </p>
                </div>
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="p-1 text-gray-300 hover:text-red-500"
                    title="Remove"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MeetingTrackItems;
