import React, { useState } from "react";
import { useAddEmployee, useEmpoyees } from "../../api/hooks";
import CreateEmployee from "../../components/employees/addEmployee";
import EmployeeActivity from "../../components/employees/employeeActivity";
import EmployeeList from "../../components/employees/employeeList";
import NoEmployees from "../../components/employees/noEmployees";
import ButtonToggle from "../../components/shared/buttons/buttonToggle";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Header from "../../components/shared/header";
import PageNavigator from "../../components/shared/navigator/pageNavigator";
import { useQueryClient } from "@tanstack/react-query";
import FilterMenu from "../../components/employees/FilterMenu";

const Employees = () => {
  const [stat, setStat] = useState("list");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState(null);
  const { data } = useEmpoyees(currentPage, activeFilters);
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
      return <NoEmployees>There are no Employees</NoEmployees>;
    }

    if (stat === "list") {
      return <EmployeeList employees={employees} />;
    } else {
      return <EmployeeActivity employees={employees} />;
    }
  };

  return (
    <section className="flex flex-col h-full gap-y-3">
      {/* header  */}
      <div className="flexBetween ">
        <Header>Employees ({pagination.total})</Header>
        <ButtonToggle
          setValue={setStat}
          value={stat}
          values={["list", "activity"]}
        />
        <div className="flexEnd gap-x-5">
          <PrimaryButton
            icon={"/icons/filter.svg"}
            className={"bg-white px-2 mt-3 hover:bg-gray-50 transition-colors"}
            onclick={() => setShowFilter(true)}
          />
          <PrimaryButton
            icon={"/icons/add.svg"}
            onclick={() => setShowAddEmployee(true)}
            title={"Add Employee"}
            className={"mt-3 px-5 text-white"}
          />
        </div>
      </div>
      {/* body part  */}
      <div className="w-full h-full  overflow-y-auto gap-y-4 mt-3  flex flex-col">
        {renderStat()}
      </div>
      <div className="flexEnd">
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
