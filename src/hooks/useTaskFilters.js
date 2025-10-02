import { useState, useCallback } from "react";

export const useTaskFilters = () => {
  const [superFilters, setSuperFilters] = useState({
    search: "",
    status: [],
    priority: [],
    assignedTo: [],
    project: [],
    dateRange: {
      start: "",
      end: "",
    },
    sortBy: "dueDate", // Options: 'dueDate', 'priority', 'status', 'title', 'createdAt'
    sortOrder: "asc", // 'asc' or 'desc'
  });

  const handleFilterChange = useCallback((key, value) => {
    setSuperFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleMultiSelectFilter = useCallback((key, value) => {
    setSuperFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSuperFilters({
      search: "",
      status: [],
      priority: [],
      assignedTo: [],
      project: [],
      dateRange: { start: "", end: "" },
      sortBy: "dueDate",
      sortOrder: "asc",
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return (
      superFilters.search ||
      superFilters.status.length > 0 ||
      superFilters.priority.length > 0 ||
      superFilters.assignedTo.length > 0 ||
      superFilters.project.length > 0 ||
      superFilters.dateRange.start ||
      superFilters.dateRange.end ||
      superFilters.sortBy !== "dueDate" ||
      superFilters.sortOrder !== "asc"
    );
  }, [superFilters]);

  return {
    superFilters,
    handleFilterChange,
    handleMultiSelectFilter,
    clearAllFilters,
    hasActiveFilters,
  };
};
