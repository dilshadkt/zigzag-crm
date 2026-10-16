import { useMemo } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDailyChecklistSummary,
  updateDailyChecklistStatus,
} from "../../../api/service";

// Today's checklist items assigned to this user. Shares its query key with the
// floating checklist drawer, so ticking an item in either place updates both.
export const useMyDailyChecklist = (userId) => {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const queryKey = ["dailyChecklistSummary", today];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getDailyChecklistSummary(today),
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = useMemo(
    () =>
      (data?.tasks || []).filter(
        (item) => userId && String(item.assignedTo?._id || item.assignedTo) === String(userId)
      ),
    [data, userId]
  );

  const toggle = useMutation({
    mutationFn: ({ projectId, title, completed }) =>
      updateDailyChecklistStatus(projectId, { date: today, taskTitle: title, completed }),
    onMutate: async ({ projectId, title, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) =>
        old
          ? {
              ...old,
              tasks: old.tasks.map((t) =>
                t.projectId === projectId && t.title === title
                  ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null }
                  : t
              ),
            }
          : old
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const done = items.filter((item) => item.completed).length;

  return {
    items,
    total: items.length,
    done,
    // Only counts as finished once every item assigned to the user is ticked
    allDone: items.length > 0 && done === items.length,
    isLoading,
    toggleItem: (item) =>
      toggle.mutate({ projectId: item.projectId, title: item.title, completed: !item.completed }),
  };
};
