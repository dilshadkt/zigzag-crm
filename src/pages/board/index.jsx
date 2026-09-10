import React from "react";

// Components
import AddTask from "../../components/projects/addTask";
import BoardFilters from "./components/BoardFilters";
import BoardStatusColumn from "./components/BoardStatusColumn";
import { statusConfig } from "./components/StatusConfig";

// Hooks
import { useBoard } from "./hooks/useBoard";

const Board = () => {
  const {
    user,
    selectedProject,
    setSelectedProject,
    selectedPriority,
    setSelectedPriority,
    selectedMonth,
    setSelectedMonth,
    selectedAssignee,
    setSelectedAssignee,
    selectedTypes,
    setSelectedTypes,
    searchQuery,
    setSearchQuery,
    showModalTask,
    setShowModalTask,
    canCreateTask,
    boardFilters,
    columnsEnabled,
    counts,
    projects,
    assignees,
    isCreatingTask,
    handleRefresh,
    handleAddTask,
    handleTaskDrop,
  } = useBoard();

  return (
    <div className="col-span-4 overflow-hidden h-full flex flex-col">
      <BoardFilters
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        projects={projects}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        user={user}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        assignees={assignees}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        canCreateTask={canCreateTask}
        onAddTaskClick={() => setShowModalTask(true)}
        onRefresh={handleRefresh}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex h-full  overflow-x-auto pb-2 scrollbar-thin 
      scrollbar-thumb-gray-300 scrollbar-track-gray-100 project-details-scroll">
        {Object.entries(statusConfig).map(([status, config]) => (
          <BoardStatusColumn
            key={status}
            status={status}
            config={config}
            filters={boardFilters}
            enabled={columnsEnabled}
            count={counts[status] || 0}
            onDrop={handleTaskDrop}
          />
        ))}
      </div>

      <AddTask
        isOpen={showModalTask}
        setShowModalTask={setShowModalTask}
        projects={projects}
        onSubmit={handleAddTask}
        teams={assignees}
        selectedMonth={selectedMonth}
        isLoading={isCreatingTask}
        showProjectSelection={true}
      />
    </div>
  );
};

export default Board;
