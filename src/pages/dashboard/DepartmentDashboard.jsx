import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiAlertCircle, FiGrid } from "react-icons/fi";
import { useGetDepartmentDashboard } from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/shared/header";
import DepartmentEmployeeCard from "../../components/dashboard/DepartmentEmployeeCard";

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { companyId, user } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const { data, isLoading, error } = useGetDepartmentDashboard(effectiveCompanyId);
  const departments = data?.departments || [];
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const activeDepartmentId = useMemo(() => {
    if (!departments.length) return "";
    if (
      selectedDepartmentId &&
      departments.some((dept) => dept._id === selectedDepartmentId)
    ) {
      return selectedDepartmentId;
    }
    return departments[0]._id;
  }, [departments, selectedDepartmentId]);

  const activeDepartment = departments.find(
    (dept) => dept._id === activeDepartmentId
  );

  const totalTeamMembers = departments.reduce(
    (total, dept) => total + dept.employeeCount,
    0
  );

  if (isLoading) {
    return (
      <section className="flex flex-col h-full gap-y-3">
        <Header>Department Dashboard</Header>
        <div className="flex flex-col justify-center items-center h-36 bg-white rounded-2xl border border-gray-100">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-3 text-[12px] font-medium text-gray-500">
            Loading department data...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col h-full gap-y-3">
        <Header>Department Dashboard</Header>
        <div className="bg-white border border-red-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <FiAlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-gray-800">
                Failed to load dashboard
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {error.message || "Something went wrong while fetching your departments."}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col overflow-y-auto h-full gap-y-3">
      <div className="flexBetween flex-col md:flex-row gap-2">
        <Header>Department Dashboard</Header>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/department-dashboard/team-tasks")}
            className="px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-[#3F8CFF] text-white hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <FiGrid className="w-4 h-4" />
            View Team Tasks
          </button>
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#91929E]">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-100">
            {departments.length} Dept{departments.length === 1 ? "" : "s"}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-100">
            {totalTeamMembers} Member{totalTeamMembers === 1 ? "" : "s"}
          </span>
          </div>
        </div>
      </div>

      {departments.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {departments.map((department) => (
            <button
              key={department._id}
              type="button"
              onClick={() => setSelectedDepartmentId(department._id)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all border ${
                activeDepartmentId === department._id
                  ? "bg-[#3F8CFF] text-white border-[#3F8CFF]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-[#3F8CFF]"
              }`}
            >
              {department.name}
              <span className="ml-1.5 opacity-80">({department.employeeCount})</span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-gray-800">
              {activeDepartment?.name}
            </h3>
            {activeDepartment?.description ? (
              <p className="text-[13px] text-[#91929E] truncate mt-0.5">
                {activeDepartment.description}
              </p>
            ) : (
              <p className="text-[13px] text-[#91929E] mt-0.5">
                Team overview and daily task progress
              </p>
            )}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#7D8592] bg-[#F4F9FD] px-2 py-1 rounded-md shrink-0">
            {activeDepartment?.employeeCount || 0} employees
          </span>
        </div>

        <div className="p-3">
          {activeDepartment?.employees?.length ? (
            <div className="flex flex-col gap-2">
              {activeDepartment.employees.map((employee) => (
                <DepartmentEmployeeCard
                  key={employee._id}
                  employee={employee}
                  departmentId={activeDepartmentId}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 bg-[#F4F9FD] rounded-xl flex items-center justify-center mb-3">
                <FiUsers className="w-5 h-5 text-gray-300" />
              </div>
              <h4 className="text-[13px] font-bold text-gray-800 mb-1">
                No employees assigned
              </h4>
              <p className="text-[11px] text-[#91929E] max-w-sm">
                Employees will appear here once they are assigned to this department.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DepartmentDashboard;
