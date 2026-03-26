import React from "react";
import MonthSelector from "../../../shared/MonthSelector";
import PrimaryButton from "../../../shared/buttons/primaryButton";
import { usePermissions } from "../../../../hooks/usePermissions";
import list from "../../../../assets/icons/list.svg";
import board from "../../../../assets/icons/board.svg";
import { Plus } from "lucide-react";

const ActionButton = ({
  selectedMonth,
  onMonthChange,
  activeProject,
  setShowModalProject,
  setShowModalTask,
  handleRefresh,
  viewMode,
  setViewMode,
  isTimelineExpanded,
  setIsTimelineExpanded,
  showSubtasks,
  setShowSubtasks,
}) => {
  const { hasPermission } = usePermissions();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MonthSelector
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        activeProject={activeProject}
      />



      <div className="flex gap-2">
        <div className="flex gap-x-2">
          {hasPermission("projects", "create") && (
            <PrimaryButton
              icon={<Plus size={18} />}
              title={"Add Project"}
              onclick={() => setShowModalProject(true)}
              className={
                "text-gray-700 font-medium hover:bg-[#3f8cff] hover:text-white bg-white px-5"
              }
            />
          )}
          {hasPermission("tasks", "create") && (
            <PrimaryButton
              disable={!activeProject}
              icon={<Plus size={18} />}
              title={"Add Task"}
              onclick={() => setShowModalTask(true)}
              className={
                "text-gray-700 font-medium hover:bg-[#3f8cff] hover:text-white bg-white px-5"
              }
            />
          )}
        </div>
        <PrimaryButton
          icon={"/icons/refresh.svg"}
          className={"bg-white  transition-colors"}
          onclick={handleRefresh}
        />
        <PrimaryButton
          icon={"/icons/timeline.svg"}
          className={`transition-colors ${viewMode === "timeline"
            ? "bg-blue-50 border-blue-300"
            : "bg-white hover:bg-gray-50"
            }`}
          onclick={() => {
            if (viewMode === "timeline") {
              setViewMode("board");
              setIsTimelineExpanded(false);
            } else {
              setViewMode("timeline");
            }
          }}
        />
        <button
          onClick={() => setShowSubtasks(!showSubtasks)}
          className={`p-2 rounded-lg border transition-colors ${showSubtasks
            ? "bg-blue-50 border-blue-300 text-blue-600"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          title={showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {showSubtasks ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            )}
          </svg>
        </button>
        <PrimaryButton
          icon={viewMode === "list" ? board : list}
          className={"bg-white hover:bg-gray-50 transition-colors"}
          onclick={() => {
            setViewMode(viewMode === "list" ? "board" : "list");
            setIsTimelineExpanded(false);
          }}
        />

      </div>
    </div>
  );
};

export default ActionButton;
