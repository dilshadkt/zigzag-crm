import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import projuctReducer from "./slice/projectSlice";
import timerReducer from "./slice/timerSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projuctReducer,
    timer: timerReducer,
  },
});

export default store;
