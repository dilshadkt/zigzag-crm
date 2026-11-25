import axios from "axios";

// The student portal keeps its own session, separate from staff logins, so a
// staff member and a student can use the same browser without clashing.
export const STUDENT_TOKEN_KEY = "studentToken";

const baseURL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const studentClient = axios.create({ baseURL: `${baseURL}/academy-portal` });

export const getStudentToken = () => {
  try {
    return localStorage.getItem(STUDENT_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStudentToken = (token) => {
  try {
    if (token) localStorage.setItem(STUDENT_TOKEN_KEY, token);
    else localStorage.removeItem(STUDENT_TOKEN_KEY);
  } catch {
    /* storage blocked */
  }
};

studentClient.interceptors.request.use((config) => {
  const token = getStudentToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

studentClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/login");
    if (error.response?.status === 401 && !isLogin) {
      setStudentToken(null);
      if (!window.location.pathname.startsWith("/student/login")) {
        window.location.href = "/student/login";
      }
    }
    return Promise.reject(error?.response?.data || { message: error?.message || "Something went wrong" });
  }
);

export const studentApi = {
  login: async (body) => (await studentClient.post("/login", body)).data,
  me: async () => (await studentClient.get("/me")).data,
  changePassword: async (body) => (await studentClient.put("/me/password", body)).data,
  tasks: async () => (await studentClient.get("/tasks")).data,
  submitTask: async ({ id, link, note, file }) => {
    const form = new FormData();
    if (link) form.append("link", link);
    if (note) form.append("note", note);
    if (file) form.append("file", file);
    return (await studentClient.post(`/tasks/${id}/submit`, form)).data;
  },
  photo: async () => (await studentClient.get("/me/photo", { responseType: "blob" })).data,
  uploadPhoto: async (file) => {
    const form = new FormData();
    form.append("photo", file);
    return (await studentClient.post("/me/photo", form)).data;
  },
  removePhoto: async () => (await studentClient.delete("/me/photo")).data,
  attendance: async () => (await studentClient.get("/attendance")).data,
};

export default studentClient;
