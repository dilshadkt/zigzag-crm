import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/shared/header";
import AddButton from "../../components/shared/buttons/addButton";
import Navigator from "../../components/shared/navigator";

const WorkLoad = () => {
  return (
    <section className="flex flex-col">
      <Navigator path={"/"} title={"Back to Dashboard"} />
      <div className="flexBetween ">
        <Header>Current Workload</Header>
        <AddButton className={"mt-3"} />
      </div>
      <div className="grid grid-cols-2"></div>
    </section>
  );
};

export default WorkLoad;
