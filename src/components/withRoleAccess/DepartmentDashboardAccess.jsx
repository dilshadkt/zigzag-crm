import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useIsDepartmentHead } from "../../api/hooks";
import LoadingSpinner from "../LoadingSpinner";

const DepartmentDashboardAccess = ({ children, fallbackPath = "/unauthorized" }) => {
  const { companyId, user } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const { isDepartmentHead, isLoading } = useIsDepartmentHead(effectiveCompanyId, !!user);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isDepartmentHead) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default DepartmentDashboardAccess;
