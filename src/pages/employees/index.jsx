import React, { useState } from "react";
import { useAddEmployee, useEmpoyees } from "../../api/hooks";
import CreateEmployee from "../../components/employees/addEmployee";
import EmployeeActivity from "../../components/employees/employeeActivity";
import EmployeeList from "../../components/employees/employeeList";
import NoEmployees from "../../components/employees/noEmployees";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Header from "../../components/shared/header";
import PageNavigator from "../../components/shared/navigator/pageNavigator";
import { useQueryClient } from "@tanstack/react-query";
import FilterMenu from "../../components/employees/FilterMenu";

const svgProps = {
  className: "w-5 h-5",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

const ICONS = {
  active: (
    <svg {...svgProps}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M17 11l2 2 4-4" />
    </svg>
  ),
  former: (
    <svg {...svgProps}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8M10 12h4" />
    </svg>
  ),
  list: (
    <svg {...svgProps}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  activity: (
    <svg {...svgProps}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
};

const IconToggle = ({ options, value, onChange }) => (
  <div className="h-12 w-fit rounded-3xl grid grid-flow-col p-1 bg-[#E6EDF5]">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        title={option.label}
        aria-label={option.label}
        onClick={() => onChange(option.value)}
        className={`h-full w-12 cursor-pointer rounded-[20px] flexCenter ${
          value === option.value ? "bg-[#3F8CFF] text-white" : "text-gray-800"
        }`}
      >
        {option.icon}
      </button>
    ))}
  </div>
);

const Employees = () => {
  const [stat, setStat] = useState("list");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState(null);
  const [scope, setScope] = useState("Active");
  const showFormer = scope === "Former";
  const { data } = useEmpoyees(currentPage, activeFilters, "", null, showFormer);
  const employees = data?.employees || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };
  const { mutate } = useAddEmployee();
  const queryClient = useQueryClient();
  const [showFilter, setShowFilter] = useState(false);

  const handleCreateEmployee = (
    values,
    { resetForm, setSubmitting, setErrors }
  ) => {
    mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries(["employees"]);
        resetForm();
        setShowAddEmployee(false);
        setSubmitting(false);
      },
      onError: (error) => {
        setSubmitting(false);

        // Handle server-side validation errors
        if (error?.response?.data) {
          const { message, field, errors } = error.response.data;

          // Handle field-specific errors
          if (field) {
            setErrors({ [field]: message });
          } else if (errors && Array.isArray(errors)) {
            // Handle multiple validation errors
            const serverErrors = {};
            errors.forEach((err) => {
              serverErrors[err.field] = err.message;
            });
            setErrors(serverErrors);
          } else {
            // Handle general error message
            setErrors({ general: message || "Failed to create employee" });
          }
        } else {
          setErrors({
            general: "Failed to create employee. Please try again.",
          });
        }
      },
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const renderStat = () => {
    if (employees.length === 0) {
      return (
        <NoEmployees>
          {showFormer ? "There are no former employees" : "There are no Employees"}
        </NoEmployees>
      );
    }

    if (stat === "list") {
      return <EmployeeList employees={employees} />;
    } else {
      return <EmployeeActivity employees={employees} />;
    }
  };

  return (
    <section className="flex flex-col overflow-y-auto  h-full gap-y-2 md:gap-y-3">
      {/* header  */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Header>
          {showFormer ? "Former Employees" : "Employees"} ({pagination.total})
        </Header>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <IconToggle
            value={scope}
            onChange={(value) => {
              setScope(value);
              setCurrentPage(1);
            }}
            options={[
              { value: "Active", label: "Active employees", icon: ICONS.active },
              { value: "Former", label: "Former employees", icon: ICONS.former },
            ]}
          />
          <IconToggle
            value={stat}
            onChange={setStat}
            options={[
              { value: "list", label: "List view", icon: ICONS.list },
              { value: "activity", label: "Activity view", icon: ICONS.activity },
            ]}
          />
          <div className="flex items-center gap-2">
            <PrimaryButton
              icon={"/icons/filter.svg"}
              className={"bg-white px-2 hover:bg-gray-50 transition-colors"}
              onclick={() => setShowFilter(true)}
            />
            <PrimaryButton
              icon={"/icons/add.svg"}
              onclick={() => setShowAddEmployee(true)}
              title={<span className="hidden sm:inline">Add Employee</span>}
              className={"px-2.5 sm:px-5 text-white"}
            />
          </div>
        </div>
      </div>
      {/* body part  */}
      <div className="w-full h-full  md:overflow-y-auto gap-y-4 mt-3  flex flex-col">
        {renderStat()}
      </div>
      <div className="flex items-center  justify-center  md:justify-end">
        <PageNavigator
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      {/* Add Employee */}
      <CreateEmployee
        isOpen={showAddEmployee}
        handleClose={() => setShowAddEmployee(false)}
        onSubmit={handleCreateEmployee}
      />
      <FilterMenu
        isOpen={showFilter}
        setShowModalFilter={setShowFilter}
        onFilterChange={handleFilterChange}
      />
    </section>
  );
};

export default Employees;
