import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("timerState");
    if (serializedState === null) return initialState;
    return JSON.parse(serializedState);
  } catch (error) {
    return initialState;
  }
};

const initialState = {
  totalTime: 300, // Default 5 minutes in seconds
  remainingTime: 300,
  isRunning: false,
  startTime: null, // Track when timer was started for accurate time calculation
};

const timerSlice = createSlice({
  name: "timer",
  initialState: loadState(),
  reducers: {
    setTotalTime(state, action) {
      state.totalTime = action.payload;
      state.remainingTime = action.payload;
      localStorage.setItem("timerState", JSON.stringify(state));
    },
    setRemainingTime(state, action) {
      state.remainingTime = action.payload;
      localStorage.setItem("timerState", JSON.stringify(state));
    },
    startTimer(state) {
      state.isRunning = true;
      state.startTime = Date.now();
      localStorage.setItem("timerState", JSON.stringify(state));
    },
    stopTimer(state) {
      state.isRunning = false;
      state.startTime = null;
      localStorage.setItem("timerState", JSON.stringify(state));
    },
    resetTimer(state) {
      state.isRunning = false;
      state.remainingTime = state.totalTime;
      state.startTime = null;
      localStorage.setItem("timerState", JSON.stringify(state));
    },
    updateTimer(state) {
      // This action updates the timer based on elapsed time since start
      if (state.isRunning && state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const newRemainingTime = Math.max(0, state.totalTime - elapsed);
        state.remainingTime = newRemainingTime;

        if (newRemainingTime === 0) {
          state.isRunning = false;
          state.startTime = null;
        }

        localStorage.setItem("timerState", JSON.stringify(state));
      }
    },
    // Action to sync timer state when component mounts (handles page refresh/navigation)
    syncTimer(state) {
      if (state.isRunning && state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const newRemainingTime = Math.max(0, state.totalTime - elapsed);
        state.remainingTime = newRemainingTime;

        if (newRemainingTime === 0) {
          state.isRunning = false;
          state.startTime = null;
        }

        localStorage.setItem("timerState", JSON.stringify(state));
      }
    },
  },
});

export const {
  setTotalTime,
  setRemainingTime,
  startTimer,
  stopTimer,
  resetTimer,
  updateTimer,
  syncTimer,
} = timerSlice.actions;

export default timerSlice.reducer;
