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
  assignerFilter: [],
  projectFilter: [],
  publishPendingOnly: false,
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
  const stateToPersist = { ...state };
  delete stateToPersist.currentDate;
  localStorage.setItem(getStorageKey(), JSON.stringify(stateToPersist));
};

// Load state from localStorage
const loadState = () => {
  const defaultState = createDefaultState();
  try {
    const serializedState = localStorage.getItem(getStorageKey());
    if (serializedState === null) return defaultState;
    const parsedState = JSON.parse(serializedState);
    delete parsedState.currentDate;
    return {
      ...defaultState,
      ...parsedState,
      assignerFilter: Array.isArray(parsedState?.assignerFilter)
        ? parsedState.assignerFilter
        : parsedState?.assignerFilter
          ? [parsedState.assignerFilter]
          : [],
      projectFilter: Array.isArray(parsedState?.projectFilter)
        ? parsedState.projectFilter
        : parsedState?.projectFilter
          ? [parsedState.projectFilter]
          : [],
      eventFilters: {
        ...defaultState.eventFilters,
        ...parsedState?.eventFilters,
      },
      publishPendingOnly: parsedState?.publishPendingOnly || false,
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
    togglePublishPendingFilter(state) {
      state.publishPendingOnly = !state.publishPendingOnly;
      persistState(state);
    },
    setAssignerFilter(state, action) {
      const assignerId = action.payload;
      if (assignerId === null) {
        state.assignerFilter = [];
      } else {
        const index = state.assignerFilter.indexOf(assignerId);
        if (index === -1) {
          state.assignerFilter.push(assignerId);
        } else {
          state.assignerFilter.splice(index, 1);
        }
      }
      persistState(state);
    },
    setProjectFilter(state, action) {
      const projectId = action.payload;
      if (projectId === null) {
        state.projectFilter = [];
      } else {
        const index = state.projectFilter.indexOf(projectId);
        if (index === -1) {
          state.projectFilter.push(projectId);
        } else {
          state.projectFilter.splice(index, 1);
        }
      }
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
      state.publishPendingOnly = defaultState.publishPendingOnly;
      state.currentDate = defaultState.currentDate;
      persistState(state);
    },
    reloadCalendarState(state) {
      // Reload state from localStorage for current user
      const reloadedState = loadState();
      state.eventFilters = reloadedState.eventFilters;
      state.assignerFilter = reloadedState.assignerFilter;
      state.projectFilter = reloadedState.projectFilter;
      state.publishPendingOnly = reloadedState.publishPendingOnly;
      state.currentDate = reloadedState.currentDate;
    },
  },
});

export const {
  setEventFilters,
  toggleEventFilter,
  togglePublishPendingFilter,
  setAssignerFilter,
  setProjectFilter,
  setCurrentDate,
  resetCalendarFilters,
  reloadCalendarState,
} = calendarSlice.actions;

export default calendarSlice.reducer;
