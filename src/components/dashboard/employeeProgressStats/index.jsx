import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserStatsChecking } from "../../../api/hooks/dashboard";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFolderPlus,
  FiTarget,
  FiCalendar,
} from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';

// Sortable Stats Card Component
const SortableStatsCard = ({ stat, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stat.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const Icon = stat.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onClick}
      className={`${stat.bgColor
        } rounded-xl p-4 flex flex-col items-center
       justify-center text-center cursor-pointer border-1 border-transparent
         ${stat.borderColor
        } transform group relative overflow-hidden transition-all duration-200
         ${isDragging
          ? "shadow-lg scale-105 rotate-2"
          : "hover:scale-105"
        }`}
    >
      <div className={`${stat.color} p-3 rounded-lg mb-3`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div
        className={`text-2xl font-bold ${stat.textColor} mb-2`}
      >
        {stat.value}
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">
        {stat.title}
      </p>
      <p className="text-xs text-gray-500">{stat.subtitle}</p>
      {/* Hover indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-xs text-gray-400">→</span>
      </div>
      {/* Drag indicator with listeners */}
      <div
        {...listeners}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-move"
      >
        <span className="text-xs text-gray-400">⋮⋮</span>
      </div>
    </div>
  );
};

const EmployeeProgressStats = ({ taskMonth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data: userStatsData,
    isLoading,
    refetch,
  } = useGetUserStatsChecking(taskMonth);

  // State for managing card order with localStorage persistence
  const [cardOrder, setCardOrder] = React.useState(null);
  const isInitialized = React.useRef(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Refetch data when component mounts and when window gains focus
  React.useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  // Get statistics from API
  const statistics = userStatsData?.statistics || {};
  const totalTasks = statistics.total || 0;
  const completedTasks = statistics.completed || 0;
  const inProgressTasks = statistics.inProgress || 0;
  const pendingTasks = statistics.pending || 0;
  const onReviewTasks = statistics.onReview || 0;
  const approvedTasks = statistics.approved || 0;
  const clientApprovedTasks = statistics.clientApproved || 0;
  const reworkTasks = statistics.rework || 0;
  const overdueTasks = statistics.overdue || 0;
  const todayTasks = statistics.today || 0;
  const upcoming3DaysTasks = statistics.upcoming3Days || 0;
  const unscheduledTasks = statistics.unscheduled || 0;
  const assignedProjects = statistics.assignedProjects || 0;
  const completionRate = statistics.completionRate || 0;

  // Function to handle overdue tasks click
  const handleOverdueTasksClick = React.useCallback(() => {
    navigate("/my-tasks?filter=overdue&taskMonth=" + taskMonth);
  }, [navigate, taskMonth]);

  // Function to handle drag end
  const handleDragEnd = React.useCallback(
    (event) => {
      const { active, over } = event;

      if (!over || !cardOrder) return;

      const activeId = active.id;
      const overId = over.id;

      if (activeId === overId) return;

      const oldIndex = cardOrder.indexOf(activeId);
      const newIndex = cardOrder.indexOf(overId);

      const newOrder = arrayMove(cardOrder, oldIndex, newIndex);

      setCardOrder(newOrder);
      localStorage.setItem(
        `employeeStatsCardOrder_${user?.id}`,
        JSON.stringify(newOrder)
      );
    },
    [cardOrder, user?.id]
  );

  // Function to handle stats card clicks
  const handleStatsClick = React.useCallback(
    (statType) => {
      switch (statType) {
        case "projects":
          navigate("/my-projects?taskMonth=" + taskMonth);
          break;
        case "total":
          navigate("/my-tasks?taskMonth=" + taskMonth);
          break;
        case "completed":
          navigate("/my-tasks?filter=completed&taskMonth=" + taskMonth);
          break;
        case "in-progress":
          navigate("/my-tasks?filter=in-progress&taskMonth=" + taskMonth);
          break;
        case "pending":
          navigate("/my-tasks?filter=pending&taskMonth=" + taskMonth);
          break;
        case "on-review":
          navigate("/my-tasks?filter=on-review&taskMonth=" + taskMonth);
          break;
        case "approved":
          navigate("/my-tasks?filter=approved&taskMonth=" + taskMonth);
          break;
        case "client-approved":
          navigate("/my-tasks?filter=client-approved&taskMonth=" + taskMonth);
          break;
        case "re-work":
          navigate("/my-tasks?filter=re-work&taskMonth=" + taskMonth);
          break;
        case "monthly-rework":
          navigate("/my-tasks?filter=monthly-rework&taskMonth=" + taskMonth);
          break;
        case "unscheduled":
          navigate("/my-tasks?filter=unscheduled&taskMonth=" + taskMonth);
          break;
        default:
          break;
      }
    },
    [navigate, taskMonth]
  );

  const stats = React.useMemo(
    () => [
      // {
      //   id: "assigned-projects",
      //   title: "Assigned Projects",
      //   value: assignedProjects,
      //   subtitle: `${assignedProjects} projects assigned`,
      //   icon: FiFolderPlus,
      //   color: "bg-blue-500",
      //   borderColor: "hover:border-blue-500",
      //   bgColor: "bg-blue-50",
      //   textColor: "text-blue-600",
      //   onClick: () => handleStatsClick("projects"),
      // },
      {
        id: "total-tasks",
        title: "Total Tasks",
        value: totalTasks,
        subtitle: `${completedTasks} completed`,
        icon: FiTarget,
        color: "bg-purple-500",
        borderColor: "hover:border-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
        onClick: () => handleStatsClick("total"),
      },
      {
        id: "in-progress",
        title: "In Progress",
        value: inProgressTasks,
        subtitle: `${pendingTasks} pending`,
        icon: FiClock,
        color: "bg-orange-500",
        borderColor: "hover:border-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
        onClick: () => handleStatsClick("in-progress"),
      },
      {
        title: "On Review",
        value: onReviewTasks,
        subtitle: "Awaiting approval",
        icon: FiCheckCircle,
        color: "bg-yellow-500",
        borderColor: "hover:border-yellow-500",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-600",
        onClick: () => handleStatsClick("on-review"),
      },
      // {
      //   title: "Content Approved",
      //   value: approvedTasks,
      //   subtitle: "Awaiting client review",
      //   icon: FiCheckCircle,
      //   color: "bg-teal-500",
      //   borderColor: "hover:border-teal-500",
      //   bgColor: "bg-teal-50",
      //   textColor: "text-teal-600",
      //   onClick: () => handleStatsClick("approved"),
      // },
      // {
      //   title: "Client Approved",
      //   value: clientApprovedTasks,
      //   subtitle: "Ready to publish",
      //   icon: FiCheckCircle,
      //   color: "bg-indigo-500",
      //   borderColor: "hover:border-indigo-500",
      //   bgColor: "bg-indigo-50",
      //   textColor: "text-indigo-600",
      //   onClick: () => handleStatsClick("client-approved"),
      // },
      {
        id: "re-work",
        title: "Re-work",
        value: reworkTasks,
        subtitle: "Needs revision",
        icon: FiAlertCircle,
        color: "bg-red-500",
        borderColor: "hover:border-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        onClick: () => handleStatsClick("re-work"),
      },
      {
        id: "monthly-rework",
        title: "Total Reworked",
        value: statistics.totalReworked || 0,
        subtitle: "Reworked this month",
        icon: FiTrendingUp,
        color: "bg-rose-500",
        borderColor: "hover:border-rose-500",
        bgColor: "bg-rose-50",
        textColor: "text-rose-600",
        onClick: () => handleStatsClick("monthly-rework"),
      },
      {
        id: "completed",
        title: "Completed",
        value: completedTasks,
        subtitle: "Work completed",
        icon: FiCheckCircle,
        color: "bg-green-500",
        borderColor: "hover:border-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-600",
        onClick: () => handleStatsClick("completed"),
      },
      {
        id: "overdue-tasks",
        title: "Overdue Tasks",
        value: overdueTasks,
        subtitle: "Need attention",
        icon: FiAlertCircle,
        color: "bg-red-500",
        borderColor: "hover:border-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        onClick: handleOverdueTasksClick,
      },
      {
        id: "todays-tasks",
        title: "Today's Tasks",
        value: todayTasks,
        subtitle: "Due today",
        icon: FiClock,
        color: "bg-indigo-500",
        borderColor: "hover:border-indigo-500",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-600",
        onClick: () => navigate("/today-tasks?taskMonth=" + taskMonth),
      },
      {
        id: "upcoming-3-days",
        title: "Upcoming 3 Days",
        value: upcoming3DaysTasks,
        subtitle: "Due soon",
        icon: FiCalendar,
        color: "bg-cyan-500",
        borderColor: "hover:border-cyan-500",
        bgColor: "bg-cyan-50",
        textColor: "text-cyan-600",
        onClick: () =>
          navigate("/my-tasks?filter=upcoming&taskMonth=" + taskMonth),
      },
    ],
    [
      assignedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      reworkTasks,
      statistics.totalReworked,
      overdueTasks,
      todayTasks,
      upcoming3DaysTasks,
      handleStatsClick,
      handleOverdueTasksClick,
      navigate,
      taskMonth,
    ]
  );

  // Initialize and maintain card order
  React.useEffect(() => {
    if (stats.length > 0) {
      const savedOrder = localStorage.getItem(
        `employeeStatsCardOrder_${user?.id}`
      );

      let finalOrder;
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          // Get IDs of all currently available stats
          const currentStatsIds = stats.map(s => (s.id || s.title));

          // Filter saved order to only include IDs/titles that still exist
          const validOrder = parsedOrder.filter((id) =>
            currentStatsIds.includes(id)
          );

          // Find stats that are in code but NOT in saved order (newly added cards)
          const newStatsIds = currentStatsIds.filter(id => !validOrder.includes(id));

          if (newStatsIds.length > 0 || parsedOrder.length !== validOrder.length) {
            finalOrder = [...validOrder, ...newStatsIds];
            // Update localStorage if we found new items or removed invalid ones
            localStorage.setItem(
              `employeeStatsCardOrder_${user?.id}`,
              JSON.stringify(finalOrder)
            );
          } else {
            finalOrder = validOrder;
          }
        } catch (error) {
          finalOrder = stats.map((stat) => (stat.id || stat.title));
        }
      } else {
        finalOrder = stats.map((stat) => (stat.id || stat.title));
      }

      setCardOrder(prev => {
        // Only trigger state update if order actually changed to avoid infinite loops
        if (JSON.stringify(prev) !== JSON.stringify(finalOrder)) {
          return finalOrder;
        }
        return prev;
      });
      isInitialized.current = true;
    }
  }, [stats, user?.id]);

  // Get ordered stats based on saved order
  const orderedStats = React.useMemo(() => {
    if (!cardOrder || !stats.length) return stats;

    // Create a map for O(1) lookup
    const statsMap = new Map(stats.map((stat) => [stat.id, stat]));

    return cardOrder.map((id) => statsMap.get(id)).filter(Boolean);
  }, [cardOrder, stats]);

  if (isLoading) {
    return (
      <div className="px-4 col-span-7 bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 col-span-7 bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
      <div className="flexBetween mb-4">
        <h4 className="font-semibold text-lg text-gray-800">
          My Task Progress
        </h4>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {completionRate}%
          </div>
          <div className="text-xs text-gray-500">Task Completion</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Task Completion Progress</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Task Statistics Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cardOrder || []} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2 flex-1">
            {orderedStats.map((stat) => (
              <SortableStatsCard
                key={stat.id}
                stat={stat}
                onClick={stat.onClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Overdue Tasks Alert */}
      {overdueTasks > 0 && (
        <div
          onClick={handleOverdueTasksClick}
          className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 cursor-pointer hover:bg-red-100 transition-colors duration-200"
        >
          <div className="flex items-center justify-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {overdueTasks} overdue task{overdueTasks > 1 ? "s" : ""} - Please
              review and update these tasks
            </span>
            <span className="text-xs text-red-600 ml-2">→ Click to view</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {/* {totalTasks === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">📊</div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No tasks assigned yet
          </h3>
          <p className="text-gray-500 text-sm">
            Your task statistics will appear here once tasks are assigned.
          </p>
        </div>
      )} */}
    </div>
  );
};

export default EmployeeProgressStats;
