import { useParams } from "react-router-dom";
import { useProjectDetails } from "../../api/hooks";
import { useMemo, useState, useEffect } from "react";
import ProjectHeader from "./components/ProjectHeader";
import NavigationTabs from "./components/NavigationTabs";
import OverviewTab from "./components/OverviewTab";
import TeamTab from "./components/TeamTab";
import TasksTab from "./components/TasksTab";
import SocialTab from "./components/SocialTab";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

const ProjectAnalyticsDetails = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Month selection state
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Load saved month for this project
  useEffect(() => {
    if (!projectId) return;
    const storageKey = `project-details-selected-date-${projectId}`;
    const savedDate = localStorage.getItem(storageKey);
    if (savedDate) {
      const parsed = new Date(savedDate);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
      }
    }
  }, [projectId]);

  const monthKey = `${selectedDate.getFullYear()}-${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  const {
    data: project,
    isLoading,
    isFetching,
  } = useProjectDetails(projectId || undefined, monthKey);

  // Normalize work details (handles aggregated structure or fallback)
  const workDetailsData = useMemo(() => {
    const standardTypes = [
      { key: "reels", label: "Reels" },
      { key: "poster", label: "Poster" },
      { key: "motionPoster", label: "Motion Poster" },
      { key: "shooting", label: "Shooting" },
      { key: "motionGraphics", label: "Motion Graphics" },
    ];

    const aggregated = project?.aggregatedWorkDetails;
    const workSourceArray = [];

    if (aggregated) {
      standardTypes.forEach(({ key, label }) => {
        if (aggregated[key]) {
          const total = aggregated[key].total || aggregated[key].count || 0;
          const remaining = aggregated[key].count ?? aggregated[key].total ?? 0;
          const completed = Math.max(0, total - remaining);
          if (total > 0 || completed > 0) {
            workSourceArray.push({
              key,
              label,
              total,
              completed,
              remaining,
            });
          }
        }
      });

      if (Array.isArray(aggregated.other)) {
        aggregated.other.forEach((item, index) => {
          const total = item.total || item.count || 0;
          const remaining = item.count ?? item.total ?? 0;
          const completed = Math.max(0, total - remaining);
          if (total > 0 || completed > 0) {
            workSourceArray.push({
              key: `other-${index}`,
              label: item.name || `Other ${index + 1}`,
              total,
              completed,
              remaining,
            });
          }
        });
      }
    } else if (
      Array.isArray(project?.workDetails) &&
      project.workDetails.length
    ) {
      // Fallback: aggregate from monthly work details
      const totalsMap = {};

      project.workDetails.forEach((month) => {
        [...standardTypes.map(({ key }) => key)].forEach((typeKey) => {
          if (month[typeKey]) {
            if (!totalsMap[typeKey]) {
              totalsMap[typeKey] = { total: 0, completed: 0, remaining: 0 };
            }
            totalsMap[typeKey].total += month[typeKey].total || 0;
            totalsMap[typeKey].remaining += month[typeKey].count || 0;
          }
        });

        if (Array.isArray(month.other)) {
          month.other.forEach((item) => {
            if (!item?.name) return;
            if (!totalsMap[item.name]) {
              totalsMap[item.name] = { total: 0, completed: 0, remaining: 0 };
            }
            totalsMap[item.name].total += item.total || 0;
            totalsMap[item.name].remaining += item.count || 0;
          });
        }
      });

      Object.entries(totalsMap).forEach(([key, stats]) => {
        const completed = Math.max(0, stats.total - stats.remaining);
        workSourceArray.push({
          key,
          label:
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1"),
          total: stats.total,
          completed,
          remaining: stats.remaining,
        });
      });
    }

    return workSourceArray;
  }, [project]);

  // Prepare data for charts and summary
  const workTypesData = workDetailsData.map((item) => ({
    name: item.label,
    total: item.total,
    completed: item.completed,
    remaining: item.remaining,
  }));

  const workSummaryMetrics = useMemo(() => {
    const totalPlanned = workDetailsData.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const totalCompleted = workDetailsData.reduce(
      (sum, item) => sum + item.completed,
      0
    );
    const totalPending = Math.max(0, totalPlanned - totalCompleted);
    const completionRate =
      totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

    return {
      totalPlanned,
      totalCompleted,
      totalPending,
      completionRate,
      breakdown: workDetailsData,
    };
  }, [workDetailsData]);

  const taskStatusData = [
    {
      name: "Completed",
      value:
        project?.tasks?.filter((task) => task.status === "completed").length ||
        0,
    },
    {
      name: "In Progress",
      value:
        project?.tasks?.filter((task) => task.status === "in-progress")
          .length || 0,
    },
    {
      name: "To Do",
      value:
        project?.tasks?.filter((task) => task.status === "todo").length || 0,
    },
  ];

  const COLORS = [
    "#4ade80",
    "#f87171",
    "#60a5fa",
    "#fbbf24",
    "#a78bfa",
    "#f472b6",
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate days remaining
  const endDate = new Date(project?.endDate);
  const today = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
  );

  // Calculate project duration
  const startDate = new Date(project?.startDate);
  const projectDuration = Math.ceil(
    (endDate - startDate) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.min(
    projectDuration,
    Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)))
  );

  // Calculate timeline percentage
  const timelinePercentage = Math.min(
    100,
    Math.round((daysElapsed / projectDuration) * 100)
  );

  // Persist selected month when changed
  useEffect(() => {
    if (!projectId) return;
    const storageKey = `project-details-selected-date-${projectId}`;
    localStorage.setItem(storageKey, selectedDate.toISOString());
  }, [projectId, selectedDate]);

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const resetToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  const dateLabel = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isCurrentMonth =
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section className="flex flex-col bg-gray-50 min-h-screen">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8 flex flex-col gap-4">
        <ProjectHeader project={project} />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Previous month"
            >
              <MdOutlineKeyboardArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <img src="/icons/calender.svg" alt="" className="w-4 h-4" />
              <span
                onClick={resetToCurrentMonth}
                className={`${
                  !isCurrentMonth ? "text-blue-600" : ""
                } whitespace-nowrap`}
                title={
                  !isCurrentMonth
                    ? "Click to jump back to current month"
                    : "Current month"
                }
              >
                {dateLabel}
                {!isCurrentMonth && (
                  <span className="text-xs text-gray-400 ml-1">(Viewing)</span>
                )}
              </span>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Next month"
            >
              <MdOutlineKeyboardArrowRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 pb-6 sm:px-6 lg:px-8 relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div
          className={`${isFetching ? "opacity-40 pointer-events-none" : ""}`}
        >
          {activeTab === "overview" && (
            <OverviewTab
              project={project}
              workTypesData={workTypesData}
              workSummary={workSummaryMetrics}
              taskStatusData={taskStatusData}
              COLORS={COLORS}
              timelinePercentage={timelinePercentage}
              formatDate={formatDate}
              daysRemaining={daysRemaining}
              projectDuration={projectDuration}
            />
          )}
          {activeTab === "team" && <TeamTab project={project} />}

          {activeTab === "tasks" && (
            <TasksTab project={project} formatDate={formatDate} />
          )}

          {activeTab === "social" && <SocialTab project={project} />}
        </div>
      </div>
    </section>
  );
};

export default ProjectAnalyticsDetails;
