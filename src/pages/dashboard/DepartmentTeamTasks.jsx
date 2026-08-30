import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import AddTask from "../../components/projects/addTask";
import BoardSkeleton from "../board/components/BoardSkeleton";
import DroppableColumn from "../board/components/DroppableColumn";
import DraggableTask from "../board/components/DraggableTask";
import { statusConfig } from "../board/components/StatusConfig";
import DepartmentTeamFilters from "./components/DepartmentTeamFilters";
import { useDepartmentTeamBoard } from "./hooks/useDepartmentTeamBoard";

const DepartmentTeamTasks = () => {
  const navigate = useNavigate();
  const {
    departments,
    activeDepartment,
    activeDepartmentId,
    setSelectedDepartmentId,
    teamEmployees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    viewMode,
    setViewMode,
    selectedProject,
    setSelectedProject,
    selectedPriority,
    setSelectedPriority,
    selectedMonth,
    setSelectedMonth,
    selectedTypes,
    setSelectedTypes,
    searchQuery,
    setSearchQuery,
    showModalTask,
    setShowModalTask,
    canCreateTask,
    isLoading,
    tasksByStatus,
    projects,
    teams,
    isCreatingTask,
    handleRefresh,
    handleAddTask,
    handleTaskDrop,
    addTaskInitialValues,
  } = useDepartmentTeamBoard();

  const handleTaskClick = (task) => {
    if (task?.parentTask) {
      const parentId = task.parentTask._id || task.parentTask;
      if (task.project?._id) {
        navigate(`/projects/${task.project._id}/${parentId}`);
      } else {
        navigate(`/tasks/${parentId}`);
      }
      return;
    }

    if (task.project?._id) {
      navigate(`/projects/${task.project._id}/${task._id}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  if (isLoading) {
    return <BoardSkeleton />;
  }

  return (
    <div className="col-span-4 overflow-hidden h-full flex flex-col gap-y-3">
      <div className="flex items-center gap-3 px-1">
        <button
          type="button"
          onClick={() => navigate("/department-dashboard")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#3F8CFF] hover:border-blue-200 transition-all shrink-0"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <p className="text-[12px] text-[#91929E]">
          {activeDepartment?.name || "Department"} ·{" "}
          {viewMode === "today" ? "Today's tasks" : "Monthly board view"}
        </p>
      </div>

      <DepartmentTeamFilters
        departments={departments}
        activeDepartmentId={activeDepartmentId}
        onDepartmentChange={setSelectedDepartmentId}
        teamEmployees={teamEmployees}
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeChange={setSelectedEmployeeId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        projects={projects}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        canCreateTask={canCreateTask}
        onAddTaskClick={() => setShowModalTask(true)}
        onRefresh={handleRefresh}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex h-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 project-details-scroll">
        {Object.entries(statusConfig).map(([status, config]) => {
          const columnTasks = tasksByStatus[status] || [];

          return (
            <DroppableColumn
              key={status}
              id={status}
              title={`${config.title} (${columnTasks.length})`}
              onDrop={handleTaskDrop}
              tasks={columnTasks}
            >
              {columnTasks.length > 0 ? (
                columnTasks.map((task, index) => (
                  <DraggableTask
                    key={task._id}
                    task={task}
                    index={index}
                    onClick={handleTaskClick}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm">
                  No {config.title.toLowerCase()}
                </div>
              )}
            </DroppableColumn>
          );
        })}
      </div>

      <AddTask
        isOpen={showModalTask}
        setShowModalTask={setShowModalTask}
        projects={projects}
        teams={teams}
        initialValues={addTaskInitialValues}
        onSubmit={handleAddTask}
        selectedMonth={selectedMonth}
        isLoading={isCreatingTask}
        showProjectSelection={true}
      />
    </div>
  );
};

export default DepartmentTeamTasks;
