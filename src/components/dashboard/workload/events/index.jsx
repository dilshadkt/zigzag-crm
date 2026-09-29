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
          (details.reels?.count || 0) +
          (details.poster?.count || 0) +
          (details.motionPoster?.count || 0) +
          (details.shooting?.count || 0) +
          (details.motionGraphics?.count || 0) +
          (details.other || []).reduce((acc, item) => acc + (item.count || 0), 0);

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
      <div className="bg-white   rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 border border-gray-100 min-h-[360px] md:min-h-[420px] md:h-[470px] flex flex-col">
        <div className="flexBetween">
          <h4 className="font-semibold text-base md:text-lg text-gray-800">
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
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 border border-gray-100 min-h-[360px] md:min-h-full md:h-[470px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3">
        <div>
          <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">Pending Work  ({activeProjects.length})</h3>
        </div>
        <Link
          to={`/pending-works?month=${taskMonth}`}
          className="text-[#3F8CFF] text-sm font-medium cursor-pointer flex items-center gap-x-1"
        >
          <span>View all</span>
          <MdOutlineKeyboardArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex flex-col h-full bg-slate-50 rounded-2xl p-3 overflow-hidden min-h-[240px] lg:min-h-0">


        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          {activeProjects.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2 opacity-20 flex justify-center">✅</div>
              <p>No pending work for this month</p>
            </div>
          ) : (
            activeProjects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="bg-white p-3 rounded-xl shadow-sm border border-transparent hover:border-blue-200 transition-all hover:shadow-md cursor-pointer group flex flex-col gap-3 block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {project.thumbImg ? (
                    <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
                      <img
                        src={project.thumbImg}
                        alt={project.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="shrink-0 w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-gray-100 shadow-sm">
                      {project.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    <h5 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors" title={project.name}>
                      {project.name}
                    </h5>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {project.reporters?.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-500">Coordinator:</span>
                          <div className="flex -space-x-1">
                            {project.reporters.map((r, idx) => (
                              <div
                                key={r._id || idx}
                                className="w-5 h-5 rounded-full overflow-hidden border border-white bg-gray-100 flex items-center justify-center shadow-sm"
                                title={`${r.firstName} ${r.lastName || ''}`}
                              >
                                {r.profileImage ? (
                                  <img src={r.profileImage} alt={r.firstName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-bold text-gray-600">{r.firstName?.charAt(0)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <span className="text-[11px] font-medium text-red-500">
                        {project.pendingCount} Total Pending Tasks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
                  {project.details.reels?.count > 0 && (
                    <WorkBadge type="Reels" count={project.details.reels.count} color="bg-pink-50 text-pink-600 border-pink-100" />
                  )}
                  {project.details.poster?.count > 0 && (
                    <WorkBadge type="Posters" count={project.details.poster.count} color="bg-purple-50 text-purple-600 border-purple-100" />
                  )}
                  {project.details.motionPoster?.count > 0 && (
                    <WorkBadge type="Motion" count={project.details.motionPoster.count} color="bg-indigo-50 text-indigo-600 border-indigo-100" />
                  )}
                  {project.details.shooting?.count > 0 && (
                    <WorkBadge type="Shoot" count={project.details.shooting.count} color="bg-orange-50 text-orange-600 border-orange-100" />
                  )}
                  {project.details.motionGraphics?.count > 0 && (
                    <WorkBadge type="Graphics" count={project.details.motionGraphics.count} color="bg-teal-50 text-teal-600 border-teal-100" />
                  )}
                  {project.details.other?.map((item, idx) => item.count > 0 && (
                    <WorkBadge key={idx} type={item.name} count={item.count} color="bg-gray-50 text-gray-600 border-gray-200" />
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for badges
const WorkBadge = ({ type, count, color }) => (
  <div className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium ${color}`}>
    <span className="font-bold">{count}</span>
    <span>{type}</span>
  </div>
);

export default NearestEvents;
