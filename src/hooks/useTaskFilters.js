import { useState, useCallback, useEffect } from "react";

const DEFAULT_FILTERS = {
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
};

export const useTaskFilters = (persistenceKey = "task_filters") => {
  const [superFilters, setSuperFilters] = useState(() => {
    const savedFilters = localStorage.getItem(persistenceKey);
    if (savedFilters) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(savedFilters) };
      } catch (error) {
        console.error("Error parsing saved filters:", error);
        return DEFAULT_FILTERS;
      }
    }
    return DEFAULT_FILTERS;
  });

  useEffect(() => {
    localStorage.setItem(persistenceKey, JSON.stringify(superFilters));
  }, [superFilters, persistenceKey]);

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
    setSuperFilters(DEFAULT_FILTERS);
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
