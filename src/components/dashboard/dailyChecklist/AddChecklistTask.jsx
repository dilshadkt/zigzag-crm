import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { createGeneralChecklistItem } from "../../../api/service";
import { useGetAllEmployees } from "../../../api/hooks";
import RecurrenceFields from "../../shared/RecurrenceFields";
import SearchableSelect from "../../pages/campaigns/SearchableSelect";
import { isScheduleValid, normalizeSchedule } from "../../shared/RecurrenceFields/recurrence";

const EVERY_DAY = { frequency: "daily", weekdays: [], monthDays: [] };

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

/**
 * Form for a checklist task that isn't tied to a project, with a repeat schedule.
 * Anyone can add tasks for themselves; people who can view everyone's checklist
 * can also assign them to a teammate.
 */
const AddChecklistTask = ({ canAssignOthers, currentUserId, onDone }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [schedule, setSchedule] = useState(EVERY_DAY);
  const [endDate, setEndDate] = useState("");

  const { data: employeesData, isLoading: employeesLoading } = useGetAllEmployees(
    canAssignOthers,
    { view: "select" }
  );
  const assigneeOptions = [
    { value: "", label: "Me" },
    ...(employeesData?.employees || [])
      .filter((emp) => String(emp._id) !== String(currentUserId))
      .map((emp) => ({
        value: emp._id,
        label:
          emp.name ||
          `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
          emp.email ||
          "Unnamed",
      })),
  ];

  const today = format(new Date(), "yyyy-MM-dd");
  const canSubmit = title.trim().length > 0 && isScheduleValid(schedule);

  const mutation = useMutation({
    mutationFn: createGeneralChecklistItem,
    onSuccess: () => {
      toast.success("Checklist task added");
      // Every day the drawer has loaded, plus the dashboard cards, share this prefix
      queryClient.invalidateQueries({ queryKey: ["dailyChecklistSummary"] });
      onDone();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Couldn't add the task");
    },
  });

  const submit = () => {
    if (!canSubmit || mutation.isPending) return;
    mutation.mutate({
      title: title.trim(),
      assignedTo: assignedTo || undefined,
      ...normalizeSchedule(schedule),
      endDate: endDate || undefined,
    });
  };

  return (
    <div className="animate-fade-in rounded-xl border border-blue-100 bg-white p-3 space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Task</label>
        <input
          type="text"
          autoFocus
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape") {
              onDone();
            }
          }}
          placeholder="e.g. Send weekly report, Update invoices"
          className={inputClass}
        />
      </div>

      {canAssignOthers && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Assign to</label>
          <SearchableSelect
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            options={assigneeOptions}
            placeholder="Me"
            loading={employeesLoading}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">How often?</label>
        <RecurrenceFields value={schedule} onChange={setSchedule} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Stop on <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="date"
          value={endDate}
          min={today}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 text-xs font-medium text-gray-500 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || mutation.isPending}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Adding…" : "Add task"}
        </button>
      </div>
    </div>
  );
};

export default AddChecklistTask;
