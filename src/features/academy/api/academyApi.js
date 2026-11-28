import apiClient from "../../../api/client";

const clean = (params) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

const get = async (url, params) => (await apiClient.get(`/academy${url}`, { params: clean(params) })).data;
const post = async (url, body) => (await apiClient.post(`/academy${url}`, body || {})).data;
const put = async (url, body) => (await apiClient.put(`/academy${url}`, body || {})).data;
const patch = async (url, body) => (await apiClient.patch(`/academy${url}`, body || {})).data;
const del = async (url, params) => (await apiClient.delete(`/academy${url}`, { params: clean(params) })).data;

const upload = async (url, fields) => {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") form.append(k, v);
  });
  return (await apiClient.post(`/academy${url}`, form, { headers: { "Content-Type": "multipart/form-data" } })).data;
};

// A blob URL runs with this app's origin, so only types that cannot run
// script are ever displayed. Anything else is saved to disk.
const VIEWABLE = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"];

/** Fetches a protected file and opens it (or saves it) in the browser. */
export const openProtectedFile = async (client, url, { download = false, fileName } = {}) => {
  // Open the tab first so pop-up blockers allow it
  const win = download ? null : window.open("", "_blank");
  try {
    const res = await client.get(url, { responseType: "blob" });
    const blobUrl = URL.createObjectURL(res.data);
    if (download || !win || !VIEWABLE.includes(res.data.type)) {
      win?.close();
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      win.location.href = blobUrl;
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (error) {
    if (win) win.close();
    throw error instanceof Blob ? new Error("Could not open the file") : error;
  }
};

export const academyApi = {
  meta: () => get("/meta"),
  overview: () => get("/overview"),
  feeDues: (params) => get("/fees/dues", params),

  courses: (params) => get("/courses", params),
  createCourse: (body) => post("/courses", body),
  updateCourse: ({ id, ...body }) => put(`/courses/${id}`, body),
  deleteCourse: (id) => del(`/courses/${id}`),
  trainers: () => get("/trainers"),
  batch: (id) => get(`/batches/${id}`),
  createBatch: (body) => post("/batches", body),
  updateBatch: ({ id, ...body }) => put(`/batches/${id}`, body),
  deleteBatch: (id) => del(`/batches/${id}`),

  batchSyllabus: (id) => get(`/batches/${id}/syllabus`),
  setBatchSyllabus: ({ id, items, done }) => put(`/batches/${id}/syllabus`, { items, done }),
  uploadModuleFile: ({ courseId, moduleId, file }) => upload(`/courses/${courseId}/modules/${moduleId}/files`, { file }),
  deleteModuleFile: ({ courseId, moduleId, fileId }) => del(`/courses/${courseId}/modules/${moduleId}/files/${fileId}`),
  openModuleFile: (courseId, moduleId, fileId, opts) =>
    openProtectedFile(apiClient, `/academy/courses/${courseId}/modules/${moduleId}/files/${fileId}`, opts),

  setModuleFaculty: ({ id, module, faculty }) => put(`/batches/${id}/faculty`, { module, faculty }),

  leadConversion: () => get("/lead-conversion"),
  leadClients: () => get("/lead-clients"),
  saveLeadClients: (projectIds) => put("/lead-clients", { projectIds }),
  leadPrefill: (leadId) => get(`/leads/${leadId}/convert`),
  convertLead: ({ leadId, ...body }) => post(`/leads/${leadId}/convert`, body),

  students: (params) => get("/students", params),
  student: (id) => get(`/students/${id}`),
  createStudent: (body) => post("/students", body),
  updateStudent: ({ id, ...body }) => put(`/students/${id}`, body),
  resetPassword: (id) => post(`/students/${id}/reset-password`),
  setActive: ({ id, isActive }) => patch(`/students/${id}/active`, { isActive }),
  deleteStudent: (id) => del(`/students/${id}`),

  addEnrollment: ({ studentId, ...body }) => post(`/students/${studentId}/enrollments`, body),
  updateEnrollment: ({ id, ...body }) => put(`/enrollments/${id}`, body),
  deleteEnrollment: (id) => del(`/enrollments/${id}`),
  changeCourse: ({ id, ...body }) => put(`/enrollments/${id}/course`, body),
  setFees: ({ id, ...body }) => put(`/enrollments/${id}/fees`, body),
  addPayment: ({ id, ...body }) => post(`/enrollments/${id}/payments`, body),
  removePayment: ({ id, paymentId }) => del(`/enrollments/${id}/payments/${paymentId}`),

  tasks: (params) => get("/tasks", params),
  createTask: (body) => post("/tasks", body),
  updateTask: ({ id, ...body }) => put(`/tasks/${id}`, body),
  deleteTask: (id) => del(`/tasks/${id}`),
  submissions: (taskId) => get(`/tasks/${taskId}/submissions`),
  reviewSubmission: ({ id, ...body }) => put(`/submissions/${id}/review`, body),
  openSubmissionFile: (id, opts) => openProtectedFile(apiClient, `/academy/submissions/${id}/file`, opts),

  attendanceDay: (params) => get("/attendance", params),
  saveAttendance: (body) => put("/attendance", body),
  deleteAttendance: (params) => del("/attendance", params),
  attendanceMonth: (params) => get("/attendance/summary", params),

  certificates: () => get("/certificates"),
  nextCertificateNumber: () => get("/certificates/next-number"),
  issueCertificate: ({ id, file, number, issuedAt }) => upload(`/enrollments/${id}/certificate`, { file, number, issuedAt }),
  revokeCertificate: (id) => del(`/enrollments/${id}/certificate`),
  openCertificateFile: (id, opts) => openProtectedFile(apiClient, `/academy/enrollments/${id}/certificate/file`, opts),
};
