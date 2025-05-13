import { useParams } from "react-router-dom";
import { useProjectDetails } from "../../api/hooks";
import { useState } from "react";
import ProjectHeader from "./components/ProjectHeader";
import NavigationTabs from "./components/NavigationTabs";
import OverviewTab from "./components/OverviewTab";
import TeamTab from "./components/TeamTab";
import TasksTab from "./components/TasksTab";
import SocialTab from "./components/SocialTab";

const ProjectAnalyticsDetails = () => {
  const { projectId } = useParams();
  const { data: project, isLoading } = useProjectDetails(projectId);
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Prepare data for charts
  const workTypesData = Object.entries(project?.workDetails || {})
    .filter(([key]) => key !== "_id" && key !== "other")
    .map(([key, value]) => ({
      name:
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      total: value.total || value.count || 0,
      completed: value.completed || 0,
      remaining: (value.total || value.count || 0) - (value.completed || 0),
    }));

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

  return (
    <section className="flex flex-col bg-gray-50 min-h-screen">
      <ProjectHeader project={project} />
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "overview" && (
          <OverviewTab
            project={project}
            workTypesData={workTypesData}
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
    </section>
  );
};

export default ProjectAnalyticsDetails;
