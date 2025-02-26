import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import projuctReducer from "./slice/projectSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projuctReducer,
  },
});

export default store;
