import React from "react";
import { IoArrowUpOutline } from "react-icons/io5";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useNavigate } from "react-router-dom";
import FileAndLinkUpload from "../../shared/fileUpload";
import { useAuth } from "../../../hooks/useAuth";

const SelectedProject = ({ currentProject }) => {
  const navigate = useNavigate();
  const { isCompany } = useAuth();

  const formatedDate = (isoDate) => {
    const date = new Date(isoDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    return formattedDate;
  };

  const handleEditClick = () => {
    const projectId = currentProject?._id;
    navigate(`/projects/${projectId}/edit`);
  };

  return (
    <div
      className="col-span-1 bg-white overflow-y-auto text-[#0A1629]
rounded-3xl  flex flex-col  p-4"
    >
      <div className="flex flex-col overflow-y-auto">
        <div className="flexBetween">
          <span className="text-sm text-[#91929E] ">Project Number</span>
          <PrimaryButton
            disable={!isCompany}
            icon={"/icons/edit.svg"}
            onclick={handleEditClick}
            className="bg-[#F4F9FD]"
          />
        </div>
        <span className="-translate-y-1.5 uppercase">
          {currentProject?._id?.slice(0, 7)}
        </span>
        <div className="flex flex-col gap-y-2 my-4">
          <h4 className="font-medium">Description</h4>
          <p className="text-[#0A1629]/80 text-sm">
            {currentProject?.description}
          </p>
        </div>
        <div className="flex flex-col gap-y-5 mt-1">
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Reporter </span>
            <div className="flexStart gap-x-3 ">
              <div className="w-6 h-6 rounded-full overflow-hidden flexCenter">
                <img
                  src={currentProject?.creator?.profileImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{currentProject?.creator?.firstName}</span>
            </div>
          </div>
          {currentProject?.teams?.length > 0 && (
            <div className="flex flex-col gap-y-2">
              <span className="text-sm text-[#91929E]">Team </span>
              <div className=" flexStart">
                {currentProject?.teams.map((team, index) => (
                  <div
                    key={team?._id}
                    className="w-6 h-6 group cursor-pointer relative  rounded-full hover:scale-150
                    transition-all duration-300  flexCenter border border-white"
                    style={{
                      marginLeft: index > 0 ? "-8px" : "0",
                    }}
                  >
                    <div
                      className="absolute -top-7 left-1/2 transform 
      bg-gray-800 text-white text-[8px] py-1 px-2 rounded opacity-0 
      group-hover:opacity-100 whitespace-nowrap pointer-events-none
      transition-opacity duration-200  z-[1000]"
                    >
                      {team?.firstName}
                    </div>
                    <img
                      src={team?.profileImage}
                      alt={team?.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Priority </span>
            <div className="flexStart gap-x-2  text-[#FFBD21]">
              <IoArrowUpOutline className="text-lg " />
              <span className="text-sm capitalize font-medium">
                {currentProject?.priority}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-[#91929E]">Dead Line </span>
            <span className="text-sm  font-medium text-gray-800">
              {formatedDate(currentProject?.endDate)}
            </span>
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="flexStart gap-x-2">
              <img src="/icons/fillCalender.svg" alt="" className="w-4" />
              <span className="text-sm text-[#91929E]">
                Created May 28, 2020{" "}
              </span>
            </div>
            <FileAndLinkUpload
              disable={true}
              fileClassName={"grid grid-cols-1 gap-3"}
              initialFiles={currentProject?.attachments.filter(
                (file) => file.type !== "link"
              )}
              initialLinks={currentProject?.attachments.filter(
                (file) => file.type === "link"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedProject;
