import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiTrendingUp,
  FiUsers,
  FiFolderPlus,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";
import { useGetCompanyStatsChecking } from "../../../api/hooks/dashboard";
import { MdBusinessCenter } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const CompanyProgressStats = ({ taskMonth }) => {
  // Boolean: true if the given taskMonth is the current calendar month (formatted as "YYYY-MM")
  const isCurrentMonth = React.useMemo(() => {
    if (!taskMonth) return false;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1 to get 1-12
    const currentMonth = `${year}-${String(month).padStart(2, "0")}`; // Format as "YYYY-MM"
    return currentMonth === taskMonth;
  }, [taskMonth]);

  const { companyId } = useAuth();

  const {
    data: companyStatsCheck,
    isLoading,
    refetch,
  } = useGetCompanyStatsChecking(companyId, taskMonth);

  const navigate = useNavigate();

  // State for managing card order with localStorage persistence
  const [cardOrder, setCardOrder] = React.useState(null);
  const isInitialized = React.useRef(false);

  // Refetch data when component mounts and when window gains focus
  React.useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);
  // Function to handle overdue tasks click
  const handleOverdueTasksClick = React.useCallback(() => {
    navigate("/company-tasks?filter=overdue&taskMonth=" + taskMonth);
  }, [navigate, taskMonth]);

  // Function to handle drag end
  const handleDragEnd = React.useCallback(
    (result) => {
      if (!result.destination || !cardOrder) return;

      const newOrder = Array.from(cardOrder);
      const [reorderedItem] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, reorderedItem);

      setCardOrder(newOrder);
      localStorage.setItem(
        `companyStatsCardOrder_${companyId}`,
        JSON.stringify(newOrder)
      );
    },
    [cardOrder, companyId]
  );

  // Function to handle stats card clicks
  const handleStatsClick = React.useCallback(
    (statType) => {
      switch (statType) {
        case "projects":
          navigate("/projects-analytics?taskMonth=" + taskMonth);
          break;
        case "tasks":
          navigate("/company-tasks?taskMonth=" + taskMonth);
          break;
        case "in-progress":
          navigate("/company-tasks?filter=in-progress&taskMonth=" + taskMonth);
          break;
        case "on-review":
          navigate("/task-on-review?taskMonth=" + taskMonth);
          break;
        case "approved":
          navigate("/client-review?taskMonth=" + taskMonth);
          break;
        case "client-approved":
          navigate("/task-on-publish");
          break;
        case "re-work":
          navigate("/company-tasks?filter=re-work&taskMonth=" + taskMonth);
          break;
        case "completed":
          navigate("/company-tasks?filter=completed&taskMonth=" + taskMonth);
          break;
        case "client-review":
          navigate("/client-review?taskMonth=" + taskMonth);
          break;
        case "employees":
          navigate("/employees");
          break;
        case "unscheduled":
          navigate("/company-tasks?filter=unscheduled&taskMonth=" + taskMonth);
          break;
        case "upcoming":
          navigate("/company-tasks?filter=upcoming&taskMonth=" + taskMonth);
          break;
        default:
          break;
      }
    },
    [navigate, taskMonth]
  );

  const stats = React.useMemo(() => {
    const allStats = [
      {
        id: "active-projects",
        title: "Active Projects",
        value: companyStatsCheck?.statistics?.activeProjects || 0,
        subtitle: `${
          companyStatsCheck?.statistics?.activeProjects || 0
        } active projects`,
        icon: FiFolderPlus,
        color: "bg-blue-500",
        borderColor: "hover:border-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
        onClick: () => handleStatsClick("projects"),
      },
      {
        id: "total-tasks",
        title: "Total Tasks",
        value: companyStatsCheck?.statistics?.total || 0,
        subtitle: `${companyStatsCheck?.statistics?.completed || 0} completed`,
        icon: FiTarget,
        color: "bg-purple-500",
        borderColor: "hover:border-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
        onClick: () => handleStatsClick("tasks"),
      },
      {
        id: "in-progress",
        title: "In Progress",
        value: companyStatsCheck?.statistics?.inProgress || 0,
        subtitle: `${companyStatsCheck?.statistics?.pending || 0} pending`,
        icon: FiClock,
        color: "bg-orange-500",
        borderColor: "hover:border-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
        onClick: () => handleStatsClick("in-progress"),
      },
      {
        id: "on-review",
        title: "On Review",
        value: companyStatsCheck?.statistics?.onReview || 0,
        subtitle: "Awaiting approval",
        icon: FiBarChart2,
        color: "bg-yellow-500",
        borderColor: "hover:border-yellow-500",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-600",
        onClick: () => handleStatsClick("on-review"),
      },
      {
        id: "content-approved",
        title: "Client Review Pending",
        value: companyStatsCheck?.statistics?.approved || 0,
        subtitle: "Awaiting client review",
        icon: FiCheckCircle,
        color: "bg-teal-500",
        borderColor: "hover:border-teal-500",
        bgColor: "bg-teal-50",
        textColor: "text-teal-600",
        onClick: () => handleStatsClick("client-review"),
      },
      {
        id: "client-approved",
        title: "Publishing Pending",
        value: companyStatsCheck?.statistics?.clientApproved || 0,
        subtitle: "Ready to publish",
        icon: MdBusinessCenter,
        color: "bg-indigo-500",
        borderColor: "hover:border-indigo-500",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-600",
        onClick: () => navigate("/task-on-publish"),
      },
      {
        id: "re-work",
        title: "Re-work",
        value: companyStatsCheck?.statistics?.rework || 0,
        subtitle: "Needs revision",
        icon: FiAlertCircle,
        color: "bg-red-500",
        borderColor: "hover:border-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        onClick: () => handleStatsClick("re-work"),
      },
      {
        id: "completed",
        title: "Completed ",
        value: companyStatsCheck?.statistics?.completed || 0,
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
        value: companyStatsCheck?.statistics?.overdue || 0,
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
        value: companyStatsCheck?.statistics?.today || 0,
        subtitle: "Due today",
        icon: FiCheckCircle,
        color: "bg-indigo-500",
        borderColor: "hover:border-indigo-500",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-600",
        onClick: () => navigate("/company-today-tasks?taskMonth=" + taskMonth),
      },
      {
        id: "upcoming-3-days",
        title: "Upcoming 3 Days",
        value: companyStatsCheck?.statistics?.upcoming3Days || 0,
        subtitle: "Due in 3 days",
        icon: FiCalendar,
        color: "bg-cyan-500",
        borderColor: "hover:border-cyan-500",
        bgColor: "bg-cyan-50",
        textColor: "text-cyan-600",
        onClick: () =>
          navigate("/company-tasks?filter=upcoming&taskMonth=" + taskMonth),
      },
      {
        id: "unscheduled-tasks",
        title: "Unscheduled Tasks",
        value: companyStatsCheck?.statistics?.unscheduled || 0,
        subtitle: "Need scheduling",
        icon: FiCalendar,
        color: "bg-gray-500",
        borderColor: "hover:border-gray-500",
        bgColor: "bg-gray-50",
        textColor: "text-gray-600",
        onClick: () => handleStatsClick("unscheduled"),
      },
    ];

    // If current month, show all stats; otherwise, only show specific stats
    if (isCurrentMonth) {
      return allStats;
    }

    // Stats to show when NOT current month
    const allowedIdsForPastMonths = [
      "on-review",
      "content-approved",
      "client-approved",
      "re-work",
      "overdue-tasks",
      "unscheduled-tasks",
    ];

    return allStats.filter((stat) => allowedIdsForPastMonths.includes(stat.id));
  }, [
    companyStatsCheck?.statistics,
    handleStatsClick,
    handleOverdueTasksClick,
    navigate,
    taskMonth,
    isCurrentMonth,
  ]);

  // Initialize card order on first load
  React.useEffect(() => {
    if (stats.length > 0 && !isInitialized.current) {
      const savedOrder = localStorage.getItem(
        `companyStatsCardOrder_${companyId}`
      );

      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          // Validate that all saved IDs still exist in current stats
          const validOrder = parsedOrder.filter((id) =>
            stats.some((stat) => stat.id === id)
          );
          // Add any new stats that weren't in the saved order
          const newStats = stats
            .filter((stat) => !validOrder.includes(stat.id))
            .map((stat) => stat.id);

          const finalOrder = [...validOrder, ...newStats];
          setCardOrder(finalOrder);
        } catch (error) {
          // If parsing fails, create default order
          const defaultOrder = stats.map((stat) => stat.id);
          setCardOrder(defaultOrder);
        }
      } else {
        // No saved order, create default
        const defaultOrder = stats.map((stat) => stat.id);
        setCardOrder(defaultOrder);
      }

      isInitialized.current = true;
    }
  }, [stats, companyId]);

  // Get ordered stats based on saved order
  const orderedStats = React.useMemo(() => {
    if (!cardOrder || !stats.length) return stats;

    // Create a map for O(1) lookup
    const statsMap = new Map(stats.map((stat) => [stat.id, stat]));

    return cardOrder.map((id) => statsMap.get(id)).filter(Boolean);
  }, [cardOrder, stats]);

  // Since the new data structure doesn't have workload distribution,
  // we'll create a simple distribution based on available data
  const workloadData = {
    high: companyStatsCheck?.statistics?.overdue || 0,
    medium: companyStatsCheck?.statistics?.inProgress || 0,
    low: companyStatsCheck?.statistics?.approved || 0,
  };
  const totalWorkload =
    workloadData.high + workloadData.medium + workloadData.low;

  // Loading state check - must be after all hooks
  if (isLoading) {
    // Match the number of shimmer cards to the stats that will be shown
    const placeholderCount =
      (stats && stats.length) || (isCurrentMonth ? 12 : 6);
    const placeholders = Array.from({ length: placeholderCount });

    return (
      <div className="px-4 col-span-7 bg-white h-full pb-3 pt-5 flex flex-col rounded-3xl">
        <div className="animate-pulse">
          {/* Header shimmer (title + completion) */}
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-12 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Progress bar shimmer */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <div className="h-3 w-32 bg-gray-100 rounded" />
              <div className="h-3 w-10 bg-gray-100 rounded" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-300 h-2 rounded-full w-1/2" />
            </div>
          </div>

          {/* Stats grid shimmer, matching the real grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-2">
            {placeholders.map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50 border border-gray-100"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 w-10 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
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
          Company Overview
        </h4>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">
            {companyStatsCheck?.statistics?.completionRate || 0}%
          </div>
          <div className="text-xs text-gray-500">Task Completion</div>
        </div>
      </div>
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Task Completion Progress</span>
          <span>{companyStatsCheck?.statistics?.completionRate || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${companyStatsCheck?.statistics?.completionRate || 0}%`,
            }}
          ></div>
        </div>
      </div>
      {/* Company Statistics Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stats-grid" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-2 flex-1 transition-colors duration-200 ${
                snapshot.isDraggingOver ? "bg-blue-50" : ""
              }`}
            >
              {orderedStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Draggable key={stat.id} draggableId={stat.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={stat.onClick}
                        className={`${
                          stat.bgColor
                        } rounded-xl p-4 flex flex-col items-center
                         justify-center text-center cursor-pointer border-1 border-transparent
                           ${
                             stat.borderColor
                           } transform group relative overflow-hidden transition-all duration-200
                           ${
                             snapshot.isDragging
                               ? "shadow-lg scale-105 rotate-2"
                               : "hover:scale-105"
                           }`}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div className={`${stat.color} p-3 rounded-lg mb-3`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div
                          className={`text-2xl font-bold ${stat.textColor} mb-2 `}
                        >
                          {stat.value}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1 ">
                          {stat.title}
                        </p>
                        <p className="text-xs text-gray-500">{stat.subtitle}</p>
                        {/* Hover indicator */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-xs text-gray-400">→</span>
                        </div>
                        {/* Drag indicator */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-xs text-gray-400">⋮⋮</span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CompanyProgressStats;
