import React from "react";
import { format } from "date-fns";
import { FiTrash2, FiRepeat } from "react-icons/fi";
import PrimaryButton from "../../shared/buttons/primaryButton";
import RecurrenceFields from "../../shared/RecurrenceFields";
import {
  DEFAULT_SCHEDULE,
  describeSchedule,
  normalizeSchedule,
} from "../../shared/RecurrenceFields/recurrence";
import { taskMinutesToHours } from "../workDetailsForm/workTypeMapping";
import { useGetTaskCategories, useGetTaskFlows } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";
const labelClass = "mb-1 block text-xs font-medium text-gray-600";

const idOf = (value) => value?._id || value || "";

const memberName = (member) =>
  member?.name || member?.firstName || `${member?.firstName || ""} ${member?.lastName || ""}`.trim() || "Team member";

// "2026-10-20" -> "Tue, 20 Oct"
const formatDay = (key) => {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEE, d MMM");
};

const RecurringWorkForm = ({ values, setFieldValue, errors, touched }) => {
  const { companyId, user } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const { data: categoryData } = useGetTaskCategories(effectiveCompanyId);
  const { data: taskFlows = [] } = useGetTaskFlows(effectiveCompanyId);

  const categories = Array.isArray(categoryData) ? categoryData : categoryData?.categories || [];
  const rules = values.recurringWork || [];
  const teamMembers = values.teams || [];

  const setRules = (next) => setFieldValue("recurringWork", next);
  const updateRule = (index, patch) =>
    setRules(rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));

  const handleAdd = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const projectStart = String(values.startDate || "").slice(0, 10);
    setRules([
      ...rules,
      {
        title: "",
        description: "",
        taskCategory: "",
        taskGroup: "",
        taskFlow: "",
        assignedTo: [],
        priority: "Medium",
        schedule: normalizeSchedule(DEFAULT_SCHEDULE),
        dueAfterDays: 3,
        startDate: projectStart > today ? projectStart : today,
        endDate: "",
        maxOccurrences: "",
      },
    ]);
  };

  const handleCategory = (index, categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    updateRule(index, {
      taskCategory: categoryId,
      // Standard quotas (reels, poster...) map by key; custom ones by category name
      taskGroup: category ? category.mapsToQuota || category.name : "",
      timeEstimate: category ? taskMinutesToHours(category.time) ?? undefined : undefined,
    });
  };

  const toggleAssignee = (index, memberId) => {
    const current = (rules[index].assignedTo || []).map(idOf);
    updateRule(index, {
      assignedTo: current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    });
  };

  const ruleError = (index, field) =>
    touched?.recurringWork || errors?.recurringWork
      ? errors?.recurringWork?.[index]?.[field]
      : undefined;

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-xl text-sm text-gray-500">
          Set up work that repeats for this client, like &ldquo;2 blog posts a week&rdquo; or a weekly
          report. A task is created automatically on each scheduled day and the assignee is
          notified. These tasks do not use the monthly quota set in Work Details.
        </p>
        <PrimaryButton title="Add Recurring Work" onclick={handleAdd} className="shrink-0 px-4 text-white" />
      </div>

      {rules.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
          <FiRepeat className="mb-2 h-6 w-6" />
          <p>No recurring work yet.</p>
          <p className="text-sm">Add one to stop creating the same task by hand.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-4">
          {rules.map((rule, index) => {
            const assigned = (rule.assignedTo || []).map(idOf);

            return (
              <div key={rule._id || `new-${index}`} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <FiRepeat className="h-4 w-4 text-blue-600" />
                      {rule.title || "New recurring work"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {describeSchedule(rule.schedule)}
                      {rule._id && rule.nextRunDate && ` · next task ${formatDay(rule.nextRunDate)}`}
                      {rule._id && rule.generatedCount > 0 && ` · ${rule.generatedCount} created so far`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRules(rules.filter((_, i) => i !== index))}
                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                    title="Remove recurring work"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Task title</label>
                    <input
                      type="text"
                      value={rule.title}
                      onChange={(e) => updateRule(index, { title: e.target.value })}
                      placeholder="e.g. Weekly blog post"
                      className={inputClass}
                    />
                    {ruleError(index, "title") && (
                      <p className="mt-1 text-[11px] text-red-500">{ruleError(index, "title")}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Task category</label>
                    <select
                      value={idOf(rule.taskCategory)}
                      onChange={(e) => handleCategory(index, e.target.value)}
                      className={`${inputClass} cursor-pointer bg-white`}
                    >
                      <option value="">No category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>How often</label>
                    <RecurrenceFields
                      value={rule.schedule}
                      onChange={(schedule) => updateRule(index, { schedule })}
                    />
                    {ruleError(index, "schedule") && (
                      <p className="mt-1 text-[11px] text-red-500">{ruleError(index, "schedule")}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Due after (working days)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={rule.dueAfterDays ?? ""}
                      onChange={(e) =>
                        updateRule(index, {
                          dueAfterDays: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Weekly-offs and holidays are not counted. If a scheduled day is a
                      day off, the task starts on the next working day.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Stop on (optional)</label>
                      <input
                        type="date"
                        value={rule.endDate || ""}
                        onChange={(e) => updateRule(index, { endDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Max tasks (optional)</label>
                      <input
                        type="number"
                        min="1"
                        value={rule.maxOccurrences || ""}
                        onChange={(e) =>
                          updateRule(index, {
                            maxOccurrences: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Priority</label>
                    <select
                      value={rule.priority || "Medium"}
                      onChange={(e) => updateRule(index, { priority: e.target.value })}
                      className={`${inputClass} cursor-pointer bg-white`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Task flow (optional)</label>
                    <select
                      value={idOf(rule.taskFlow)}
                      onChange={(e) => updateRule(index, { taskFlow: e.target.value })}
                      className={`${inputClass} cursor-pointer bg-white`}
                    >
                      <option value="">No flow</option>
                      {taskFlows.map((flow) => (
                        <option key={flow._id} value={flow._id}>
                          {flow.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Assign to</label>
                    {teamMembers.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        Add team members in Basic Info to assign this work.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {teamMembers.map((member) => {
                          const selected = assigned.includes(member._id);
                          return (
                            <button
                              key={member._id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggleAssignee(index, member._id)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {memberName(member)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Notes for the assignee (optional)</label>
                    <textarea
                      rows={2}
                      value={rule.description || ""}
                      onChange={(e) => updateRule(index, { description: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecurringWorkForm;
