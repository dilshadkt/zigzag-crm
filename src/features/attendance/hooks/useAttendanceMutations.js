import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendanceApi";

const patchAttendanceRecordInCache = (queryClient, attendance) => {
  if (!attendance?._id) return;
  const recordId = String(attendance._id);

  const patchList = (old) => {
    if (!old) return old;
    const lists = ["report", "attendance"];
    for (const key of lists) {
      if (!Array.isArray(old[key])) continue;
      return {
        ...old,
        [key]: old[key].map((row) =>
          String(row._id) === recordId ? { ...row, ...attendance } : row
        ),
      };
    }
    return old;
  };

  queryClient.setQueriesData({ queryKey: ["dailyReport"] }, patchList);
  queryClient.setQueriesData({ queryKey: ["dateRangeReport"] }, patchList);
  queryClient.setQueriesData({ queryKey: ["employeeAttendance"] }, patchList);
};

const invalidateAttendanceQueries = async (queryClient, attendance) => {
  patchAttendanceRecordInCache(queryClient, attendance);
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["dailyReport"] }),
    queryClient.invalidateQueries({ queryKey: ["dateRangeReport"] }),
    queryClient.invalidateQueries({ queryKey: ["employeeAttendance"] }),
    queryClient.invalidateQueries({ queryKey: ["attendanceStatus"] }),
    queryClient.invalidateQueries({ queryKey: ["currentStatus"] }),
    queryClient.invalidateQueries({ queryKey: ["pendingCorrectionRequests"] }),
  ]);
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ["dailyReport"] }),
    queryClient.refetchQueries({ queryKey: ["dateRangeReport"] }),
    queryClient.refetchQueries({ queryKey: ["pendingCorrectionRequests"] }),
  ]);
};

export const usePendingCorrectionRequests = (enabled = false) => {
  return useQuery({
    queryKey: ["pendingCorrectionRequests"],
    queryFn: () => attendanceApi.getPendingCorrections(),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attendanceId, data }) =>
      attendanceApi.updateAttendance(attendanceId, data),
    onSuccess: (data) => invalidateAttendanceQueries(queryClient, data?.attendance),
  });
};

export const useRequestAttendanceCorrection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attendanceId, data }) =>
      attendanceApi.requestCorrection(attendanceId, data),
    onSuccess: () => invalidateAttendanceQueries(queryClient),
  });
};

export const useReviewAttendanceCorrection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attendanceId, data }) =>
      attendanceApi.reviewCorrection(attendanceId, data),
    onSuccess: (data) => invalidateAttendanceQueries(queryClient, data?.attendance),
  });
};
