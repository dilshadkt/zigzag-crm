import React, { useState } from "react";
import EmployeeActivity from "../../components/employees/employeeActivity";
import EmployeeList from "../../components/employees/employeeList";
import ButtonToggle from "../../components/shared/buttons/buttonToggle";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Header from "../../components/shared/header";
import PageNavigator from "../../components/shared/navigator/pageNavigator";

const Employees = () => {
  const [stat, setStat] = useState("list");
  const renderStat = () => {
    if (stat === "list") {
      return <EmployeeList />;
    } else {
      return <EmployeeActivity />;
    }
  };
  return (
    <section className="flex flex-col h-full gap-y-3">
      {/* header  */}
      <div className="flexBetween ">
        <Header>Employees (28)</Header>
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
            title={"Add Employee"}
            className={"mt-3 px-5"}
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
    </section>
  );
};

export default Employees;
