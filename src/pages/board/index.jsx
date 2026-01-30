import React from "react";
import { useNavigate } from "react-router-dom";

// Components
import AddTask from "../../components/projects/addTask";
import BoardFilters from "./components/BoardFilters";
import DroppableColumn from "./components/DroppableColumn";
import DraggableTask from "./components/DraggableTask";
import BoardSkeleton from "./components/BoardSkeleton";
import { statusConfig } from "./components/StatusConfig";

// Hooks
import { useBoard } from "./hooks/useBoard";

const Board = () => {
  const navigate = useNavigate();
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
    isLoading,
    tasksByStatus,
    projects,
    assignees,
    isCreatingTask,
    handleRefresh,
    handleAddTask,
    handleTaskDrop,
  } = useBoard();

  if (isLoading) {
    return <BoardSkeleton />;
  }

  return (
    <div className="col-span-4 overflow-hidden flex flex-col">
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

      <div className="flex h-[calc(100vh-180px)] md:mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 project-details-scroll">
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
                    onClick={(t) => {
                      if (t?.parentTask) {
                        navigate(t.project ? `/projects/${t.project._id}/${t.parentTask._id}` : `/tasks/${t.parentTask._id}`);
                      } else if (t.project) {
                        navigate(`/projects/${t.project._id}/${t._id}`);
                      } else {
                        navigate(`/tasks/${t._id}`);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm">No {config.title.toLowerCase()}</div>
              )}
            </DroppableColumn>
          );
        })}
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
