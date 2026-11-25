import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { academyApi } from "../api/academyApi";
import { errorMessage } from "../utils";

const KEY = "academy";

const useRead = (name, fn, params, options = {}) =>
  useQuery({
    queryKey: [KEY, name, params ?? null],
    queryFn: () => fn(params),
    ...options,
  });

/** Every academy mutation refreshes all academy queries. */
const useWrite = (fn, { success, silent } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      if (success) toast.success(typeof success === "function" ? success(data, vars) : success);
    },
    onError: (error) => {
      if (!silent) toast.error(errorMessage(error));
    },
  });
};

export const useAcademyMeta = () => useRead("meta", academyApi.meta, null, { staleTime: 5 * 60 * 1000, retry: false });
export const useAcademyOverview = () => useRead("overview", academyApi.overview);
export const useFeeDues = (params) => useRead("feeDues", academyApi.feeDues, params);

export const useCourses = (params) => useRead("courses", academyApi.courses, params);
export const useTrainers = () => useRead("trainers", academyApi.trainers, null, { staleTime: 10 * 60 * 1000 });
export const useBatch = (id) => useRead("batch", academyApi.batch, id, { enabled: Boolean(id) });
export const useCreateCourse = () => useWrite(academyApi.createCourse, { success: "Course created" });
export const useUpdateCourse = () => useWrite(academyApi.updateCourse, { success: "Course saved" });
export const useDeleteCourse = () => useWrite(academyApi.deleteCourse, { success: "Course deleted" });
export const useCreateBatch = () => useWrite(academyApi.createBatch, { success: "Batch created" });
export const useUpdateBatch = () => useWrite(academyApi.updateBatch, { success: "Batch saved" });
export const useDeleteBatch = () => useWrite(academyApi.deleteBatch, { success: "Batch deleted" });

export const useSaveSyllabus = () => useWrite(academyApi.updateCourse, { success: "Syllabus saved" });
export const useUploadModuleFile = () => useWrite(academyApi.uploadModuleFile, { success: "File added" });
export const useDeleteModuleFile = () => useWrite(academyApi.deleteModuleFile, { success: "File removed" });
export const useBatchSyllabus = (id) => useRead("batchSyllabus", academyApi.batchSyllabus, id, { enabled: Boolean(id) });
export const useSetBatchSyllabus = () => useWrite(academyApi.setBatchSyllabus);

export const useStudents = (params) =>
  useRead("students", academyApi.students, params, { placeholderData: keepPreviousData });
export const useStudent = (id) => useRead("student", academyApi.student, id, { enabled: Boolean(id) });
export const useCreateStudent = () => useWrite(academyApi.createStudent, { success: "Student added" });
export const useUpdateStudent = () => useWrite(academyApi.updateStudent, { success: "Student saved" });
export const useResetPassword = () => useWrite(academyApi.resetPassword, { success: "New password created" });
export const useSetStudentActive = () =>
  useWrite(academyApi.setActive, { success: (d) => (d.student?.isActive ? "Portal access turned on" : "Portal access turned off") });
export const useDeleteStudent = () => useWrite(academyApi.deleteStudent, { success: "Student deleted" });

export const useAddEnrollment = () => useWrite(academyApi.addEnrollment, { success: "Enrolled" });
export const useUpdateEnrollment = () => useWrite(academyApi.updateEnrollment, { success: "Enrollment updated" });
export const useDeleteEnrollment = () => useWrite(academyApi.deleteEnrollment, { success: "Enrollment removed" });
export const useSetFees = () => useWrite(academyApi.setFees, { success: "Fee plan saved" });
export const useAddPayment = () => useWrite(academyApi.addPayment, { success: "Payment recorded" });
export const useRemovePayment = () => useWrite(academyApi.removePayment, { success: "Payment removed" });

export const useTasks = (params) => useRead("tasks", academyApi.tasks, params);
export const useCreateTask = () => useWrite(academyApi.createTask, { success: "Task created" });
export const useUpdateTask = () => useWrite(academyApi.updateTask, { success: "Task saved" });
export const useDeleteTask = () => useWrite(academyApi.deleteTask, { success: "Task deleted" });
export const useSubmissions = (taskId) =>
  useRead("submissions", academyApi.submissions, taskId, { enabled: Boolean(taskId) });
export const useReviewSubmission = () => useWrite(academyApi.reviewSubmission, { success: "Review saved" });

export const useAttendanceDay = (params) =>
  useRead("attendanceDay", academyApi.attendanceDay, params, { enabled: Boolean(params?.batch && params?.day) });
export const useSaveAttendance = () => useWrite(academyApi.saveAttendance, { success: "Attendance saved" });
export const useDeleteAttendance = () => useWrite(academyApi.deleteAttendance, { success: "Attendance cleared" });
export const useAttendanceMonth = (params) =>
  useRead("attendanceMonth", academyApi.attendanceMonth, params, { enabled: Boolean(params?.batch && params?.month) });

export const useCertificates = () => useRead("certificates", academyApi.certificates);
export const useNextCertificateNumber = (enabled) =>
  useRead("nextCertNo", academyApi.nextCertificateNumber, null, { enabled, staleTime: 0 });
export const useIssueCertificate = () => useWrite(academyApi.issueCertificate, { success: "Certificate uploaded" });
export const useRevokeCertificate = () => useWrite(academyApi.revokeCertificate, { success: "Certificate removed" });
