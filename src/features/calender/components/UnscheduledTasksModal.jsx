import React, { useState, useEffect } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { MdSchedule, MdFilterList } from "react-icons/md";
import { useGetUnscheduledTasks, useScheduleSubTask } from "../../../api/hooks";
import CalendarEventItem from "./CalendarEventItem";
import { format } from "date-fns";

const UnscheduledTasksModal = ({ isOpen, onClose, selectedDate }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    priority: "",
    projectId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // State to track scheduled task IDs for immediate removal
  const [scheduledTaskIds, setScheduledTaskIds] = useState(new Set());

  const { data, isLoading, error } = useGetUnscheduledTasks(filters);
  const { subTasks = [], pagination = {}, statistics = {} } = data || {};

  // Filter out scheduled tasks from the display
  const displaySubTasks = subTasks.filter(
    (subtask) => !scheduledTaskIds.has(subtask._id)
  );

  // Reset scheduled task IDs when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setScheduledTaskIds(new Set());
    }
  }, [isOpen]);

  // Schedule subtask hook
  const { mutate: scheduleSubTask, isLoading: isScheduling } =
    useScheduleSubTask((data, variables) => {
      console.log("Subtask scheduled successfully:", data);
      // Immediately remove the scheduled task from the list
      setScheduledTaskIds((prev) => new Set([...prev, variables.subTaskId]));
    });

  const handleSearchChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1, // Reset to first page when searching
    }));
    // Reset scheduled task IDs when searching
    setScheduledTaskIds(new Set());
  };

  const handlePriorityFilter = (priority) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority === priority ? "" : priority,
      page: 1,
    }));
    // Reset scheduled task IDs when filtering
    setScheduledTaskIds(new Set());
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleSchedule = (subTaskId) => {
    if (!selectedDate) {
      alert("No date selected for scheduling");
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    scheduleSubTask({
      subTaskId,
      startDate: formattedDate,
      dueDate: formattedDate,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Unscheduled Tasks
              </h3>
              <p className="text-sm text-gray-500">
                {displaySubTasks.length} subtasks without start date and due
                date
                {scheduledTaskIds.size > 0 && (
                  <span className="text-green-600 ml-1">
                    ({scheduledTaskIds.size} scheduled)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Filters Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search unscheduled tasks..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 
               text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex gap-2">
              {["High", "Medium", "Low"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityFilter(priority)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    filters.priority === priority
                      ? priority === "High"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics */}
          {statistics.total > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Priority:</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  High: {statistics.priorityDistribution?.high || 0}
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                  Medium: {statistics.priorityDistribution?.medium || 0}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  Low: {statistics.priorityDistribution?.low || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-3 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading unscheduled tasks...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Failed to load unscheduled tasks</p>
              <p className="text-sm text-gray-500 mt-1">{error.message}</p>
            </div>
          ) : displaySubTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MdSchedule className="text-4xl text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                No Unscheduled Tasks
              </h4>
              <p className="text-sm">
                {filters.search || filters.priority
                  ? "No tasks match your current filters"
                  : "All subtasks have been scheduled with start and due dates"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displaySubTasks.map((subtask, idx) => (
                <div
                  key={`unscheduled-subtask-${idx}`}
                  className="border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CalendarEventItem
                        type="subtask"
                        data={subtask}
                        showExtraDetails={true}
                        isEmployee={false}
                      />
                    </div>
                    {selectedDate && (
                      <button
                        onClick={() => handleSchedule(subtask._id)}
                        disabled={isScheduling}
                        className="px-3 py-1.5 bg-gray-400 cursor-pointer
                         text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {isScheduling ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <MdSchedule className="text-sm" />
                            Schedule
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing{" "}
              {((pagination.currentPage - 1) * pagination.totalCount) /
                pagination.totalPages +
                1}{" "}
              to{" "}
              {Math.min(
                (pagination.currentPage * pagination.totalCount) /
                  pagination.totalPages,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} tasks
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnscheduledTasksModal;
