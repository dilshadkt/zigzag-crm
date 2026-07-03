import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return "http://localhost:5000/api";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Set Authorization header
      }
    } catch (e) {
      console.error("LocalStorage access failed:", e);
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
      // Check if we are on a portal route
      const isPortalRoute = window.location.pathname.includes('portal') ||
        window.location.pathname.includes('client') ||
        window.location.hash.includes('portal') ||
        window.location.hash.includes('client');

      const targetPath = isPortalRoute ? "/portal/login" : "/auth/signin";
      const desktopPath = isDesktop ? `#${targetPath}` : targetPath;

      if (isDesktop && !window.location.hash.includes(targetPath)) {
        window.location.hash = targetPath;
      } else if (!isDesktop && !window.location.pathname.includes(targetPath)) {
        window.location.href = targetPath;
      }
    };

    if (
      error.response?.status === 401 ||
      error.response?.data?.message === "Invalid token"
    ) {
      try {
        localStorage.removeItem("token");
      } catch (e) { }
      redirectToSignIn();
    }
    return Promise.reject(error?.response?.data || error?.message || "Something went wrong");
  }
);

export default apiClient;
