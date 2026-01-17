import axios from "axios";

const apiClient = axios.create({
  // baseURL: "https://crm.zigzagdigitalsolutions.com/api",
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Set Authorization header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isDesktop = typeof window !== "undefined" && window.desktop;
    const redirectToSignIn = () => {
      if (isDesktop) {
        if (!window.location.href.includes("#/auth/signin")) {
          window.location.hash = "/auth/signin";
        }
      } else if (!window.location.href.includes("/auth/signin")) {
        window.location.href = "/auth/signin";
      }
    };

    if (
      error.response?.status === 401 ||
      error.response?.data?.message === "Invalid token"
    ) {
      localStorage.removeItem("token");
      redirectToSignIn();
    }
    return Promise.reject(error || "Something went wrong");
  }
);

export default apiClient;
