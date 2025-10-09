// store/calendarSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Define initial state first
const initialState = {
  eventFilters: {
    tasks: true,
    subtasks: true,
    projects: true,
    birthdays: true,
  },
  assignerFilter: null,
  projectFilter: null,
  currentDate: new Date().toISOString(), // Store as ISO string for serialization
};

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("calendarFilters");
    if (serializedState === null) return initialState;
    return JSON.parse(serializedState);
  } catch (error) {
    return initialState;
  }
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState: loadState(),
  reducers: {
    setEventFilters(state, action) {
      state.eventFilters = action.payload;
      localStorage.setItem("calendarFilters", JSON.stringify(state));
    },
    toggleEventFilter(state, action) {
      const filterType = action.payload;
      state.eventFilters[filterType] = !state.eventFilters[filterType];
      localStorage.setItem("calendarFilters", JSON.stringify(state));
    },
    setAssignerFilter(state, action) {
      state.assignerFilter = action.payload;
      localStorage.setItem("calendarFilters", JSON.stringify(state));
    },
    setProjectFilter(state, action) {
      state.projectFilter = action.payload;
      localStorage.setItem("calendarFilters", JSON.stringify(state));
    },
    setCurrentDate(state, action) {
      state.currentDate = action.payload;
      localStorage.setItem("calendarFilters", JSON.stringify(state));
    },
    resetCalendarFilters(state) {
      state.eventFilters = initialState.eventFilters;
      state.assignerFilter = initialState.assignerFilter;
      state.projectFilter = initialState.projectFilter;
      state.currentDate = initialState.currentDate;
      localStorage.setItem("calendarFilters", JSON.stringify(state));
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
} = calendarSlice.actions;

export default calendarSlice.reducer;
