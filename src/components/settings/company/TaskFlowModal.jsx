import React, { useState, useRef, useEffect } from "react";
import { useGetAllEmployees, useGetTaskCategories, useGetPositions } from "../../../api/hooks";
import { useCreateTaskFlow, useUpdateTaskFlow } from "../../../api/hooks";
import ModalLayout from "../../shared/modal";
import { FiPlus, FiTrash2, FiLayers, FiUser, FiUsers, FiHash, FiCheckCircle, FiInfo, FiChevronDown, FiSearch, FiCheck, FiArrowUp, FiArrowDown } from "react-icons/fi";
import clsx from "clsx";

const SearchableSelect = ({ options, value, onChange, placeholder, valueKey = "_id", labelKey = "name", subKey, icon, invalid = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);

  const selectedOption = options?.find((opt) => opt[valueKey] === value);

  const filteredOptions = options?.filter((opt) =>
    opt[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex][valueKey]);
        setIsOpen(false);
        setSearchTerm("");
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex-1" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full bg-white border rounded-lg px-2 py-1.5 text-[12px] font-bold text-gray-700 outline-none focus:border-blue-400 transition-all text-left flex items-center justify-between hover:border-blue-300",
          invalid ? "border-red-300" : "border-gray-200"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption ? (
            <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] shrink-0">
              {selectedOption[labelKey]?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-5 h-5 rounded bg-gray-50 text-gray-300 flex items-center justify-center shrink-0">
              {icon || <FiUser className="w-3 h-3" />}
            </div>
          )}
          <span className={clsx("truncate pr-1", !selectedOption && "text-gray-400 font-medium")}>
            {selectedOption ? selectedOption[labelKey] : placeholder}
          </span>
        </div>
        <FiChevronDown className={clsx("w-3.5 h-3.5 text-gray-300 transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-2xl shadow-gray-200 overflow-hidden min-w-[200px]">
          <div className="p-2 border-b border-gray-50 bg-gray-50/50">
            <div className="relative">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                autoFocus
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-8 pr-2 text-[11px] font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <button
                  key={opt[valueKey] || index}
                  type="button"
                  onClick={() => {
                    onChange(opt[valueKey]);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-left mb-0.5 last:mb-0",
                    value === opt[valueKey]
                      ? "bg-blue-50 text-blue-600"
                      : index === highlightedIndex
                      ? "bg-gray-100 text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className={clsx(
                    "w-5 h-5 rounded-md flex items-center justify-center text-[9px] shrink-0",
                    value === opt[valueKey] ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {opt[labelKey]?.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate">{opt[labelKey]}</span>
                  {subKey && opt[subKey] && (
                    <span className="text-[10px] font-medium text-gray-400 truncate max-w-[90px]">{opt[subKey]}</span>
                  )}
                  {value === opt[valueKey] && <FiCheck className="w-3 h-3 shrink-0" />}
                </button>
              ))
            ) : (
              <div className="py-4 px-2 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const emptyStage = () => ({
  taskName: "",
  mode: "role", // "role": picked from each project's team | "person": always this person
  role: "",
  assignee: "",
  weightage: 1,
  requiresClientApproval: false,
  requiresWorkLink: false,
  requiresCampaignReport: false,
});

const stageFromFlow = (flow) => ({
  taskName: flow.taskName || "",
  // Flows saved before roles existed only have a person
  mode: flow.role || !flow.assignee ? "role" : "person",
  role: flow.role || "",
  assignee: flow.assignee?._id || flow.assignee || "",
  weightage: flow.weightage !== undefined ? flow.weightage : 1,
  requiresClientApproval: !!flow.requiresClientApproval,
  requiresWorkLink: !!flow.requiresWorkLink,
  requiresCampaignReport:
    !!flow.requiresCampaignReport || String(flow.taskName || "").toLowerCase() === "campaign",
});

const stageError = (stage) => {
  if (!stage.taskName.trim()) return "Choose what kind of work this stage is";
  if (stage.mode === "role" && !stage.role) return "Choose the role that does this stage";
  if (stage.mode === "person" && !stage.assignee) return "Choose the person who does this stage";
  return "";
};

const REQUIREMENTS = [
  { field: "requiresClientApproval", label: "Client review", on: "peer-checked:bg-blue-500 peer-checked:border-blue-500" },
  { field: "requiresWorkLink", label: "Work link required", on: "peer-checked:bg-purple-500 peer-checked:border-purple-500" },
  { field: "requiresCampaignReport", label: "Campaign report", on: "peer-checked:bg-indigo-500 peer-checked:border-indigo-500" },
];

const DONE_BY = [
  { key: "role", label: "A role", Icon: FiUsers },
  { key: "person", label: "One person", Icon: FiUser },
];

const TaskFlowModal = ({ isOpen, onClose, companyId, taskFlow = null }) => {
  const [name, setName] = useState(taskFlow?.name || "");
  const [localError, setLocalError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [flows, setFlows] = useState(
    taskFlow?.flows?.length > 0 ? taskFlow.flows.map(stageFromFlow) : [emptyStage()]
  );

  const { data: employeesData } = useGetAllEmployees();
  const employees = (employeesData?.employees || []).map((employee) => ({
    ...employee,
    label: employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
  }));
  const { data: positionsData } = useGetPositions(companyId);
  const positions = positionsData?.positions || [];
  const { data: categories, isLoading: categoriesLoading } = useGetTaskCategories(companyId);

  const createTaskFlow = useCreateTaskFlow(companyId, onClose);
  const updateTaskFlow = useUpdateTaskFlow(companyId, onClose);
  const isSaving = createTaskFlow.isPending || updateTaskFlow.isPending;

  const handleFlowChange = (idx, field, value) => {
    setFlows((prev) =>
      prev.map((f, i) => {
        if (i !== idx) return f;
        const next = { ...f, [field]: value };
        if (field === "taskName" && String(value).toLowerCase() === "campaign") {
          next.requiresCampaignReport = true;
        }
        return next;
      })
    );
  };

  const addFlow = () => setFlows((prev) => [...prev, emptyStage()]);
  const removeFlow = (idx) => setFlows((prev) => prev.filter((_, i) => i !== idx));
  const moveFlow = (idx, delta) =>
    setFlows((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });

  const totalWeight = flows.reduce((sum, f) => sum + (Number(f.weightage) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!name.trim()) {
      setLocalError("Give the pipeline a name");
      return;
    }
    if (flows.some((f) => stageError(f))) {
      setShowErrors(true);
      setLocalError("Some stages are incomplete. Fix the highlighted ones.");
      return;
    }

    const payload = {
      name: name.trim(),
      flows: flows.map(({ mode, role, assignee, ...rest }) => ({
        ...rest,
        // Role stages may still prefer a person; person stages are fixed to them
        role: mode === "role" ? role : "",
        assignee: assignee || null,
      })),
    };
    const options = {
      onError: (err) =>
        setLocalError(err.response?.data?.message || "Could not save the pipeline. Please try again."),
    };

    if (taskFlow) {
      updateTaskFlow.mutate({ taskFlowId: taskFlow._id, taskFlowData: payload }, options);
    } else {
      createTaskFlow.mutate(payload, options);
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      setIsOpen={onClose}
      maxWidth="sm:max-w-3xl"
      title={taskFlow ? "Edit Pipeline" : "New Pipeline"}
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div className="space-y-5">
          {/* Pipeline name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
              Pipeline name
            </label>
            <div className="relative">
              <input
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[13px] font-medium transition-all duration-200 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                placeholder="e.g. Content Production, VIP Design Flow"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                <FiLayers className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-3">
            <div className="flex items-end justify-between ml-1">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                  Stages, in order
                </label>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Pick a role and the person is chosen from each project&apos;s team, the one with the
                  fewest open tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={addFlow}
                className="text-[11px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors shrink-0"
              >
                <FiPlus className="w-3 h-3" /> Add stage
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {flows.map((flow, idx) => {
                const error = showErrors ? stageError(flow) : "";
                const share =
                  totalWeight > 0 ? Math.round(((Number(flow.weightage) || 0) / totalWeight) * 100) : 0;

                return (
                  <div
                    key={idx}
                    className={clsx(
                      "flex flex-col gap-3 p-3 bg-gray-50 border rounded-2xl transition-all duration-300",
                      error ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:bg-white hover:border-blue-100"
                    )}
                  >
                    {/* Row 1: number, work type, reorder, remove */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 shrink-0 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {idx + 1}
                      </div>
                      <SearchableSelect
                        options={categories || []}
                        value={flow.taskName}
                        onChange={(val) => handleFlowChange(idx, "taskName", val)}
                        placeholder={categoriesLoading ? "Loading..." : "What kind of work is this stage?"}
                        valueKey="name"
                        labelKey="name"
                        icon={<FiLayers className="w-3 h-3" />}
                        invalid={showErrors && !flow.taskName.trim()}
                      />
                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => moveFlow(idx, -1)}
                          disabled={idx === 0}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <FiArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFlow(idx, 1)}
                          disabled={idx === flows.length - 1}
                          className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <FiArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {flows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFlow(idx)}
                            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove stage"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 2: who does it */}
                    <div className="flex flex-col gap-2 pl-8">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14 shrink-0">
                          Done by
                        </span>
                        <div className="inline-flex rounded-lg bg-white border border-gray-200 p-0.5">
                          {DONE_BY.map(({ key, label, Icon }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleFlowChange(idx, "mode", key)}
                              className={clsx(
                                "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all",
                                flow.mode === key
                                  ? "bg-blue-500 text-white shadow-sm"
                                  : "text-gray-400 hover:text-gray-600"
                              )}
                            >
                              <Icon className="w-3 h-3" /> {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {flow.mode === "role" ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="w-14 shrink-0" />
                            <SearchableSelect
                              options={positions}
                              value={flow.role}
                              onChange={(val) => handleFlowChange(idx, "role", val)}
                              placeholder="Role, e.g. Designer"
                              valueKey="name"
                              labelKey="name"
                              icon={<FiUsers className="w-3 h-3" />}
                              invalid={showErrors && !flow.role}
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <SearchableSelect
                              options={employees}
                              value={flow.assignee}
                              onChange={(val) => handleFlowChange(idx, "assignee", val)}
                              placeholder="Prefer a person (optional)"
                              labelKey="label"
                              subKey="position"
                            />
                            {flow.assignee && (
                              <button
                                type="button"
                                onClick={() => handleFlowChange(idx, "assignee", "")}
                                className="text-[10px] font-bold text-gray-400 hover:text-red-500 shrink-0"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-14 shrink-0" />
                          <SearchableSelect
                            options={employees}
                            value={flow.assignee}
                            onChange={(val) => handleFlowChange(idx, "assignee", val)}
                            placeholder="Choose the person"
                            labelKey="label"
                            subKey="position"
                            invalid={showErrors && !flow.assignee}
                          />
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 pl-16">
                        {flow.mode === "role"
                          ? "The preferred person is used on projects where they are in the team; otherwise the role decides."
                          : "Always this person. On a project without them, the stage falls back to their role."}
                      </p>
                    </div>

                    {/* Row 3: time share + requirements */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pl-8">
                      <div
                        className="flex items-center gap-2"
                        title="How much of the task's time this stage gets, compared with the others"
                      >
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Time weight
                        </span>
                        <div className="relative w-16">
                          <input
                            type="number"
                            min={0}
                            max={10}
                            className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-2 py-1 text-[12px] font-bold text-gray-700 outline-none focus:border-blue-400 transition-colors"
                            value={flow.weightage}
                            onChange={(e) => handleFlowChange(idx, "weightage", parseInt(e.target.value) || 0)}
                          />
                          <FiHash className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 w-3 h-3" />
                        </div>
                        <span className="text-[11px] text-gray-400">≈ {share}% of the time</span>
                      </div>

                      {REQUIREMENTS.map(({ field, label, on }) => (
                        <label key={field} className="flex items-center gap-1.5 cursor-pointer group/opt">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={flow[field]}
                            onChange={(e) => handleFlowChange(idx, field, e.target.checked)}
                          />
                          <div
                            className={clsx(
                              "w-3.5 h-3.5 rounded border border-gray-300 flex items-center justify-center transition-all [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
                              on
                            )}
                          >
                            <FiCheckCircle className="text-white w-2.5 h-2.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-gray-400 group-hover/opt:text-gray-600 transition-colors">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {error && <p className="pl-8 text-[11px] font-bold text-red-600">{error}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {localError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <FiInfo className="text-red-500 w-3.5 h-3.5" />
              </div>
              <p className="text-[12px] font-semibold text-red-700">{localError}</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-bold text-gray-500 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-[12px] font-bold text-white bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : taskFlow ? "Save changes" : "Create pipeline"}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
};

export default TaskFlowModal;
