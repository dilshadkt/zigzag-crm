import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("projectState");
    if (serializedState === null) return initialState;
    return JSON.parse(serializedState);
  } catch (error) {
    return initialState;
  }
};

const initialState = {
  activeProject: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState: loadState(),
  reducers: {
    setActiveProject(state, action) {
      state.activeProject = action.payload;
      localStorage.setItem("projectState", JSON.stringify(state));
    },
  },
});

export const { setActiveProject } = projectSlice.actions;
export default projectSlice.reducer;
