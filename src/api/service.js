import apiClient from "./client";

export const register = async (data) => {
  try {
    const response = await apiClient.post("/auth/register", data);
    if (response?.data) {
      return { success: true };
    }
  } catch (error) {
    console.error("Login error", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Login failed",
    };
  }
};

export const signIn = async (data) => {
  try {
    const response = await apiClient.post("/auth/login", data);
    if (response?.data?.token) {
      localStorage.setItem("token", response.data.token); // Store token for authentication
      return { success: true, user: response.data.user };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};
