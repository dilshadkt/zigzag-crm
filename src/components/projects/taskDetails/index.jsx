import React from "react";
import FileAndLinkUpload from "../../shared/fileUpload";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useAuth } from "../../../hooks/useAuth";
import StatusButton from "../../shared/StatusUpadate";

const TaskDetails = ({ taskDetails, setShowModalTask }) => {
  const { isCompany } = useAuth();
  return (
    <div className="col-span-3 overflow-y-auto  mr-5 flex flex-col">
      <div className="flexBetween">
        <h4 className="text-lg font-medium">Task Details</h4>
        <PrimaryButton
          disable={!isCompany}
          className={"bg-white "}
          icon={"/icons/edit.svg"}
          onclick={() => setShowModalTask(true)}
        />
      </div>
      <div className="flex flex-col h-full bg-white  overflow-hidden  rounded-3xl mt-5 p-6 pb-4">
        <div className="overflow-y-auto flex flex-col  h-full   gap-y-1 ">
          <span className="text-sm text-[#91929E] uppercase">
            {taskDetails?._id?.slice(0, 8)}
          </span>
          <div className="flexBetween">
            <h4 className="text-lg font-medium">{taskDetails?.title}</h4>
            <StatusButton taskDetails={taskDetails} />
          </div>
          <p className="text-gray-600 mt-2">{taskDetails?.description}</p>
          {taskDetails?.copyOfDescription && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-[#91929E] uppercase mb-2">
                Copy of Description
              </h5>
              <p className="text-gray-600">{taskDetails?.copyOfDescription}</p>
            </div>
          )}
          <FileAndLinkUpload
            disable={true}
            fileClassName={"grid grid-cols-3 gap-3"}
            initialFiles={taskDetails?.attachments.filter(
              (file) => file.type !== "link"
            )}
            initialLinks={taskDetails?.attachments.filter(
              (file) => file.type === "link"
            )}
          />{" "}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
