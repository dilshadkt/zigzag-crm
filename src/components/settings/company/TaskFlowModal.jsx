import React, { useState, useRef, useEffect } from "react";
import { useEmpoyees } from "../../../api/hooks";
import { useCreateTaskFlow, useUpdateTaskFlow } from "../../../api/hooks";
import ModalLayout from "../../shared/modal";
import { FiPlus, FiTrash2, FiLayers, FiUser, FiHash, FiCheckCircle, FiInfo, FiChevronRight, FiChevronDown, FiSearch, FiCheck } from "react-icons/fi";
import clsx from "clsx";

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt._id === value);

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] font-bold text-gray-700 outline-none focus:border-blue-400 transition-all text-left flex items-center justify-between hover:border-blue-300"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption ? (
            <div className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] shrink-0">
              {selectedOption.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-5 h-5 rounded bg-gray-50 text-gray-300 flex items-center justify-center shrink-0">
              <FiUser className="w-3 h-3" />
            </div>
          )}
          <span className={clsx("truncate pr-1", !selectedOption && "text-gray-400 font-medium")}>
            {selectedOption ? selectedOption.name : placeholder}
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
                placeholder="Search team member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt._id}
                  type="button"
                  onClick={() => {
                    onChange(opt._id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-left mb-0.5 last:mb-0",
                    value === opt._id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className={clsx(
                    "w-5 h-5 rounded-md flex items-center justify-center text-[9px] shrink-0",
                    value === opt._id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  )}>
                    {opt.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate">{opt.name}</span>
                  {value === opt._id && <FiCheck className="w-3 h-3 shrink-0" />}
                </button>
              ))
            ) : (
              <div className="py-4 px-2 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                No members found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TaskFlowModal = ({ isOpen, onClose, companyId, taskFlow = null }) => {
  const [name, setName] = useState(taskFlow?.name || "");
  const [localError, setLocalError] = useState("");
  const [flows, setFlows] = useState(
    taskFlow?.flows?.length > 0
      ? taskFlow.flows.map((flow) => ({
        taskName: flow.taskName || "",
        assignee: flow.assignee?._id || flow.assignee || "",
        weightage: flow.weightage !== undefined ? flow.weightage : 1,
        requiresClientApproval: !!flow.requiresClientApproval,
        requiresWorkLink: !!flow.requiresWorkLink,
      }))
      : [{ taskName: "", assignee: "", weightage: 1, requiresClientApproval: false, requiresWorkLink: false }]
  );

  const { data: employeesData } = useEmpoyees(1);
  const employees = employeesData?.employees || [];

  const taskTypes = [
    "content",
    "design",
    "publish",
    "campaign",
    "motion",
    "video editing",
    "video shooting",
  ];

  const createTaskFlow = useCreateTaskFlow(companyId, () => {
    setName("");
    setFlows([{ taskName: "", assignee: "", weightage: 1, requiresClientApproval: false, requiresWorkLink: false }]);
    onClose();
  });

  const updateTaskFlow = useUpdateTaskFlow(companyId, () => {
    onClose();
  });

  const handleFlowChange = (idx, field, value) => {
    setFlows((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };

  const addFlow = () =>
    setFlows((prev) => [...prev, { taskName: "", assignee: "", weightage: 1, requiresClientApproval: false, requiresWorkLink: false }]);

  const removeFlow = (idx) =>
    setFlows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!name.trim()) {
      setLocalError("Pipeline name is required");
      return;
    }

    for (let i = 0; i < flows.length; i++) {
      const f = flows[i];
      if (!f.taskName.trim() || !f.assignee) {
        setLocalError(`Stage ${i + 1} requires a task type and assignee`);
        return;
      }
    }

    if (taskFlow) {
      updateTaskFlow.mutate({
        taskFlowId: taskFlow._id,
        taskFlowData: { name, flows },
      });
    } else {
      createTaskFlow.mutate({ name, flows });
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      setIsOpen={onClose}
      maxWidth="sm:max-w-2xl"
      title={taskFlow ? "Edit Pipeline Workflow" : "Configure New Pipeline"}
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        <div className="space-y-5">
          {/* Pipeline Identity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
              Pipeline Identity Name
            </label>
            <div className="relative">
              <input
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[13px] font-medium transition-all duration-200 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                placeholder="e.g. standard Content Production, VIP Design Flow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                <FiLayers className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Workflow Chain */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Process Chain Stages
              </label>
              <button
                type="button"
                onClick={addFlow}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase flex items-center gap-1 transition-colors"
              >
                <FiPlus className="w-3 h-3" /> Add Stage
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {flows.map((flow, idx) => (
                <div
                  key={idx}
                  className="group flex flex-col gap-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:border-blue-100 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 relative"
                >
                  <div className="flex items-center gap-3">
                    {/* Stage Number */}
                    <div className="w-6 h-6 shrink-0 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {idx + 1}
                    </div>

                    {/* Task Selection */}
                    <div className="flex-1">
                      <select
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[12px] font-bold text-gray-700 outline-none focus:border-blue-400 transition-colors cursor-pointer appearance-none"
                        value={flow.taskName}
                        onChange={(e) => handleFlowChange(idx, "taskName", e.target.value)}
                        required
                      >
                        <option value="">Select Stage Type</option>
                        {taskTypes.map((type) => (
                          <option key={type} value={type} className="capitalize">{type}</option>
                        ))}
                      </select>
                    </div>

                    <FiChevronRight className="text-gray-300 shrink-0" />

                    {/* Assignee Selection */}
                    <SearchableSelect
                      options={employees}
                      value={flow.assignee}
                      onChange={(val) => handleFlowChange(idx, "assignee", val)}
                      placeholder="Stage Lead (Assignee)"
                    />

                    {/* Weightage Small */}
                    <div className="w-16 flex flex-col gap-1 shrink-0">
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 text-[12px] font-bold text-gray-700 outline-none focus:border-blue-400 transition-colors"
                          value={flow.weightage}
                          onChange={(e) => handleFlowChange(idx, "weightage", parseInt(e.target.value) || 0)}
                        />
                        <FiHash className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 w-3 h-3" />
                      </div>
                    </div>

                    {/* Remove Action */}
                    {flows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFlow(idx)}
                        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Settings Bar */}
                  <div className="flex items-center gap-4 pl-9 mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer group/opt">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={flow.requiresClientApproval}
                        onChange={(e) => handleFlowChange(idx, "requiresClientApproval", e.target.checked)}
                      />
                      <div className="w-3.5 h-3.5 rounded border border-gray-300 peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center transition-all">
                        <FiCheckCircle className="text-white w-2.5 h-2.5 opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover/opt:text-gray-600 transition-colors uppercase tracking-wider">
                        Client Review Bridge
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer group/opt">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={flow.requiresWorkLink}
                        onChange={(e) => handleFlowChange(idx, "requiresWorkLink", e.target.checked)}
                      />
                      <div className="w-3.5 h-3.5 rounded border border-gray-300 peer-checked:bg-purple-500 peer-checked:border-purple-500 flex items-center justify-center transition-all">
                        <FiCheckCircle className="text-white w-2.5 h-2.5 opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover/opt:text-gray-600 transition-colors uppercase tracking-wider">
                        Work Link Mandatory
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <FiInfo className="text-red-500 w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] font-bold text-red-700 uppercase">{localError}</p>
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
            disabled={createTaskFlow.isLoading || updateTaskFlow.isLoading}
          >
            {createTaskFlow.isLoading || updateTaskFlow.isLoading
              ? "Saving Configuration..."
              : taskFlow ? "Update Pipeline" : "Deploy Pipeline"}
          </button>
        </div>
      </form>
    </ModalLayout>
  );
};

export default TaskFlowModal;
