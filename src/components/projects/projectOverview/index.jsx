import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Task from "../../shared/task";
import { useNavigate, useParams } from "react-router-dom";
import FilterMenu from "../FilterMenu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import list from "../../../assets/icons/list.svg";
import board from "../../../assets/icons/board.svg";
import { updateTaskById } from "../../../api/service";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useUpdateTaskOrder } from "../../../api/hooks";

const SortableTask = ({ task, isBoardView, onClick, projectId, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Task
        task={task}
        isBoardView={isBoardView}
        onClick={() => onClick ? onClick(task) : null}
        projectId={projectId}
        index={index}
      />
    </div>
  );
};

const Droppable = ({ id, title, children }) => {
  return (
    <div
      className="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4"
      id={id}
    >
      <div className="font-medium text-gray-800 mb-4 bg-gray-200 text-sm text-center font-medium sticky top-0 z-50 py-2 px-4 rounded-lg">
        {title}
      </div>
      <div 
        className="space-y-3 min-h-[200px]"
        data-droppable-id={id}
      >
        {children}
      </div>
    </div>
  );
};

const ProjectOverView = ({ currentProject }) => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isBoardView, setIsBoardView] = useState(true); // Default to board view for drag and drop
  const [activeId, setActiveId] = useState(null);
  const { mutate: updateOrder } = useUpdateTaskOrder(currentProject?._id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter task based on the process and active filters
  const filterTasks = (tasks) => {
    if (!activeFilters) return tasks;

    return tasks.filter(task => {
      // Filter by status
      if (activeFilters.status.length > 0 && !activeFilters.status.includes(task.status)) {
        return false;
      }

      // Filter by priority
      if (activeFilters.priority.length > 0 && !activeFilters.priority.includes(task.priority)) {
        return false;
      }

      // Filter by date range
      if (activeFilters.dateRange.startDate && activeFilters.dateRange.endDate) {
        const taskDate = new Date(task.dueDate);
        const startDate = new Date(activeFilters.dateRange.startDate);
        const endDate = new Date(activeFilters.dateRange.endDate);
        if (taskDate < startDate || taskDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  const activeTasks = filterTasks(currentProject?.tasks?.filter(
    (task) => task?.status === "todo"
  )) || [];
  
  const progressTasks = filterTasks(currentProject?.tasks?.filter(
    (task) => task?.status === "in-progress"
  )) || [];
  
  const completedTasks = filterTasks(currentProject?.tasks?.filter(
    (task) => task?.status === "completed"
  )) || [];

  const handleNavigateToTask = (task) => {
    navigate(`/projects/${projectName}/${task?._id}`);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleTaskUpdate = async (taskId, newStatus) => {
    try {
      await updateTaskById(taskId, { status: newStatus });
      // Invalidate and refetch the project data to update the UI
      queryClient.invalidateQueries(['project', projectName]);
    } catch (error) {
      console.error('Failed to update task:', error);
      // Provide feedback to the user
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = findTaskById(active.id);
    if (!activeTask) return;

    // Determine the new status based on the drop target
    let newStatus;
    
    // Check if dropped directly on a droppable container
    if (over.id === 'todo' || over.id === 'in-progress' || over.id === 'completed') {
      newStatus = over.id;
    } else {
      // Check if dropped on a task in a specific container
      const overTask = findTaskById(over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Update task status if changed
    if (newStatus && newStatus !== activeTask.status) {
      handleTaskUpdate(active.id, newStatus);
    }

    // Update task order
    const tasks = [...activeTasks, ...progressTasks, ...completedTasks];
    const oldIndex = tasks.findIndex(task => task._id === active.id);
    const newIndex = tasks.findIndex(task => task._id === over.id);
    
    if (oldIndex !== newIndex) {
      updateOrder({ taskId: active.id, newOrder: newIndex });
    }
  };

  const findTaskById = (id) => {
    return [...activeTasks, ...progressTasks, ...completedTasks].find(
      (task) => task._id === id
    );
  };

  const renderListSection = (title, tasks) => (
    <>
      <div className="min-h-10 font-medium sticky top-0 z-50 text-gray-800 rounded-xl bg-[#E6EDF5] flexCenter">
        {title}
      </div>
      {tasks?.map((task) => (
        <Task onClick={handleNavigateToTask} key={task._id} task={task} isBoardView={isBoardView} />
      ))}
    </>
  );

  return (
    <div className="col-span-4 overflow-hidden flex flex-col">
      <div className="flexBetween">
        <h3 className="text-lg font-medium text-gray-800">Tasks</h3>
        <div className="flex gap-2">
          <PrimaryButton 
            icon={!isBoardView ? list : board} 
            className={"bg-white hover:bg-gray-50 transition-colors"} 
            onclick={() => setIsBoardView(!isBoardView)}
          />
          <PrimaryButton 
            icon={"/icons/filter.svg"} 
            className={"bg-white hover:bg-gray-50 transition-colors"} 
            onclick={() => setShowFilter(true)}
          />
        </div>
      </div>

      {isBoardView ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full mt-4 overflow-x-auto pb-4">
            <Droppable id="todo" title="Active Tasks">
              <SortableContext
                items={activeTasks.map(task => task._id)}
                strategy={verticalListSortingStrategy}
              >
                {activeTasks.length > 0 ? (
                  activeTasks.map((task, index) => (
                    <SortableTask
                      key={task._id}
                      task={task}
                      isBoardView={true}
                      onClick={handleNavigateToTask}
                      projectId={currentProject?._id}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No active tasks</div>
                )}
              </SortableContext>
            </Droppable>

            <Droppable id="in-progress" title="In Progress">
              <SortableContext
                items={progressTasks.map(task => task._id)}
                strategy={verticalListSortingStrategy}
              >
                {progressTasks.length > 0 ? (
                  progressTasks.map((task, index) => (
                    <SortableTask
                      key={task._id}
                      task={task}
                      isBoardView={true}
                      onClick={handleNavigateToTask}
                      projectId={currentProject?._id}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No in-progress tasks</div>
                )}
              </SortableContext>
            </Droppable>

            <Droppable id="completed" title="Completed">
              <SortableContext
                items={completedTasks.map(task => task._id)}
                strategy={verticalListSortingStrategy}
              >
                {completedTasks.length > 0 ? (
                  completedTasks.map((task, index) => (
                    <SortableTask
                      key={task._id}
                      task={task}
                      isBoardView={true}
                      onClick={handleNavigateToTask}
                      projectId={currentProject?._id}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No completed tasks</div>
                )}
              </SortableContext>
            </Droppable>

            {activeId && (
              <DragOverlay adjustScale={true}>
                <Task
                  task={findTaskById(activeId)}
                  isBoardView={true}
                />
              </DragOverlay>
            )}
          </div>
        </DndContext>
      ) : (
        <div className="flex flex-col h-full gap-y-4 mt-4 rounded-xl overflow-hidden overflow-y-auto">
          {renderListSection("Active Tasks", activeTasks)}
          {renderListSection("Progress", progressTasks)}
          {renderListSection("Completed", completedTasks)}
        </div>
      )}
      
      <FilterMenu 
        isOpen={showFilter} 
        setShowModalFilter={setShowFilter}
        onFilterChange={handleFilterChange}
      />    
    </div>
  );
};

export default ProjectOverView;