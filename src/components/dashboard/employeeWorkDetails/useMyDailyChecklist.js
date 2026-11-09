import { useMemo } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDailyChecklistSummary, setChecklistTaskCompleted } from "../../../api/service";

// A task is identified by its general-item id, or by project + title for project items
export const isSameChecklistTask = (a, b) =>
  a.itemId || b.itemId
    ? a.itemId === b.itemId
    : a.projectId === b.projectId && a.title === b.title;

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
    mutationFn: ({ item, completed }) =>
      setChecklistTaskCompleted(item, { date: today, completed }),
    onMutate: async ({ item, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) =>
        old
          ? {
              ...old,
              tasks: old.tasks.map((t) =>
                isSameChecklistTask(t, item)
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
    toggleItem: (item) => toggle.mutate({ item, completed: !item.completed }),
  };
};
