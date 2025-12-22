import React, { useState, useEffect, useRef } from "react";
import {
  FaClock,
  FaTasks,
  FaProjectDiagram,
  FaFileAlt,
} from "react-icons/fa";
import { MdPerson, MdFolder } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { FiCalendar } from "react-icons/fi";

const ActivityStreamQuickFilters = ({
  filters,
  onFilterChange,
  employees = [],
  projects = [],
}) => {
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);

  // Click outside handler for employee dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeDropdownOpen(false);
      }
    };

    if (isEmployeeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEmployeeDropdownOpen]);

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

  const handleActivityTypeToggle = (type) => {
    if (filters.type === type) {
      onFilterChange("type", "all");
    } else {
      onFilterChange("type", type);
    }
  };

  const handleDateFilterChange = (dateFilter) => {
    onFilterChange("dateFilter", dateFilter);
    // Clear custom dates when selecting preset filters
    if (dateFilter !== "custom") {
      onFilterChange("customStartDate", "");
      onFilterChange("customEndDate", "");
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    const currentEmployees = filters.employees || [];
    const isSelected = currentEmployees.includes(employeeId);

    if (isSelected) {
      onFilterChange(
        "employees",
        currentEmployees.filter((id) => id !== employeeId)
      );
    } else {
      onFilterChange("employees", [...currentEmployees, employeeId]);
    }
    setIsEmployeeDropdownOpen(false);
  };

  const handleProjectSelect = (projectId) => {
    const currentProjects = filters.projects || [];
    const isSelected = currentProjects.includes(projectId);

    if (isSelected) {
      onFilterChange(
        "projects",
        currentProjects.filter((id) => id !== projectId)
      );
    } else {
      onFilterChange("projects", [...currentProjects, projectId]);
    }
    setIsProjectDropdownOpen(false);
  };

  const getSelectedEmployeesCount = () => {
    return filters.employees?.length || 0;
  };

  const getSelectedProjectsCount = () => {
    return filters.projects?.length || 0;
  };

  const getSelectedEmployeeNames = () => {
    if (!filters.employees || filters.employees.length === 0) return "All Employees";
    if (filters.employees.length === 1) {
      const employee = employees.find(
        (e) => (e._id || e.id) === filters.employees[0]
      );
      return employee
        ? `${employee.firstName} ${employee.lastName}`
        : "1 Employee";
    }
    return `${filters.employees.length} Employees`;
  };

  const getSelectedProjectNames = () => {
    if (!filters.projects || filters.projects.length === 0) return "All Projects";
    if (filters.projects.length === 1) {
      const project = projects.find(
        (p) => (p._id || p.id) === filters.projects[0]
      );
      return project ? project.name : "1 Project";
    }
    return `${filters.projects.length} Projects`;
  };

  const activityTypeButtons = [
    {
      value: "time_log",
      label: "Time Logs",
      icon: FaClock,
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      value: "task_update",
      label: "Tasks",
      icon: FaTasks,
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      value: "subtask_update",
      label: "Subtasks",
      icon: FaTasks,
      color: "bg-teal-100 text-teal-700 border-teal-200",
    },
    {
      value: "project",
      label: "Projects",
      icon: FaProjectDiagram,
      color: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
      value: "attachments",
      label: "Files",
      icon: FaFileAlt,
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
  ];

  const dateFilterButtons = [
    { value: "today", label: "Today" },
    { value: "week", label: "7 Days" },
    { value: "month", label: "30 Days" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Activity Type Toggle Buttons */}
      {activityTypeButtons.map((button) => {
        const Icon = button.icon;
        const isActive = filters.type === button.value;
        return (
          <button
            key={button.value}
            onClick={() => handleActivityTypeToggle(button.value)}
            className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              isActive
                ? `${button.color} border`
                : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }`}
            title={`Toggle ${button.label}`}
          >
            <Icon className="text-sm" />
            <span className="hidden sm:inline">{button.label}</span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Date Filter Buttons */}
      {dateFilterButtons.map((button) => {
        const isActive = filters.dateFilter === button.value;
        return (
          <button
            key={button.value}
            onClick={() => handleDateFilterChange(button.value)}
            className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              isActive
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }`}
            title={`Filter by ${button.label}`}
          >
            <FiCalendar className="text-sm" />
            <span>{button.label}</span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Employee Filter Dropdown */}
      <div className="relative" ref={employeeDropdownRef}>
        <button
          onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
          className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border ${
            getSelectedEmployeesCount() > 0
              ? "bg-blue-100 text-blue-700 border-blue-200"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}
          title="Filter by Employee"
        >
          <MdPerson className="text-sm" />
          <span className="max-w-32 truncate">{getSelectedEmployeeNames()}</span>
          {getSelectedEmployeesCount() > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {getSelectedEmployeesCount()}
            </span>
          )}
          <IoChevronDown
            className={`text-xs transition-transform duration-200 ${
              isEmployeeDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Employee Dropdown Menu */}
        {isEmployeeDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="py-1">
              {/* All Employees Option */}
              <button
                onClick={() => onFilterChange("employees", [])}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 ${
                  getSelectedEmployeesCount() === 0
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                All Employees
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Individual Employees */}
              {employees.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No employees available
                </div>
              ) : (
                employees.map((employee) => {
                  const employeeId = employee._id || employee.id;
                  const isSelected = filters.employees?.includes(employeeId);
                  return (
                    <button
                      key={employeeId}
                      onClick={() => handleEmployeeSelect(employeeId)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 ${
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {employee.profileImage ? (
                        <img
                          src={employee.profileImage}
                          alt={`${employee.firstName} ${employee.lastName}`}
                          className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] text-gray-600">
                            {(employee.firstName?.[0] || "?").toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="truncate flex-1">
                        {employee.firstName} {employee.lastName}
                      </span>
                      {isSelected && (
                        <span className="text-blue-600">✓</span>
                      )}
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
                onClick={() => onFilterChange("projects", [])}
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
                  const projectId = project._id || project.id;
                  const isSelected = filters.projects?.includes(projectId);
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
                      {isSelected && (
                        <span className="text-purple-600">✓</span>
                      )}
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

export default ActivityStreamQuickFilters;

