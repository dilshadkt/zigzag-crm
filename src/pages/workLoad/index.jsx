import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/shared/header";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import Navigator from "../../components/shared/navigator";

const WorkLoad = () => {
  return (
    <section className="flex flex-col">
      <Navigator path={"/"} title={"Back to Dashboard"} />
      <div className="flexBetween ">
        <Header>Current Workload</Header>
        <PrimaryButton className={"mt-3"} />
      </div>
      <div className="grid grid-cols-2"></div>
    </section>
  );
};

export default WorkLoad;
