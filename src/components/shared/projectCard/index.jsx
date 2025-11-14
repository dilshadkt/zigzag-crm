import React, { useState, useRef } from "react";
import { IoArrowUpOutline } from "react-icons/io5";
import Progress from "../progress";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Work Details Tooltip Component
const WorkDetailsTooltip = ({ project, monthKey, position = "top" }) => {
  let monthlyDetails = null;

  // If monthKey is provided, find the specific month's work details
  if (monthKey && project?.workDetails) {
    monthlyDetails = project.workDetails.find(
      (details) => details.month === monthKey
    );
  }

  // If no month-specific details found, try to use aggregated work details
  if (!monthlyDetails && project?.aggregatedWorkDetails) {
    // Create a pseudo monthlyDetails object from aggregated data
    monthlyDetails = {
      reels: project.aggregatedWorkDetails.reels,
      poster: project.aggregatedWorkDetails.poster,
      motionPoster: project.aggregatedWorkDetails.motionPoster,
      shooting: project.aggregatedWorkDetails.shooting,
      motionGraphics: project.aggregatedWorkDetails.motionGraphics,
      other: project.aggregatedWorkDetails.other || [],
    };
  }

  // If still no details, check if workDetails array exists and use first entry
  if (
    !monthlyDetails &&
    project?.workDetails &&
    project.workDetails.length > 0
  ) {
    monthlyDetails = project.workDetails[0];
  }

  if (!monthlyDetails) {
    return null;
  }

  // Helper function to format work type data
  const formatWorkType = (workType, label) => {
    if (!workType || workType.total === 0) return null;
    const total = workType.total || 0;
    const remaining = workType.count || 0; // Pending/remaining items
    // Calculate completed: total - remaining (matches backend calculation)
    const completed = total - remaining;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      label,
      total,
      completed,
      remaining,
      progress,
    };
  };

  // Collect all work types
  const workTypes = [
    formatWorkType(monthlyDetails.reels, "Reels"),
    formatWorkType(monthlyDetails.poster, "Poster"),
    formatWorkType(monthlyDetails.motionPoster, "Motion Poster"),
    formatWorkType(monthlyDetails.shooting, "Shooting"),
    formatWorkType(monthlyDetails.motionGraphics, "Motion Graphics"),
  ].filter(Boolean);

  // Add other work types
  if (monthlyDetails.other && Array.isArray(monthlyDetails.other)) {
    monthlyDetails.other.forEach((item) => {
      if (item && item.total > 0) {
        const total = item.total || 0;
        const remaining = item.count || 0; // Pending/remaining items
        // Calculate completed: total - remaining (matches backend calculation)
        const completed = total - remaining;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        workTypes.push({
          label: item.name || "Other",
          total,
          completed,
          remaining,
          progress,
        });
      }
    });
  }

  if (workTypes.length === 0) {
    return null;
  }

  // Format month name
  let monthName = "Overall";
  if (monthKey) {
    try {
      const [year, month] = monthKey.split("-");
      monthName = new Date(year, parseInt(month) - 1, 1).toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      );
    } catch (error) {
      monthName = "Overall";
    }
  }

  // Position classes based on position prop
  const positionClasses =
    position === "bottom"
      ? "top-full right-0 mt-3" // Show below, align to right
      : "bottom-full right-0 mb-3"; // Show above (default), align to right

  const arrowClasses =
    position === "bottom"
      ? "top-0 right-6 transform -translate-y-full" // Arrow pointing up, aligned to right
      : "bottom-0 right-6 transform translate-y-full"; // Arrow pointing down (default), aligned to right

  return (
    <div
      className={`absolute ${positionClasses} w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 pointer-events-none transition-opacity duration-200`}
    >
      <div className={`absolute ${arrowClasses}`}>
        {position === "bottom" ? (
          // Arrow pointing up
          <>
            <div className="border-4 border-transparent border-b-gray-200"></div>
            <div className="border-4 border-transparent border-b-white -mt-1"></div>
          </>
        ) : (
          // Arrow pointing down (default)
          <>
            <div className="border-4 border-transparent border-t-gray-200"></div>
            <div className="border-4 border-transparent border-t-white -mt-1"></div>
          </>
        )}
      </div>
      <div className="mb-2 pb-2 border-b border-gray-200">
        <h6 className="font-semibold text-sm text-gray-800">Work Details</h6>
        <p className="text-xs text-gray-500 mt-0.5">{monthName}</p>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {workTypes.map((workType, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-800">
                {workType.label}
              </span>
              <span className="text-xs font-medium text-gray-600">
                {workType.completed}/{workType.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${workType.progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700 min-w-[40px] text-right">
                {workType.progress}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-600 font-medium">
                ✓ {workType.completed} completed
              </span>
              {workType.remaining > 0 && (
                <span className="text-orange-600 font-medium">
                  ⏳ {workType.remaining} pending
                </span>
              )}
              {workType.remaining === 0 && (
                <span className="text-gray-400">All done</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onClick, viewMore = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showProgressTooltip, setShowProgressTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("top");
  const progressRef = useRef(null);

  return (
    <div
      key={project?._id}
      className="flex flex-col cursor-pointer   h-fit "
      onClick={onClick}
    >
      <div
        className={`bg-white   rounded-3xl grid gap-y-4 md:gap-y-0 md:grid-cols-2`}
      >
        <div
          className="p-4  py-5 h-full flex gap-y-4 flex-col border-b md:border-r 
       relative border-[#E4E6E8] "
        >
          <div className="flexStart  gap-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden">
              <img
                src={project?.thumbImg}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col h-full">
              <span className="text-xs uppercase text-[#91929E]">
                {project?._id?.slice(0, 8)}
              </span>
              <h4 className=" font-medium text-gray-800">{project?.name}</h4>
            </div>
          </div>
          <div className="flexBetween">
            <div className="flexStart gap-x-4">
              <div className="flexStart gap-x-2">
                <img src="/icons/calender2.svg" alt="" className="w-5" />
                <span className="text-xs text-[#7D8592]">
                  Created {formatDate(project?.createdAt)}
                </span>
              </div>
              {viewMore && (
                <div className="flexStart gap-x-2">
                  <img src="/icons/calender2.svg" alt="" className="w-5" />
                  <span className="text-xs text-[#7D8592]">
                    Ended {formatDate(project?.endDate)}
                  </span>
                </div>
              )}
            </div>
            <div className="flexEnd text-[#FFBD21] text-xs gap-x-2 pr-2">
              <IoArrowUpOutline className="text-lg" />
              <span>{project?.periority}</span>
            </div>
          </div>
          <div className="absolute  right-5 top-5 w-fit">
            <div
              ref={progressRef}
              className="relative"
              onMouseEnter={() => {
                // Calculate position when hovering
                if (progressRef.current) {
                  const rect = progressRef.current.getBoundingClientRect();
                  const viewportHeight = window.innerHeight;
                  const spaceAbove = rect.top;
                  const spaceBelow = viewportHeight - rect.bottom;
                  const tooltipHeight = 300; // Approximate tooltip height

                  // If there's more space below and enough space, show below
                  // Otherwise show above
                  if (spaceBelow > tooltipHeight || spaceBelow > spaceAbove) {
                    setTooltipPosition("bottom");
                  } else {
                    setTooltipPosition("top");
                  }
                }
                setShowProgressTooltip(true);
              }}
              onMouseLeave={() => setShowProgressTooltip(false)}
            >
              <Progress
                size={48}
                strokeWidth={3}
                currentValue={project?.progress}
              />
              <span
                className="text-xs absolute top-1/2 left-1/2 -translate-x-1/2
               -translate-y-1/2 text-gray-500 font-semibold"
              >
                {project?.progress}%
              </span>
              {showProgressTooltip && (
                <WorkDetailsTooltip
                  project={project}
                  monthKey={project?.monthKey || null}
                  position={tooltipPosition}
                />
              )}
            </div>
          </div>
        </div>
        <div className="px-8  py-5   flex flex-col  gap-y-3 justify-center items-center">
          <h5 className="font-medium w-full">Project Data</h5>
          <div className="w-full grid grid-cols-3 ">
            <div className="flex flex-col gap-y-2">
              <span className="text-[#91929E]/90 text-sm">All Tasks</span>
              <span className="font-semibold text-gray-800 text-lg">
                {project?.monthTasks !== undefined
                  ? project.monthTasks
                  : project?.tasks?.length || 0}
              </span>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="text-[#91929E]/90 text-sm">Active tasks</span>
              <span className="font-semibold text-gray-800 text-lg">
                {project?.monthActiveTasks !== undefined
                  ? project.monthActiveTasks
                  : project?.tasks?.length || 0}
              </span>
            </div>
            <div className="flex flex-col    gap-y-2">
              <span className="text-[#91929E]/90 text-sm">Assignees</span>
              <div className="font-semibold flex items-center text-gray-800 text-lg relative">
                {project?.teams?.map((team, index) => (
                  <div
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      marginLeft: index > 0 ? "-8px" : "0",
                      zIndex:
                        hoveredIndex === index
                          ? 100
                          : project?.teams?.length - index,
                    }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 border-white relative transition-transform duration-200 ease-in-out ${
                        hoveredIndex === index ? "scale-125" : "scale-100"
                      }`}
                    >
                      <img
                        src={team?.profileImage}
                        alt={team?.name || team?.firstName || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {hoveredIndex === index && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50">
                        {team?.name || team?.firstName || "Team Member"}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
