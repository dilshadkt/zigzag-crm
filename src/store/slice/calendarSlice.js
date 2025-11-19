// store/calendarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const BASE_STORAGE_KEY = "calendarFilters";

const createDefaultState = () => ({
  eventFilters: {
    tasks: true,
    subtasks: true,
    projects: true,
    birthdays: true,
  },
  assignerFilter: null,
  projectFilter: null,
  currentDate: new Date().toISOString(), // Store as ISO string for serialization
});

const getCurrentUserId = () => {
  try {
    const serializedAuth = localStorage.getItem("authState");
    if (!serializedAuth) return null;
    const parsedAuth = JSON.parse(serializedAuth);
    return parsedAuth?.user?._id || parsedAuth?.user?.id || null;
  } catch (error) {
    return null;
  }
};

const getStorageKey = () => {
  const userId = getCurrentUserId();
  return userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;
};

const persistState = (state) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(state));
};

// Load state from localStorage
const loadState = () => {
  const defaultState = createDefaultState();
  try {
    const serializedState = localStorage.getItem(getStorageKey());
    if (serializedState === null) return defaultState;
    const parsedState = JSON.parse(serializedState);
    return {
      ...defaultState,
      ...parsedState,
      eventFilters: {
        ...defaultState.eventFilters,
        ...parsedState?.eventFilters,
      },
    };
  } catch (error) {
    return defaultState;
  }
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState: loadState(),
  reducers: {
    setEventFilters(state, action) {
      state.eventFilters = action.payload;
      persistState(state);
    },
    toggleEventFilter(state, action) {
      const filterType = action.payload;
      state.eventFilters[filterType] = !state.eventFilters[filterType];
      persistState(state);
    },
    setAssignerFilter(state, action) {
      state.assignerFilter = action.payload;
      persistState(state);
    },
    setProjectFilter(state, action) {
      state.projectFilter = action.payload;
      persistState(state);
    },
    setCurrentDate(state, action) {
      state.currentDate = action.payload;
      persistState(state);
    },
    resetCalendarFilters(state) {
      const defaultState = createDefaultState();
      state.eventFilters = defaultState.eventFilters;
      state.assignerFilter = defaultState.assignerFilter;
      state.projectFilter = defaultState.projectFilter;
      state.currentDate = defaultState.currentDate;
      persistState(state);
    },
    reloadCalendarState(state) {
      // Reload state from localStorage for current user
      const reloadedState = loadState();
      state.eventFilters = reloadedState.eventFilters;
      state.assignerFilter = reloadedState.assignerFilter;
      state.projectFilter = reloadedState.projectFilter;
      state.currentDate = reloadedState.currentDate;
    },
  },
});

export const {
  setEventFilters,
  toggleEventFilter,
  setAssignerFilter,
  setProjectFilter,
  setCurrentDate,
  resetCalendarFilters,
  reloadCalendarState,
} = calendarSlice.actions;

export default calendarSlice.reducer;
