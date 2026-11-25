import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { academyApi } from "../api/academyApi";

const idOf = (value) => String(value?._id || value?.id || value || "");

/**
 * Which leads can become academy students. Only staff who manage students ask
 * the server; for everyone else nothing changes on the lead screens.
 */
const useLeadConversion = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const permitted = Boolean(user) && user.role !== "client" && Boolean(hasPermission("academy", "manageStudents"));
  const { data } = useQuery({
    queryKey: ["academy", "leadConversion"],
    queryFn: academyApi.leadConversion,
    enabled: permitted,
    staleTime: 60 * 1000,
    retry: false,
  });
  const projects = useMemo(() => new Set(data?.projectIds || []), [data]);

  return {
    allowed: permitted && Boolean(data),
    studentFor: (leadId) => data?.converted?.[String(leadId)] || null,
    isAcademyLead: (lead) => projects.has(idOf(lead?.project) || idOf(lead?.campaign?.project)),
  };
};

export default useLeadConversion;
