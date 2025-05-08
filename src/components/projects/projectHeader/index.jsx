import React from "react";
import Header from "../../shared/header";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useAuth } from "../../../hooks/useAuth";

const ProjectHeading = ({ setShowModalProject }) => {
  const { isCompany } = useAuth();
  return (
    <div className="flexBetween ">
      <Header>Projects</Header>
      <div className="flexEnd gap-x-2">
        <PrimaryButton
          disable={!isCompany}
          icon={"/icons/add.svg"}
          title={"Add Project"}
          onclick={() => setShowModalProject(true)}
          className={"mt-3 text-white px-5"}
        />
      </div>
    </div>
  );
};

export default ProjectHeading;
