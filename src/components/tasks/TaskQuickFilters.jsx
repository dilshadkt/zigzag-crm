import React, { useState, useEffect, useRef } from "react";
import {
  MdPerson,
  MdFolder,
  MdTask,
  MdSubdirectoryArrowRight,
} from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

const TaskQuickFilters = ({
  superFilters = {},
  onFilterChange,
  onMultiSelectFilter,
  users = [],
  projects = [],
  showTasks = true,
  showSubtasks = true,
  onToggleTasks,
  onToggleSubtasks,
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);

  // Click outside handler for user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

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

  const handleUserSelect = (userId) => {
    onMultiSelectFilter("assignedTo", userId);
    setIsUserDropdownOpen(false);
  };

  const handleProjectSelect = (projectId) => {
    onMultiSelectFilter("project", projectId);
    setIsProjectDropdownOpen(false);
  };

  const getSelectedUsersCount = () => {
    return superFilters?.assignedTo?.length || 0;
  };

  const getSelectedProjectsCount = () => {
    return superFilters?.project?.length || 0;
  };

  const getSelectedUserNames = () => {
    if (!superFilters?.assignedTo || superFilters.assignedTo.length === 0)
      return "All Assignees";
    if (superFilters.assignedTo.length === 1) {
      const user = users.find((u) => u._id === superFilters.assignedTo[0]);
      return user ? `${user.firstName} ${user.lastName}` : "1 Assignee";
    }
    return `${superFilters.assignedTo.length} Assignees`;
  };

  const getSelectedProjectNames = () => {
    if (!superFilters?.project || superFilters.project.length === 0)
      return "All Projects";
    if (superFilters.project.length === 1) {
      const project = projects.find((p) => p._id === superFilters.project[0]);
      return project ? project.name : "1 Project";
    }
    return `${superFilters.project.length} Projects`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Tasks Toggle Button */}
      <button
        onClick={onToggleTasks}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border ${
          showTasks
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Tasks"
      >
        <MdTask className="text-sm" />
        Tasks
      </button>

      {/* Subtasks Toggle Button */}
      <button
        onClick={onToggleSubtasks}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border ${
          showSubtasks
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Subtasks"
      >
        <MdSubdirectoryArrowRight className="text-sm" />
        Subtasks
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Assignee Filter Dropdown */}
      <div className="relative" ref={userDropdownRef}>
        <button
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border ${
            getSelectedUsersCount() > 0
              ? "bg-blue-100 text-blue-700 border-blue-200"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}
          title="Filter by Assignee"
        >
          <MdPerson className="text-sm" />
          <span className="max-w-32 truncate">{getSelectedUserNames()}</span>
          {getSelectedUsersCount() > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {getSelectedUsersCount()}
            </span>
          )}
          <IoChevronDown
            className={`text-xs transition-transform duration-200 ${
              isUserDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* User Dropdown Menu */}
        {isUserDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="py-1">
              {/* All Assignees Option */}
              <button
                onClick={() => onFilterChange("assignedTo", [])}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 ${
                  getSelectedUsersCount() === 0
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                All Assignees
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Individual Users */}
              {users.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No users available
                </div>
              ) : (
                users.map((user) => {
                  const userId = user._id;
                  const isSelected =
                    superFilters?.assignedTo?.includes(userId) || false;
                  return (
                    <button
                      key={userId}
                      onClick={() => handleUserSelect(userId)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 ${
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] text-gray-600">
                            {(user.firstName?.[0] || "?").toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="truncate flex-1">
                        {user.firstName} {user.lastName}
                      </span>
                      {isSelected && <span className="text-blue-600">✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Project Filter Dropdown */}
      <div className="relative" ref={projectDropdownRef}>
        <button
          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
          className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border ${
            getSelectedProjectsCount() > 0
              ? "bg-purple-100 text-purple-700 border-purple-200"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}
          title="Filter by Project"
        >
          <MdFolder className="text-sm" />
          <span className="max-w-32 truncate">{getSelectedProjectNames()}</span>
          {getSelectedProjectsCount() > 0 && (
            <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {getSelectedProjectsCount()}
            </span>
          )}
          <IoChevronDown
            className={`text-xs transition-transform duration-200 ${
              isProjectDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Project Dropdown Menu */}
        {isProjectDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="py-1">
              {/* All Projects Option */}
              <button
                onClick={() => onFilterChange("project", [])}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 ${
                  getSelectedProjectsCount() === 0
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-700"
                }`}
              >
                All Projects
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Individual Projects */}
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No projects available
                </div>
              ) : (
                projects.map((project) => {
                  const projectId = project._id;
                  const isSelected =
                    superFilters?.project?.includes(projectId) || false;
                  return (
                    <button
                      key={projectId}
                      onClick={() => handleProjectSelect(projectId)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 ${
                        isSelected
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="truncate flex-1">{project.name}</span>
                      {isSelected && <span className="text-purple-600">✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskQuickFilters;
