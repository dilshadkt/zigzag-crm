import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/shared/header";
import AddButton from "../../components/shared/buttons/addButton";

const WorkLoad = () => {
  return (
    <section className="flex flex-col">
      <Link to={"/"} className="flexStart gap-x-2">
        <img
          src="/icons/arrowBack.svg"
          alt=""
          className="w-5 translate-y-0.4"
        />
        <span className="text-[#3F8CFF] text-sm">Back to Dashboard</span>
      </Link>
      <div className="flexBetween ">
        <Header>Current Workload</Header>
        <AddButton className={"mt-3"} />
      </div>
      <div className="grid grid-cols-2"></div>
    </section>
  );
};

export default WorkLoad;
