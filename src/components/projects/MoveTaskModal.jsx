import React, { useState, useMemo } from "react";
import { FiArrowRight, FiChevronDown, FiSearch, FiPackage, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useCompanyProjects } from "../../api/hooks";
import Modal from "../shared/modal";
import { matchStandardWorkType } from "./workDetailsForm/workTypeMapping";

const WORK_TYPES = [
  { key: "reels", label: "Reels" },
  { key: "poster", label: "Poster" },
  { key: "motionPoster", label: "Motion Poster" },
  { key: "shooting", label: "Shooting" },
  { key: "motionGraphics", label: "Motion Graphics" },
  { key: "extraTask", label: "Extra Task / Other" },
];

const getQuotaSlot = (monthDetails, taskGroup) => {
  if (!monthDetails || !taskGroup || taskGroup === "extraTask") return null;
  if (monthDetails[taskGroup] && typeof monthDetails[taskGroup] === "object") {
    return monthDetails[taskGroup];
  }
  return (
    (monthDetails.other || []).find(
      (item) =>
        String(item.name).trim().toLowerCase() ===
        String(taskGroup).trim().toLowerCase()
    ) || null
  );
};

const formatMonth = (monthKey) => {
  if (!monthKey) return "";
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const MoveTaskModal = ({ isOpen, onClose, taskDetails, onMove, onMoveMonth, isLoading }) => {
  const { companyId, user } = useAuth();
  const effectiveCompanyId = companyId || user?.company;

  const { data: projects = [] } = useCompanyProjects(effectiveCompanyId, 0, null, {
    enabled: isOpen,
  });

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTaskGroup, setSelectedTaskGroup] = useState("");
  const [selectedOtherCategory, setSelectedOtherCategory] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [mode, setMode] = useState("project");
  const [targetMonth, setTargetMonth] = useState("");

  const currentProjectId = taskDetails?.project?._id || taskDetails?.project;

  // Filter out the current project from the list
  const availableProjects = useMemo(() => {
    return (Array.isArray(projects) ? projects : [])
      .filter((p) => p._id !== currentProjectId && p.active !== false)
      .filter((p) =>
        projectSearch
          ? p.name.toLowerCase().includes(projectSearch.toLowerCase())
          : true
      );
  }, [projects, currentProjectId, projectSearch]);

  const selectedProject = useMemo(() => {
    return availableProjects.find((p) => p._id === selectedProjectId);
  }, [availableProjects, selectedProjectId]);

  // Get work details from the destination project for the task's month
  const destWorkCategories = useMemo(() => {
    if (!selectedProject || !taskDetails?.taskMonth) return [];
    const monthDetails = selectedProject.workDetails?.find(
      (wd) => wd.month === taskDetails.taskMonth
    );
    if (!monthDetails) return [];

    const categories = [];
    WORK_TYPES.forEach((wt) => {
      if (wt.key === "extraTask") return; // handled separately
      const details = monthDetails[wt.key];
      if (details && details.total > 0) {
        categories.push({
          key: wt.key,
          label: wt.label,
          remaining: details.count,
          total: details.total,
        });
      }
    });

    // Add "other" categories
    if (monthDetails.other && monthDetails.other.length > 0) {
      monthDetails.other.forEach((item) => {
        categories.push({
          key: item.name,
          label: item.name,
          remaining: item.count,
          total: item.total,
          isOther: true,
        });
      });
    }

    return categories;
  }, [selectedProject, taskDetails?.taskMonth]);

  // Quota before/after for the month move, from the project data already loaded.
  // Work count = used / total. The old month goes down by 1, the new one up by 1.
  const monthPreview = useMemo(() => {
    if (mode !== "month" || !targetMonth || !taskDetails?.taskGroup) return null;
    const currentProject = (Array.isArray(projects) ? projects : []).find(
      (p) => p._id === currentProjectId
    );
    if (!currentProject) return null;

    // Some tasks store the category name as taskGroup; the category maps it to a quota key.
    const quotaGroup =
      matchStandardWorkType(taskDetails.taskGroup) ||
      taskDetails.taskCategory?.mapsToQuota ||
      taskDetails.taskGroup;
    const workDetails = currentProject.workDetails || [];
    const workLabel =
      WORK_TYPES.find((w) => w.key === quotaGroup)?.label || quotaGroup;

    const fromSlot = getQuotaSlot(
      workDetails.find((wd) => wd.month === taskDetails.taskMonth),
      quotaGroup
    );
    if (!fromSlot) return { workLabel, hasQuota: false };

    const toMonthDetails = workDetails.find((wd) => wd.month === targetMonth);
    let toSlot = getQuotaSlot(toMonthDetails, quotaGroup);
    if (!toMonthDetails) {
      // A missing month is created from the latest earlier month's package.
      const earlier = workDetails
        .filter((wd) => wd.month < targetMonth)
        .sort((a, b) => (a.month > b.month ? -1 : 1))[0];
      const template = getQuotaSlot(earlier, quotaGroup);
      toSlot = { total: template?.total || 0, count: template?.total || 0, extra: 0 };
    }

    const used = (slot) => Math.max(0, (slot.total || 0) - (slot.count || 0));
    const fromBefore = used(fromSlot);
    // Over-quota (extra) work is released first, otherwise the used count drops by 1.
    const fromAfter = fromSlot.extra > 0 ? fromBefore : Math.max(0, fromBefore - 1);
    const toBefore = used(toSlot);
    const toOverQuota = !!toSlot && toSlot.count <= 0;
    const toAfter = toOverQuota ? toBefore : toBefore + 1;

    return {
      hasQuota: true,
      workLabel,
      from: { before: fromBefore, after: fromAfter, total: fromSlot.total || 0, extra: fromSlot.extra || 0, extraAfter: Math.max(0, (fromSlot.extra || 0) - (fromSlot.extra > 0 ? 1 : 0)) },
      to: { before: toBefore, after: toAfter, total: toSlot?.total || 0, extra: toSlot?.extra || 0, overQuota: toOverQuota },
      toMonthMissing: !toMonthDetails,
    };
  }, [mode, targetMonth, projects, currentProjectId, taskDetails?.taskGroup, taskDetails?.taskCategory, taskDetails?.taskMonth]);

  const handleMoveMonth = () => {
    if (!targetMonth || targetMonth === taskDetails?.taskMonth) return;
    onMoveMonth?.({ targetMonth });
  };

  const handleMove = () => {
    if (!selectedProjectId || !selectedTaskGroup) return;

    const moveData = {
      destinationProjectId: selectedProjectId,
      taskGroup: selectedTaskGroup === "other" ? "extraTask" : selectedTaskGroup,
    };

    if (selectedTaskGroup === "other" && selectedOtherCategory) {
      moveData.extraTaskWorkType = selectedOtherCategory;
    }

    // Check if the selected taskGroup is an "other" category from dest project
    const isOtherCat = destWorkCategories.find(
      (c) => c.key === selectedTaskGroup && c.isOther
    );
    if (isOtherCat) {
      moveData.taskGroup = isOtherCat.key;
    }

    onMove(moveData);
  };

  const handleClose = () => {
    setSelectedProjectId("");
    setSelectedTaskGroup("");
    setSelectedOtherCategory("");
    setProjectSearch("");
    setShowProjectDropdown(false);
    setMode("project");
    setTargetMonth("");
    onClose();
  };

  const subTaskCount = taskDetails?.subTaskCount || 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === "month" ? "Move Task to Another Month" : "Move Task to Another Project"} maxWidth="sm:max-w-2xl">
      <div className="flex flex-col gap-5 pt-2">
        {/* Source Info */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Moving From
          </div>
          <div className="flex items-center gap-2">
            <FiPackage className="text-slate-400 w-4 h-4" />
            <span className="text-[14px] font-bold text-slate-700">
              {taskDetails?.project?.name || "Unknown Project"}
            </span>
          </div>
          <div className="mt-2.5 text-[13px] text-slate-600 flex items-center flex-wrap gap-1.5">
            <span className="font-semibold">{taskDetails?.title}</span>
            {subTaskCount > 0 && (
              <span className="px-2 py-0.5 bg-slate-200/50 text-slate-500 rounded-md text-[11px] font-bold">
                + {subTaskCount} subtask{subTaskCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {taskDetails?.movedFrom?.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 w-fit">
              <FiAlertCircle className="w-3.5 h-3.5" />
              Previously moved from{" "}
              <span className="font-bold">{taskDetails.movedFrom[taskDetails.movedFrom.length - 1]?.projectName}</span>
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {[
            { key: "project", label: "Another Project" },
            { key: "month", label: "Another Month" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                mode === tab.key ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "month" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Currently in {formatMonth(taskDetails?.taskMonth)} — move to
              </label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white shadow-sm"
              />
              {targetMonth && targetMonth === taskDetails?.taskMonth && (
                <p className="mt-1.5 text-[12px] text-rose-500 font-medium">
                  The task is already in this month.
                </p>
              )}
            </div>

            {monthPreview && targetMonth !== taskDetails?.taskMonth && (
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-[13px] text-slate-700 flex flex-col gap-2.5">
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {monthPreview.workLabel} work count
                </div>
                {monthPreview.hasQuota ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold">{formatMonth(taskDetails.taskMonth)}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-slate-500">
                          {monthPreview.from.before}/{monthPreview.from.total}
                        </span>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-800">
                          {monthPreview.from.after}/{monthPreview.from.total}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-600">
                          {monthPreview.from.extra > 0 ? "extra −1" : "−1"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold">{formatMonth(targetMonth)}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-slate-500">
                          {monthPreview.to.before}/{monthPreview.to.total}
                        </span>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-800">
                          {monthPreview.to.after}/{monthPreview.to.total}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-600">
                          {monthPreview.to.overQuota ? "extra +1" : "+1"}
                        </span>
                      </span>
                    </div>
                    {monthPreview.toMonthMissing && (
                      <p className="text-[12px] text-slate-500">
                        {formatMonth(targetMonth)} has no work details yet; it will be created from the latest month's package.
                      </p>
                    )}
                    {monthPreview.to.overQuota && (
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 w-fit">
                        <FiAlertCircle className="w-3.5 h-3.5" />
                        No quota left in {formatMonth(targetMonth)} — this task will count as extra work.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-slate-500">
                    This work type has no monthly quota to adjust.
                  </div>
                )}
              </div>
            )}

            {subTaskCount > 0 && (
              <p className="text-[12px] text-slate-500">
                Subtask due dates are not changed; only the task's month and work counts move.
              </p>
            )}
          </div>
        )}

        {mode === "project" && (
        <>
        {/* Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <FiArrowRight className="text-slate-400 rotate-90 w-4 h-4" />
          </div>
        </div>

        {/* Destination Project Selector */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Destination Project
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-3 border border-slate-200 rounded-xl text-left text-[13px] font-medium text-slate-700 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white shadow-sm"
            >
              <span className={selectedProject ? "text-slate-800 font-semibold" : "text-slate-400"}>
                {selectedProject?.name || "Select a destination project..."}
              </span>
              <FiChevronDown
                className={`text-slate-400 transition-transform ${
                  showProjectDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProjectDropdown && (
              <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-h-64 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search projects..."
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-50 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {availableProjects.length === 0 ? (
                    <div className="px-4 py-6 text-[13px] font-medium text-slate-400 text-center flex flex-col items-center gap-2">
                      <FiPackage className="w-6 h-6 opacity-20" />
                      No other projects found
                    </div>
                  ) : (
                    availableProjects.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(project._id);
                          setSelectedTaskGroup("");
                          setShowProjectDropdown(false);
                          setProjectSearch("");
                        }}
                        className={`w-full text-left px-4 py-3 text-[13px] font-medium hover:bg-slate-50 transition-colors flex items-center gap-2.5 border-b border-slate-50 last:border-b-0 ${
                          selectedProjectId === project._id
                            ? "bg-blue-50/50 text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                          style={{
                            backgroundColor:
                              project.status === "active"
                                ? "#22c55e"
                                : project.status === "on-hold"
                                ? "#f59e0b"
                                : "#94a3b8",
                          }}
                        />
                        {project.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work Type Selector */}
        {selectedProjectId && (
          <div className="animate-fadeIn mt-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
              Work Category in Destination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WORK_TYPES.filter((wt) => wt.key !== "extraTask").map((wt) => {
                const destCat = destWorkCategories.find((c) => c.key === wt.key);
                return (
                  <button
                    key={wt.key}
                    type="button"
                    onClick={() => setSelectedTaskGroup(wt.key)}
                    className={`px-3.5 py-3 text-[13px] font-medium rounded-xl border transition-all text-left flex justify-between items-center ${
                      selectedTaskGroup === wt.key
                        ? "border-blue-400 bg-blue-50/50 text-blue-700 shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm"
                    }`}
                  >
                    <span className="font-semibold">{wt.label}</span>
                    {destCat ? (
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                        destCat.remaining > 0 ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-600"
                      }`}>
                        {destCat.remaining}/{destCat.total}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">None</span>
                    )}
                  </button>
                );
              })}

              {/* Other categories from destination project */}
              {destWorkCategories
                .filter((c) => c.isOther)
                .map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedTaskGroup(cat.key)}
                    className={`px-3.5 py-3 text-[13px] font-medium rounded-xl border transition-all text-left flex justify-between items-center ${
                      selectedTaskGroup === cat.key
                        ? "border-blue-400 bg-blue-50/50 text-blue-700 shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm"
                    }`}
                  >
                    <span className="font-semibold">{cat.label}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                        cat.remaining > 0 ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-600"
                    }`}>
                      {cat.remaining}/{cat.total}
                    </span>
                  </button>
                ))}

              {/* Extra Task option */}
              <button
                type="button"
                onClick={() => setSelectedTaskGroup("extraTask")}
                className={`px-3.5 py-3 text-[13px] font-medium rounded-xl border transition-all text-left flex flex-col justify-center sm:col-span-2 ${
                  selectedTaskGroup === "extraTask"
                    ? "border-blue-400 bg-blue-50/50 text-blue-700 shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm"
                }`}
              >
                <span className="font-semibold">Extra Task / Other</span>
                <span className={`text-[11px] mt-0.5 ${selectedTaskGroup === "extraTask" ? "text-blue-500/80" : "text-slate-400"}`}>
                  Additional work outside monthly quota limits
                </span>
              </button>
            </div>

            {selectedTaskGroup === "extraTask" && (
              <div className="mt-3 animate-fadeIn">
                <input
                  type="text"
                  value={selectedOtherCategory}
                  onChange={(e) => setSelectedOtherCategory(e.target.value)}
                  placeholder="E.g., Logo Design, Custom Branding..."
                  className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all shadow-sm"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {selectedProjectId && selectedTaskGroup && (
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 animate-fadeIn mt-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FiArrowRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Move Summary
              </span>
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed ml-8">
              Moving <span className="font-bold">"{taskDetails?.title}"</span>
              {subTaskCount > 0 && (
                <span>
                  {" "}and <span className="font-bold">{subTaskCount} subtask{subTaskCount > 1 ? "s" : ""}</span>
                </span>
              )}{" "}
              from <span className="font-bold">{taskDetails?.project?.name}</span> to{" "}
              <span className="font-bold">{selectedProject?.name}</span> under the{" "}
              <span className="font-bold capitalize text-blue-700">
                {selectedTaskGroup === "extraTask"
                  ? selectedOtherCategory || "Extra Task"
                  : WORK_TYPES.find((w) => w.key === selectedTaskGroup)?.label ||
                    selectedTaskGroup}
              </span>{" "}
              category.
            </p>
          </div>
        )}

        </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={mode === "month" ? handleMoveMonth : handleMove}
            disabled={
              mode === "month"
                ? !targetMonth || targetMonth === taskDetails?.taskMonth || isLoading
                : !selectedProjectId ||
                  !selectedTaskGroup ||
                  (selectedTaskGroup === "extraTask" && !selectedOtherCategory) ||
                  isLoading
            }
            className="px-6 py-2.5 text-[13px] font-bold bg-[#3F8CFF] text-white rounded-xl hover:bg-blue-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z" />
                </svg>
                Moving...
              </span>
            ) : (
              <>
                <FiArrowRight className="w-3.5 h-3.5" />
                Move Task
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MoveTaskModal;
