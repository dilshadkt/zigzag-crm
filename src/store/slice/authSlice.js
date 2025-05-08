// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) return initialState;
    return JSON.parse(serializedState);
  } catch (error) {
    return initialState;
  }
};

const initialState = {
  user: null,
  companyId: null,
  isAuthenticated: false,
  loading: true,
  isProfileComplete: false,
  isCompany: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadState(),
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.companyId = action.payload.companyId;
      state.isAuthenticated = true;
      state.loading = false;
      state.isCompany = action.payload?.user?.role === "company-admin";
      state.isProfileComplete = action.payload.isProfileComplete;
      localStorage.setItem("authState", JSON.stringify(state)); // Save state
    },
    logout(state) {
      state.user = null;
      state.companyId = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem("authState"); // Clear state
    },
    setLoading(state, action) {
      state.loading = action.payload; // Update loading state
    },
  },
});

export const { loginSuccess, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
