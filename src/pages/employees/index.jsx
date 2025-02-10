import React, { useState } from "react";
import EmployeeActivity from "../../components/employees/employeeActivity";
import EmployeeList from "../../components/employees/employeeList";
import ButtonToggle from "../../components/shared/buttons/buttonToggle";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Header from "../../components/shared/header";
import PageNavigator from "../../components/shared/navigator/pageNavigator";
import Input from "../../components/shared/Field/input";
import { RiAddFill } from "react-icons/ri";

const Employees = () => {
  const [stat, setStat] = useState("list");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
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
            onclick={() => setShowAddEmployee(true)}
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
      {/* Add Employee */}
      {showAddEmployee && (
        <div
          className="fixed w-full h-full bg-[#2155A3]/15
       left-0 right-0 bottom-0 top-0 flexCenter backdrop-blur-sm"
        >
          <div
            className="rounded-3xl flex flex-col max-w-xl w-full
         bg-white p-12 relative"
          >
            <h4 className="text-lg font-medium">Add Employee</h4>
            <img src="/image/employee.svg" alt="" className="my-4 mb-6" />
            <Input
              title={"Member’s Email"}
              placeholder="memberemail@gmail.com"
            />
            <button className="flexStart gap-x-2 cursor-pointer mt-4 text-[#3F8CFF]">
              <RiAddFill />
              <span className=" text-sm">Add another Member</span>
            </button>
            <div className="flexEnd mt-7">
              <PrimaryButton title="Approve" />
            </div>
            <PrimaryButton
              icon={"/icons/cancel.svg"}
              className={"absolute bg-[#F4F9FD] top-5 right-5"}
              onclick={() => setShowAddEmployee(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Employees;
