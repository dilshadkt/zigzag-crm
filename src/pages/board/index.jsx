import React, { useState, useEffect } from "react";
import {
  useGetEmployeeTasks,
  useGetAllCompanyTasks,
  useCreateTaskFromBoard,
  useUpdateTaskOrder,
  useGetEmployeeProjects,
  useCompanyProjects,
} from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useQueryClient } from "@tanstack/react-query";
import { updateTaskById } from "../../api/service";
import socketService from "../../services/socketService";
import Task from "../../components/shared/task";
import Header from "../../components/shared/header";
import { useNavigate } from "react-router-dom";
import MonthSelector from "../../components/shared/MonthSelector";
import { getCurrentMonthKey } from "../../lib/dateUtils";
import AddTask from "../../components/projects/addTask";
import { uploadSingleFile } from "../../api/service";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";
import { assetPath } from "../../utils/assetPath";

// Status configuration
const statusConfig = {
  todo: {
    title: "Active Tasks",
    color: "bg-orange-100 text-orange-800",
  },
  "in-progress": {
    title: "In Progress",
    color: "bg-blue-100 text-blue-800",
  },
  "on-review": {
    title: "On Review",
    color: "bg-purple-100 text-purple-800",
  },
  "on-hold": {
    title: "On Hold",
    color: "bg-yellow-100 text-yellow-800",
  },
  "re-work": {
    title: "Re-work",
    color: "bg-red-100 text-red-800",
  },
  approved: {
    title: "Approved",
    color: "bg-emerald-100 text-emerald-800",
  },
  "client-approved": {
    title: "Client Approved",
    color: "bg-teal-100 text-teal-800",
  },
  completed: {
    title: "Completed",
    color: "bg-green-100 text-green-800",
  },
};

const DraggableTask = ({ task, onClick, index }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        taskId: task._id,
        sourceStatus: task.status,
        sourceIndex: index,
      })
    );
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    e.currentTarget.style.opacity = "0.7";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setIsDragging(false);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="transition-opacity duration-200 ease-out cursor-grab active:cursor-grabbing"
      style={{
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <Task task={task} isBoardView={true} onClick={() => onClick(task)} />
    </div>
  );
};

const DropZone = ({ onDrop, position, status, isVisible }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    const taskDataString = e.dataTransfer.getData("application/json");
    if (taskDataString) {
      try {
        const taskData = JSON.parse(taskDataString);
        onDrop(taskData, status, position);
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`h-2 transition-all duration-200 ease-out ${
        isOver ? "bg-blue-300 rounded-full mx-2" : "bg-transparent"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
};

const Droppable = ({ id, title, children, onDrop, tasks }) => {
  const [isOver, setIsOver] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    const taskData = e.dataTransfer.types.includes("application/json");
    if (taskData) {
      e.dataTransfer.dropEffect = "move";
      setIsOver(true);

      try {
        const taskDataString = e.dataTransfer.getData("application/json");
        if (taskDataString) {
          setDraggedTask(JSON.parse(taskDataString));
        }
      } catch (error) {
        // Ignore parsing errors during drag over
      }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOver(false);
      setDraggedTask(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    setDraggedTask(null);

    const taskDataString = e.dataTransfer.getData("application/json");
    if (taskDataString) {
      try {
        const taskData = JSON.parse(taskDataString);
        onDrop(taskData, id, tasks.length);
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    }
  };

  const childrenArray = React.Children.toArray(children);
  const config = statusConfig[id];

  return (
    <div
      className={`flex-shrink-0 w-80 rounded-lg p-4 transition-all duration-200 ease-out
                  ${
                    isOver
                      ? "bg-blue-50 border-2 border-blue-300"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-droppable-id={id}
    >
      <div
        className={`font-medium text-sm text-center sticky top-0 z-50 py-2 px-4 rounded-lg mb-4 ${
          config?.color || "bg-gray-200 text-gray-800"
        }`}
      >
        {title}
      </div>
      <div
        className="space-y-1 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2"
        data-droppable-id={id}
      >
        <DropZone
          onDrop={onDrop}
          position={0}
          status={id}
          isVisible={isOver && draggedTask?.sourceStatus !== id}
        />

        {childrenArray.map((child, index) => (
          <React.Fragment key={child.key || index}>
            {child}
            <DropZone
              onDrop={onDrop}
              position={index + 1}
              status={id}
              isVisible={isOver}
            />
          </React.Fragment>
        ))}

        {childrenArray.length === 0 && (
          <DropZone
            onDrop={onDrop}
            position={0}
            status={id}
            isVisible={isOver}
          />
        )}
      </div>
    </div>
  );
};

const Board = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [showModalTask, setShowModalTask] = useState(false);

  // Permission check for creating tasks
  const canCreateTask =
    user?.role === "company-admin" || hasPermission("tasks", "create");

  // Use different hooks based on user role
  const { data: employeeTasksData, isLoading: isLoadingEmployeeTasks } =
    useGetEmployeeTasks(user?.role !== "company-admin" ? user?._id : null);

  const { data: companyTasksData, isLoading: isLoadingCompanyTasks } =
    useGetAllCompanyTasks(
      user?.role === "company-admin" ? user?.company : null,
      selectedMonth
    );

  // Use different project hooks based on user role
  const { data: projectsData } =
    user?.role === "company-admin"
      ? useCompanyProjects(user?.company)
      : useGetEmployeeProjects(user?._id);
  const { mutate: updateOrder } = useUpdateTaskOrder();
  const { mutate: createTask, isLoading: isCreatingTask } =
    useCreateTaskFromBoard(() => {
      setShowModalTask(false);
    });

  // Get tasks based on user role
  const tasks =
    user?.role === "company-admin"
      ? companyTasksData?.tasks || []
      : employeeTasksData?.tasks || [];

  // Listen for real-time task status changes
  useEffect(() => {
    const handleTaskStatusChange = (data) => {
      console.log("📋 Task status changed in board:", data);

      // Refresh the appropriate query based on user role
      if (user?.role === "company-admin") {
        queryClient.invalidateQueries([
          "allCompanyTasks",
          user?.company,
          selectedMonth,
        ]);
      } else {
        queryClient.invalidateQueries(["employeeTasks", user?._id]);
      }

      // Also invalidate tasks on review query when status changes to/from "on-review"
      if (data.newStatus === "on-review" || data.oldStatus === "on-review") {
        queryClient.invalidateQueries(["tasksOnReview"]);
      }

      // Show a toast notification for task status changes
      if (data.updatedBy && data.updatedBy._id !== user?._id) {
        // Only show notification if it wasn't the current user who changed the status
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full";
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div>
              <div class="font-medium">Task Status Updated</div>
              <div class="text-sm opacity-90">"${data.taskTitle}" moved to ${data.newStatus} by ${data.updatedBy.name}</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
          notification.classList.remove("translate-x-full");
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
          notification.classList.add("translate-x-full");
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 5000);
      }
    };

    const handleNewNotification = (data) => {
      console.log("🔔 New notification in board:", data);
      // Refresh if it's a task-related notification
      if (data.type === "task_review" || data.type === "task_updated") {
        if (user?.role === "company-admin") {
          queryClient.invalidateQueries([
            "allCompanyTasks",
            user?.company,
            selectedMonth,
          ]);
        } else {
          queryClient.invalidateQueries(["employeeTasks", user?._id]);
        }
      }
    };

    // Set up socket listeners
    socketService.onTaskStatusChange(handleTaskStatusChange);
    socketService.onNewNotification(handleNewNotification);

    // Cleanup listeners on unmount
    return () => {
      socketService.offTaskStatusChange(handleTaskStatusChange);
      socketService.offNewNotification(handleNewNotification);
    };
  }, [queryClient, user?.role, user?.company, user?._id, selectedMonth]);

  const projects =
    user?.role === "company-admin"
      ? projectsData || []
      : projectsData?.projects || [];

  // Extract unique assignees from tasks
  const assignees = React.useMemo(() => {
    const users = {};
    tasks.forEach((task) => {
      (task.assignedTo || []).forEach((user) => {
        if (user && user._id) {
          users[user._id] = user;
        }
      });
    });
    return Object.values(users);
  }, [tasks]);

  // Filter tasks based on selected project, priority, month, and assignee
  const filteredTasks = tasks.filter((task) => {
    // Only show active tasks
    const isActive = task.active !== false; // Show tasks that are active or don't have active field

    // Handle project filtering - include board tasks when "all" is selected
    let projectMatch = false;
    if (selectedProject === "all") {
      // Show all tasks including board tasks (project: null) and project tasks
      projectMatch = true;
    } else if (selectedProject === "other") {
      // Show only board tasks (project: null) when "other" is selected
      projectMatch = !task.project;
    } else {
      // Show tasks for specific project
      projectMatch = task.project?._id === selectedProject;
    }

    const priorityMatch =
      selectedPriority === "all" ||
      task.priority?.toLowerCase() === selectedPriority.toLowerCase();
    const monthMatch = task.taskMonth === selectedMonth;
    const assigneeMatch =
      selectedAssignee === "all" ||
      (task.assignedTo &&
        task.assignedTo.some((user) => user._id === selectedAssignee));

    return (
      isActive && projectMatch && priorityMatch && monthMatch && assigneeMatch
    );
  });

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setSelectedPriority(e.target.value);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleAddTask = async (values, { resetForm }) => {
    try {
      const updatedValues = cleanTaskData(values);
      updatedValues.creator = user?._id;

      // Process attachments if any
      if (values?.attachments && values.attachments.length > 0) {
        const processedAttachments = await processAttachments(
          values.attachments,
          uploadSingleFile
        );
        updatedValues.attachments = processedAttachments;
      }

      // Handle project field
      if (values.project === "other" || !values.project) {
        updatedValues.project = null;
        // Remove project-specific fields for "Other" project
        delete updatedValues.taskGroup;
        delete updatedValues.extraTaskWorkType;
        delete updatedValues.taskFlow;
      }

      // Create the task
      createTask(updatedValues, {
        onSuccess: () => {
          resetForm();
        },
        onError: (error) => {
          console.error("Failed to create task:", error);
          alert("Failed to create task. Please try again.");
        },
      });
    } catch (error) {
      console.error("Error processing task data:", error);
      alert("Failed to process task data. Please try again.");
    }
  };

  // Group tasks by status
  const tasksByStatus = {
    todo: filteredTasks.filter((task) => task.status === "todo"),
    "in-progress": filteredTasks.filter(
      (task) => task.status === "in-progress"
    ),
    completed: filteredTasks.filter((task) => task.status === "completed"),
    "on-review": filteredTasks.filter((task) => task.status === "on-review"),
    "on-hold": filteredTasks.filter((task) => task.status === "on-hold"),
    "re-work": filteredTasks.filter((task) => task.status === "re-work"),
    approved: filteredTasks.filter((task) => task.status === "approved"),
    "client-approved": filteredTasks.filter(
      (task) => task.status === "client-approved"
    ),
  };

  const handleTaskUpdate = async (taskId, newStatus, newOrder = null) => {
    try {
      const updateData = { status: newStatus };
      if (newOrder !== null) {
        updateData.order = newOrder;
      }

      await updateTaskById(taskId, updateData);
      if (user?.role === "company-admin") {
        queryClient.invalidateQueries([
          "allCompanyTasks",
          user?.company,
          selectedMonth,
        ]);
      } else {
        queryClient.invalidateQueries(["employeeTasks", user?._id]);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task status. Please try again.");
    }
  };

  const handleTaskDrop = async (taskData, targetStatus, targetPosition) => {
    const { taskId, sourceStatus, sourceIndex } = taskData;

    // Optimistically update the UI based on user role
    const queryKey =
      user?.role === "company-admin"
        ? ["allCompanyTasks", user?.company, selectedMonth]
        : ["employeeTasks", user?._id];

    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData || !oldData.tasks) return oldData;

      const updatedTasks = oldData.tasks.map((task) => {
        if (task._id === taskId) {
          return {
            ...task,
            status: targetStatus,
          };
        }
        return task;
      });

      return {
        ...oldData,
        tasks: updatedTasks,
      };
    });

    try {
      if (sourceStatus === targetStatus) {
        // Same column reordering
        const targetTasks = tasksByStatus[targetStatus];
        const reorderedTasks = [...targetTasks];
        const [movedTask] = reorderedTasks.splice(sourceIndex, 1);
        const adjustedPosition =
          targetPosition > sourceIndex ? targetPosition - 1 : targetPosition;
        reorderedTasks.splice(adjustedPosition, 0, movedTask);

        // Update order for affected tasks
        reorderedTasks.forEach((task, index) => {
          updateOrder({ taskId: task._id, newOrder: index });
        });
      } else {
        // Different column - update status
        await handleTaskUpdate(taskId, targetStatus, targetPosition);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      if (user?.role === "company-admin") {
        queryClient.invalidateQueries([
          "allCompanyTasks",
          user?.company,
          selectedMonth,
        ]);
      } else {
        queryClient.invalidateQueries(["employeeTasks", user?._id]);
      }
      alert("Failed to update task. Please try again.");
    }
  };

  if (isLoadingEmployeeTasks || isLoadingCompanyTasks) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="col-span-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flexBetween">
        <Header>Task Board</Header>
        <div className=" hidden md:flex gap-3">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
          <div className="relative">
            <select
              value={selectedProject}
              onChange={handleProjectChange}
              className="appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="all">All Projects</option>
              {projects?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
              <option value="other">Other Tasks</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedPriority}
              onChange={handlePriorityChange}
              className="appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {user?.role === "company-admin" && (
            <div className="relative">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer hover:border-gray-300 transition-colors"
              >
                <option value="all">All Assignees</option>
                {assignees.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : user.email}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          )}

          {canCreateTask && (
            <button
              onClick={() => setShowModalTask(true)}
              className="h-fit px-5 p-2 bg-blue-600 cursor-pointer text-sm text-white rounded-lg"
            >
              + Add Task
            </button>
          )}
          <button
            onClick={() => {
              if (user?.role === "company-admin") {
                queryClient.invalidateQueries([
                  "allCompanyTasks",
                  user?.company,
                  selectedMonth,
                ]);
              } else {
                queryClient.invalidateQueries(["employeeTasks", user?._id]);
              }
            }}
            className="p-2 bg-white h-fit hover:bg-gray-50 transition-colors rounded-lg border border-gray-200"
          >
            <img
              src={assetPath("icons/refresh.svg")}
              alt="Refresh"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>

      {/* Board View */}
      <div
        className="flex h-[calc(100vh-180px)] md:mt-4 overflow-x-auto 
      pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
       project-details-scroll"
      >
        {Object.entries(statusConfig).map(([status, config]) => {
          const tasks = tasksByStatus[status] || [];
          const taskCount = tasks.length;

          return (
            <Droppable
              key={status}
              id={status}
              title={`${config.title} (${taskCount})`}
              onDrop={handleTaskDrop}
              tasks={tasks}
            >
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <DraggableTask
                    key={task._id}
                    task={task}
                    index={index}
                    onClick={(task) => {
                      if (task.project) {
                        navigate(`/projects/${task.project._id}/${task._id}`);
                      } else {
                        // For board tasks without project, navigate to task details directly
                        navigate(`/tasks/${task._id}`);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm">
                  No {config.title.toLowerCase()}
                </div>
              )}
            </Droppable>
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
        // You may want to pass other props as needed
      />
    </div>
  );
};

export default Board;
