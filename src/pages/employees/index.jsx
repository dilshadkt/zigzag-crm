import React, { useState } from "react";
import { useAddEmployee, useEmpoyees } from "../../api/hooks";
import CreateEmployee from "../../components/employees/addEmployee";
import EmployeeActivity from "../../components/employees/employeeActivity";
import EmployeeList from "../../components/employees/employeeList";
import ButtonToggle from "../../components/shared/buttons/buttonToggle";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Header from "../../components/shared/header";
import PageNavigator from "../../components/shared/navigator/pageNavigator";
import { useQueryClient } from "@tanstack/react-query";

const Employees = () => {
  const [stat, setStat] = useState("list");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const { data: employees } = useEmpoyees();
  const { mutate } = useAddEmployee();
  const queryClient = useQueryClient();

  const handleCreateEmployee = (values, { resetForm, setSubmitting }) => {
    mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries(["employees"]);
        resetForm();
        setShowAddEmployee(false);
        setSubmitting(false);
      },
      onError: () => {
        setSubmitting(false);
      },
    });
  };

  const renderStat = () => {
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
        <Header>Employees ({employees?.length})</Header>
        <ButtonToggle
          setValue={setStat}
          value={stat}
          values={["list", "activity"]}
        />
        <div className="flexEnd gap-x-5">
          <PrimaryButton
            icon={"/icons/filter.svg"}
            className={"bg-white px-2 mt-3"}
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
        <PageNavigator />
      </div>
      {/* Add Employee */}
      <CreateEmployee
        isOpen={showAddEmployee}
        handleClose={() => setShowAddEmployee(false)}
        onSubmit={handleCreateEmployee}
      />
    </section>
  );
};

export default Employees;
