import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useIsDepartmentHead } from "../../api/hooks";

const ActionRequiredBanner = () => {
  const { user, companyId } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const { canAccessDepartmentDashboard, departments, totalActionRequiredCount } = useIsDepartmentHead(effectiveCompanyId, !!user);
  const navigate = useNavigate();

  if (!canAccessDepartmentDashboard || totalActionRequiredCount === 0) {
    return null;
  }

  const deptsWithConflicts = departments.filter(d => d.actionRequiredCount > 0);

  const handleClick = () => {
    if (deptsWithConflicts.length === 1) {
      navigate(`/department-dashboard?department=${deptsWithConflicts[0]._id}`);
    } else {
      navigate("/department-dashboard");
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 mt-3 mb-2 cursor-pointer hover:border-red-300 transition-colors flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-3">
        <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-[13px] font-bold text-gray-800">
            Action Required: Leave Conflicts
          </span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="text-[12px] text-gray-500">
            {totalActionRequiredCount} task{totalActionRequiredCount === 1 ? "" : "s"} requiring attention
          </span>
        </div>
      </div>
      <div className="flex items-center text-[#3F8CFF] font-medium text-[12px] gap-1 bg-[#F4F9FD] px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shrink-0">
        <span>View Details</span>
        <FiChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

export default ActionRequiredBanner;
