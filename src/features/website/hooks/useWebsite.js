import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { websiteApi } from "../api/websiteApi";
import { errorMessage } from "../../accounts/utils/format";

const KEY = "website";

const useRead = (name, fn, params, options = {}) =>
  useQuery({
    queryKey: [KEY, name, params ?? null],
    queryFn: () => fn(params),
    ...options,
  });

/** Every change refreshes all website queries. */
const useWrite = (fn, { success, silent } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      if (success) toast.success(success);
    },
    onError: (error) => {
      if (!silent) toast.error(errorMessage(error));
    },
  });
};

export const useWebsiteMeta = () => useRead("meta", websiteApi.meta, null, { retry: false });
export const useSiteOptions = (enabled) => useRead("options", websiteApi.options, null, { enabled });
export const useSectionCounts = (siteId) => useRead("counts", websiteApi.counts, siteId);
export const useEntries = (params) => useRead("entries", websiteApi.list, params, { placeholderData: keepPreviousData });
// Always read afresh, and never replaced under someone who is typing
export const useEntry = (params, enabled) =>
  useRead("entry", websiteApi.entry, params, { enabled, gcTime: 0, staleTime: Infinity, refetchOnWindowFocus: false });

export const useCreateSite = () => useWrite(websiteApi.createSite, { success: "Website connected" });
export const useUpdateSite = () => useWrite(websiteApi.updateSite, { success: "Website saved" });
export const useRegenerateKey = () => useWrite(websiteApi.regenerateKey, { success: "New address created" });

export const useCreateEntry = () => useWrite(websiteApi.createEntry, { success: "Added" });
export const useUpdateEntry = () => useWrite(websiteApi.updateEntry, { success: "Saved" });
export const useDeleteEntry = () => useWrite(websiteApi.deleteEntry, { success: "Deleted" });
export const useDuplicateEntry = () => useWrite(websiteApi.duplicateEntry, { success: "Copy created" });
export const useReorder = () => useWrite(websiteApi.reorder, { success: "Order saved" });
