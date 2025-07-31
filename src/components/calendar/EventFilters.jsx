import React, { useState, useEffect, useRef } from "react";
import { FaGift } from "react-icons/fa";
import {
  MdTask,
  MdFolder,
  MdSubdirectoryArrowRight,
  MdPerson,
} from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

const EventFilters = ({
  eventFilters,
  onToggleFilter,
  assignerFilter,
  onAssignerFilterChange,
  projectFilter,
  onProjectFilterChange,
  calendarData,
}) => {
  const [isAssignerDropdownOpen, setIsAssignerDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [assigners, setAssigners] = useState([]);
  const [projects, setProjects] = useState([]);
  const assignerDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);

  // Extract unique assigners from tasks data
  useEffect(() => {
    if (calendarData?.tasksData?.tasks) {
      const uniqueAssigners = new Map();

      calendarData.tasksData.tasks.forEach((task) => {
        if (task.assignedTo && Array.isArray(task.assignedTo)) {
          task.assignedTo.forEach((assignee) => {
            if (assignee._id && assignee.name) {
              uniqueAssigners.set(assignee._id, {
                id: assignee._id,
                name: assignee.name,
                avatar: assignee?.avatar || "",
              });
            }
          });
        }
      });

      setAssigners(Array.from(uniqueAssigners.values()));
    }
  }, [calendarData?.tasksData?.tasks]);

  // Extract unique projects from tasks data
  useEffect(() => {
    const uniqueProjects = new Map();

    // Extract projects from tasks data
    if (calendarData?.tasksData?.tasks) {
      console.log(
        "Tasks data for project extraction:",
        calendarData.tasksData.tasks
      );

      calendarData.tasksData.tasks.forEach((task) => {
        console.log("Task project data:", task.project);

        // Check for different possible project data structures
        if (task.project) {
          const projectId = task.project._id || task.project.id;
          const projectName =
            task.project.title || task.project.name || task.project.projectName;
          const projectColor = task.project.color || "#3B82F6";

          if (projectId && projectName) {
            uniqueProjects.set(projectId, {
              id: projectId,
              name: projectName,
              color: projectColor,
            });
          }
        }
      });
    }

    // Also extract projects from projectsData
    if (calendarData?.projectsData?.projects) {
      console.log("Projects data:", calendarData.projectsData.projects);

      calendarData.projectsData.projects.forEach((project) => {
        console.log("Project data:", project);

        const projectId = project._id || project.id;
        const projectName =
          project.title || project.name || project.projectName;
        const projectColor = project.color || "#3B82F6";

        if (projectId && projectName) {
          uniqueProjects.set(projectId, {
            id: projectId,
            name: projectName,
            color: projectColor,
          });
        }
      });
    }

    // If no projects found in tasks, try to extract from the entire tasksData structure
    if (uniqueProjects.size === 0 && calendarData?.tasksData) {
      console.log(
        "No projects found in tasks, checking entire tasksData structure"
      );
      console.log("Full tasksData:", calendarData.tasksData);

      // Look for any project-related data in the tasksData
      if (calendarData.tasksData.projects) {
        calendarData.tasksData.projects.forEach((project) => {
          const projectId = project._id || project.id;
          const projectName =
            project.title || project.name || project.projectName;
          const projectColor = project.color || "#3B82F6";

          if (projectId && projectName) {
            uniqueProjects.set(projectId, {
              id: projectId,
              name: projectName,
              color: projectColor,
            });
          }
        });
      }
    }

    console.log(
      "Final extracted projects:",
      Array.from(uniqueProjects.values())
    );
    setProjects(Array.from(uniqueProjects.values()));
  }, [
    calendarData?.tasksData?.tasks,
    calendarData?.projectsData?.projects,
    calendarData?.tasksData,
  ]);

  // Click outside handler for assigner dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        assignerDropdownRef.current &&
        !assignerDropdownRef.current.contains(event.target)
      ) {
        setIsAssignerDropdownOpen(false);
      }
    };

    if (isAssignerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAssignerDropdownOpen]);

  // Click outside handler for project dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isProjectDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  const handleAssignerSelect = (assignerId) => {
    onAssignerFilterChange(assignerId);
    setIsAssignerDropdownOpen(false);
  };

  const handleProjectSelect = (projectId) => {
    onProjectFilterChange(projectId);
    setIsProjectDropdownOpen(false);
  };

  const getSelectedAssignerName = () => {
    if (!assignerFilter) return "All Assigners";
    const selectedAssigner = assigners.find((a) => a.id === assignerFilter);
    return selectedAssigner ? selectedAssigner.name : "All Assigners";
  };

  const getSelectedProjectName = () => {
    if (!projectFilter) return "All Projects";
    const selectedProject = projects.find((p) => p.id === projectFilter);
    return selectedProject ? selectedProject.name : "All Projects";
  };

  return (
    <div className="flex items-center gap-2 ml-auto mr-4">
      {/* Assigner Filter Dropdown */}
      <div className="relative" ref={assignerDropdownRef}>
        <button
          onClick={() => setIsAssignerDropdownOpen(!isAssignerDropdownOpen)}
          className="flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
          title="Filter by Assigner"
        >
          <MdPerson className="text-sm" />
          <span className="max-w-32 truncate">{getSelectedAssignerName()}</span>
          <IoChevronDown
            className={`text-xs transition-transform duration-200 ${
              isAssignerDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Assigner Dropdown Menu */}
        {isAssignerDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="py-1">
              {/* All Assigners Option */}
              <button
                onClick={() => handleAssignerSelect(null)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 ${
                  !assignerFilter ? "bg-blue-50 text-blue-700" : "text-gray-700"
                }`}
              >
                All Assigners
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Individual Assigners */}
              {assigners.map((assigner) => (
                <button
                  key={assigner.id}
                  onClick={() => handleAssignerSelect(assigner.id)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 ${
                    assignerFilter === assigner.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  {assigner?.avatar === "/api/placeholder/32/32" ? (
                    <div className="w-5 h-5 rounded-full bg-gray-800 text-white uppercase flex items-center justify-center">
                      {assigner?.name?.charAt(0)}
                    </div>
                  ) : (
                    <img
                      src={assigner?.avatar}
                      alt={assigner.name}
                      className="w-5 h-5 rounded-full"
                    />
                  )}

                  <span className="truncate">{assigner.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Filter Dropdown */}
      <div className="relative" ref={projectDropdownRef}>
        <button
          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          className="flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
          title="Filter by Project"
        >
          <MdFolder className="text-sm" />
          <span className="max-w-32 truncate">{getSelectedProjectName()}</span>
          <IoChevronDown
            className={`text-xs transition-transform duration-200 ${
              isProjectDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Project Dropdown Menu */}
        {isProjectDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="py-1">
              {/* All Projects Option */}
              <button
                onClick={() => handleProjectSelect(null)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 ${
                  !projectFilter ? "bg-blue-50 text-blue-700" : "text-gray-700"
                }`}
              >
                All Projects
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Individual Projects */}
              {projects.length > 0 ? (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 ${
                      projectFilter === project.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <span className="truncate">{project.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No projects found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Tasks Filter */}
      <button
        onClick={() => onToggleFilter("tasks")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.tasks
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Tasks"
      >
        <MdTask className="text-sm" />
        Tasks
      </button>

      {/* Subtasks Filter */}
      <button
        onClick={() => onToggleFilter("subtasks")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.subtasks
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Subtasks"
      >
        <MdSubdirectoryArrowRight className="text-sm" />
        Subtasks
      </button>

      {/* Projects Filter */}
      <button
        onClick={() => onToggleFilter("projects")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.projects
            ? "bg-amber-100 text-amber-700 border border-amber-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Projects"
      >
        <MdFolder className="text-sm" />
        Projects
      </button>

      {/* Birthdays Filter */}
      <button
        onClick={() => onToggleFilter("birthdays")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.birthdays
            ? "bg-purple-100 text-purple-700 border border-purple-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Birthdays"
      >
        <FaGift className="text-sm" />
        Events
      </button>
    </div>
  );
};

export default EventFilters;
