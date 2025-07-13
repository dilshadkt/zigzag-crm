import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGetEmployeeProjects } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/shared/header";
import ProjectCard from "../../components/shared/projectCard";
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiUsers,
  FiFlag,
  FiClock,
} from "react-icons/fi";

const MyProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: employeeProjectsData, isLoading } = useGetEmployeeProjects(
    user?._id ? user._id : null
  );

  const projects = employeeProjectsData?.projects || [];

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: [],
    priority: [],
    sortBy: "name", // Options: 'name', 'progress', 'dueDate', 'createdAt'
    sortOrder: "asc", // 'asc' or 'desc'
  });

  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    if (projects) {
      let filtered = [...projects];

      // Apply search filter
      if (filters.search) {
        filtered = filtered.filter(
          (project) =>
            project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            project.description
              ?.toLowerCase()
              .includes(filters.search.toLowerCase())
        );
      }

      // Apply status filter
      if (filters.status.length > 0) {
        filtered = filtered.filter((project) =>
          filters.status.includes(project.status)
        );
      }

      // Apply priority filter
      if (filters.priority.length > 0) {
        filtered = filtered.filter((project) =>
          filters.priority.includes(project.priority)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (filters.sortBy) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "progress":
            aValue = a.progress || 0;
            bValue = b.progress || 0;
            break;
          case "dueDate":
            aValue = a.endDate ? new Date(a.endDate) : new Date(0);
            bValue = b.endDate ? new Date(b.endDate) : new Date(0);
            break;
          case "createdAt":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (filters.sortOrder === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });

      setFilteredProjects(filtered);
    }
  }, [projects, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelectFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: [],
      priority: [],
      sortBy: "name",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status.length > 0 ||
      filters.priority.length > 0
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "planning":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "on-hold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "completed":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flexBetween mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <Header>My Projects</Header>
            <p className="text-sm text-gray-500 mt-1">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} assigned to you
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
              hasActiveFilters()
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {hasActiveFilters() && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
            {showFilters ? (
              <FiChevronUp className="w-4 h-4" />
            ) : (
              <FiChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {["planning", "active", "on-hold", "completed"].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() => handleMultiSelectFilter("status", status)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {["high", "medium", "low"].map((priority) => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={() => handleMultiSelectFilter("priority", priority)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Project Name</option>
                  <option value="progress">Progress</option>
                  <option value="dueDate">Due Date</option>
                  <option value="createdAt">Created Date</option>
                </select>
                <button
                  onClick={() =>
                    handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {filters.sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProjects.length > 0 ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const daysRemaining = getDaysRemaining(project.endDate);
              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            project.priority
                          )}`}
                        >
                          {project.priority}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {/* Progress */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <span>{project.progress || 0}%</span>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>
                            Due: {formatDate(project.endDate)}
                            {daysRemaining !== null && (
                              <span
                                className={`ml-1 ${
                                  daysRemaining < 0
                                    ? "text-red-500"
                                    : daysRemaining <= 7
                                    ? "text-orange-500"
                                    : "text-green-500"
                                }`}
                              >
                                ({daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`})
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Team Size */}
                        {project.teams && (
                          <div className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            <span>{project.teams.length} team member{project.teams.length !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Created Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiClock className="w-3 h-3" />
                        <span>Created {formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {hasActiveFilters() ? "No projects match your filters" : "No projects assigned to you"}
            </h3>
            <p className="text-gray-500 text-sm">
              {hasActiveFilters()
                ? "Try adjusting your filters or check back later for new projects."
                : "Projects assigned to you will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects; 