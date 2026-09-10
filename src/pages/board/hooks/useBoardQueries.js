import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/client";

export const BOARD_COLUMN_LIMIT = 30;
export const BOARD_QUERY_KEY = "boardColumn";
export const BOARD_META_KEY = "boardMeta";

const appendBoardFilters = (params, filters = {}) => {
  if (filters.taskMonth) params.set("taskMonth", filters.taskMonth);
  if (filters.project && filters.project !== "all") {
    params.set("project", filters.project);
  }
  if (filters.assignee && filters.assignee !== "all") {
    params.set("assignee", filters.assignee);
  }
  if (filters.priority && filters.priority !== "all") {
    params.set("priority", filters.priority);
  }
  if (filters.types !== undefined && filters.types !== null) {
    params.set("types", filters.types);
  }
  if (filters.search) params.set("search", filters.search);
};

export const fetchBoardColumn = async ({ status, page = 1, filters }) => {
  const params = new URLSearchParams();
  params.set("status", status);
  params.set("page", String(page));
  params.set("limit", String(BOARD_COLUMN_LIMIT));
  appendBoardFilters(params, filters);
  const { data } = await apiClient.get(`/tasks/board?${params.toString()}`);
  return data;
};

export const fetchBoardMeta = async (filters) => {
  const params = new URLSearchParams();
  appendBoardFilters(params, filters);
  const query = params.toString();
  const { data } = await apiClient.get(
    query ? `/tasks/board/meta?${query}` : "/tasks/board/meta"
  );
  return data;
};

export const useBoardMeta = (filters, enabled = true) => {
  return useQuery({
    queryKey: [BOARD_META_KEY, filters],
    queryFn: () => fetchBoardMeta(filters),
    enabled,
    staleTime: 15 * 1000,
  });
};

export const useBoardColumn = (status, filters, enabled = true) => {
  return useInfiniteQuery({
    queryKey: [BOARD_QUERY_KEY, status, filters],
    queryFn: ({ pageParam = 1 }) =>
      fetchBoardColumn({ status, page: pageParam, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.page + 1 : undefined,
    enabled: enabled && !!status,
    staleTime: 15 * 1000,
  });
};

export const getBoardColumnKey = (status, filters) => [
  BOARD_QUERY_KEY,
  status,
  filters,
];

export const getBoardMetaKey = (filters) => [BOARD_META_KEY, filters];
