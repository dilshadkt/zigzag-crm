import { useState, useCallback, useMemo, useRef } from "react";

// Custom hook for managing attendance state with optimizations
export const useAttendanceState = () => {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [attendanceData, setAttendanceData] = useState([]);

  // Ref to track if we need to prevent unnecessary updates
  const prevDataRef = useRef(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handlers = useMemo(
    () => ({
      handleSearchChange: (term) => {
        setSearchTerm(term);
      },
      handlePeriodChange: (period) => {
        setSelectedPeriod(period);
      },
      handleDateChange: (date) => {
        setSelectedDate(date);
      },
      handleDataChange: (data) => {
        // Only update if data has actually changed
        if (
          !prevDataRef.current ||
          prevDataRef.current.length !== data.length ||
          prevDataRef.current !== data
        ) {
          prevDataRef.current = data;
          setAttendanceData(data);
        }
      },
      handleExportSuccess: (message) => {
        // You can integrate with your toast system here
        console.log("Export success:", message);
      },
      handleExportError: (error) => {
        // You can integrate with your toast system here
        console.error("Export error:", error);
      },
      handlePreviousDay: () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate.toISOString().split("T")[0]);
      },
      handleNextDay: () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setSelectedDate(nextDate.toISOString().split("T")[0]);
      },
    }),
    [selectedDate]
  );

  // Memoized state object
  const state = useMemo(
    () => ({
      selectedDate,
      searchTerm,
      selectedPeriod,
      attendanceData,
    }),
    [selectedDate, searchTerm, selectedPeriod, attendanceData]
  );

  return {
    ...state,
    ...handlers,
  };
};

// Hook for managing date navigation
export const useDateNavigation = (initialDate) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const navigationHandlers = useMemo(
    () => ({
      goToPreviousDay: useCallback(() => {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setCurrentDate(prevDate.toISOString().split("T")[0]);
      }, [currentDate]),

      goToNextDay: useCallback(() => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setCurrentDate(nextDate.toISOString().split("T")[0]);
      }, [currentDate]),

      goToToday: useCallback(() => {
        setCurrentDate(new Date().toISOString().split("T")[0]);
      }, []),

      goToSpecificDate: useCallback((date) => {
        setCurrentDate(date);
      }, []),
    }),
    [currentDate]
  );

  return {
    currentDate,
    setCurrentDate,
    ...navigationHandlers,
  };
};

// Hook for managing search state with debouncing
export const useSearchState = (initialTerm = "") => {
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [debouncedTerm, setDebouncedTerm] = useState(initialTerm);
  const timeoutRef = useRef(null);

  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      setDebouncedTerm(term);
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    searchTerm,
    debouncedTerm,
    updateSearchTerm,
    cleanup,
  };
};

// Hook for managing filter state
export const useFilterState = () => {
  const [filters, setFilters] = useState({
    period: "month",
    status: "all",
    department: "all",
    dateRange: {
      startDate: null,
      endDate: null,
    },
  });

  const updateFilter = useCallback((filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      period: "month",
      status: "all",
      department: "all",
      dateRange: {
        startDate: null,
        endDate: null,
      },
    });
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
  };
};

// Hook for managing attendance data state
export const useAttendanceDataState = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateData = useCallback((data) => {
    setAttendanceData(data);
    setError(null);
  }, []);

  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    attendanceData,
    isLoading,
    error,
    updateData,
    setLoading,
    setErrorState,
    clearError,
  };
};
