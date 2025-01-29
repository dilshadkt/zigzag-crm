import React from "react";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";

const Employees = () => {
  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="flexBetween ">
        <Header>Employees (28)</Header>

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
    </section>
  );
};

export default Employees;
