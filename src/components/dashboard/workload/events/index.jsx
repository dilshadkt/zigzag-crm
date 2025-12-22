import React, { useMemo } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";
import { useCompanyWorkDetailsByMonth } from "../../../../api/hooks";
import { useAuth } from "../../../../hooks/useAuth";

const NearestEvents = ({ taskMonth }) => {
  const { companyId } = useAuth();

  // Fetch pending work details
  const { data: projectsWorkDetails, isLoading } = useCompanyWorkDetailsByMonth(
    companyId,
    taskMonth
  );

  // Filter and sort projects to show those with most pending work first
  const activeProjects = useMemo(() => {
    if (!projectsWorkDetails) return [];

    return projectsWorkDetails
      .map(project => {
        // Get this month's details (should be at index 0 since we filtered by month in API)
        const details = project.workDetails[0] || {};

        // Calculate total pending items
        const pendingCount =
          (details.reels?.pending || 0) +
          (details.poster?.pending || 0) +
          (details.motionPoster?.pending || 0) +
          (details.shooting?.pending || 0) +
          (details.motionGraphics?.pending || 0) +
          (details.other || []).reduce((acc, item) => acc + (item.pending || 0), 0);

        return {
          ...project,
          pendingCount,
          details
        };
      })
      .filter(p => p.pendingCount > 0) // Only show projects with pending work
      .sort((a, b) => b.pendingCount - a.pendingCount)
      .slice(0, 5); // Show top 5
  }, [projectsWorkDetails]);

  if (isLoading) {
    return (
      <div className="flex h-[470px] flex-col md:col-span-2 bg-white py-5 px-4 rounded-3xl">
        <div className="flexBetween">
          <h4 className="font-semibold text-lg text-gray-800">
            Pending Work
          </h4>
        </div>
        <div className="w-full h-full overflow-y-auto mt-3 gap-y-4 flex flex-col pt-2">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[470px] flex-col md:col-span-2 bg-white py-5 px-4 rounded-3xl">
      <div className="flexBetween">
        <h4 className="font-semibold text-lg text-gray-800">Pending Work</h4>
        <Link
          to={`/pending-works?month=${taskMonth}`}
          className="text-[#3F8CFF] text-sm cursor-pointer flexStart gap-x-2"
        >
          <span>View all</span>
          <MdOutlineKeyboardArrowRight />
        </Link>
      </div>

      <div className="w-full h-full overflow-y-auto mt-3 gap-y-4 flex flex-col pt-2 pr-1">
        {activeProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm">No pending work for this month</p>
          </div>
        ) : (
          activeProjects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="flex flex-col p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-gray-800 truncate flex-1 pr-2" title={project.name}>
                  {project.name}
                </h5>
                <span className="text-xs font-semibold bg-red-50 text-red-500 px-2 py-1 rounded-full whitespace-nowrap">
                  {project.pendingCount} Pending
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Only show categories with pending items */}
                {project.details.reels?.pending > 0 && (
                  <WorkBadge type="Reels" count={project.details.reels.pending} color="bg-pink-100 text-pink-600" />
                )}
                {project.details.poster?.pending > 0 && (
                  <WorkBadge type="Posters" count={project.details.poster.pending} color="bg-purple-100 text-purple-600" />
                )}
                {project.details.motionPoster?.pending > 0 && (
                  <WorkBadge type="Motion" count={project.details.motionPoster.pending} color="bg-indigo-100 text-indigo-600" />
                )}
                {project.details.shooting?.pending > 0 && (
                  <WorkBadge type="Shoot" count={project.details.shooting.pending} color="bg-orange-100 text-orange-600" />
                )}
                {project.details.motionGraphics?.pending > 0 && (
                  <WorkBadge type="Graphics" count={project.details.motionGraphics.pending} color="bg-teal-100 text-teal-600" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

// Sub-component for badges
const WorkBadge = ({ type, count, color }) => (
  <div className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 ${color}`}>
    <span className="font-medium">{count}</span>
    <span>{type}</span>
  </div>
);

export default NearestEvents; // Keeping name same for easier swap, but logic is "PendingWork"
