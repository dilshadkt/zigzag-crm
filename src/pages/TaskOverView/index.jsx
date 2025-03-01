import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoArrowUpOutline } from "react-icons/io5";
import { useParams } from "react-router-dom";
import {
  useCreateTask,
  useGetTaskById,
  useUpdateTaskById,
} from "../../api/hooks";
import { uploadSingleFile } from "../../api/service";
import AddTask from "../../components/projects/addTask";
import PrimaryButton from "../../components/shared/buttons/primaryButton";
import FileAndLinkUpload from "../../components/shared/fileUpload";
import Progress from "../../components/shared/progress";
import { useProject } from "../../hooks/useProject";
import { processAttachments } from "../../lib/attachmentUtils";
import StatuButton from "../../components/shared/StatusUpadate";
import StatusButton from "../../components/shared/StatusUpadate";

const TaskOverView = () => {
  const { taskId } = useParams();
  const [showModalTask, setShowModalTask] = useState(false);
  const { activeProject: selectProject } = useProject();
  const { data: taskDetails, isLoading } = useGetTaskById(taskId);
  const { mutate } = useUpdateTaskById(taskId, () => setShowModalTask(false));
  const handleTaskEdit = async (values, { setSubmitting }) => {
    try {
      const updatedValues = { ...values };
      const proccesedValue = await processAttachments(
        values?.attachments,
        uploadSingleFile
      );
      updatedValues.attachments = proccesedValue;
      mutate(updatedValues);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };
  // loading shimmer
  if (isLoading) {
    return (
      <section className="col-span-4 overflow-hidden grid grid-cols-4   ">
        <div className="col-span-3 bg-white rounded-3xl mr-5 flex flex-col"></div>
        <div className="col-span-1 bg-white rounded-3xl px-2 justify-between  py-5 flex flex-col"></div>
      </section>
    );
  }

  return (
    <section className="col-span-4 overflow-hidden grid grid-cols-4   ">
      <div className="col-span-3 overflow-y-auto  mr-5 flex flex-col">
        <div className="flexBetween">
          <h4 className="text-lg font-medium">Task Details</h4>
          <PrimaryButton
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
      {/* task info  */}
      <div className="col-span-1 bg-white rounded-3xl px-2 justify-between  py-5 flex flex-col">
        <div>
          <div className="gap-y-3 flex flex-col mx-3">
            <h4 className="font-medium">Task Info</h4>
            <div className="flex flex-col  gap-y-2">
              <span className="text-sm text-[#91929E]">Reporter</span>
              <div className="flexStart gap-x-3">
                <div className="w-6 h-6  rounded-full overflow-hidden">
                  <img src="/image/photo.png" alt="" />
                </div>
                <span>Evan Yates</span>
              </div>
            </div>
            <div className="flex flex-col  gap-y-2">
              <span className="text-sm text-[#91929E]">Assigned</span>
              <div className="flexStart gap-x-3">
                <div className="w-6 h-6  rounded-full overflow-hidden">
                  <img
                    src={taskDetails?.assignedTo?.profileImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>{taskDetails?.assignedTo?.firstName}</span>
              </div>
            </div>
            <div className="flex flex-col  gap-y-2">
              <span className="text-sm text-[#91929E]">Priority</span>
              <div className="flexStart gap-x-1 text-[#FFBD21]">
                <IoArrowUpOutline className="text-xl " />
                <span className="text-sm">{taskDetails?.priority}</span>
              </div>
            </div>
          </div>

          <div className=" rounded-2xl mt-5 p-4 bg-[#F4F9FD]  flex flex-col">
            <h4 className="font-medium">Time tracking</h4>
            <div className="flexStart gap-x-3 my-3">
              <Progress size={33} strokeWidth={2} currentValue={43} />
              <div className="flex flex-col ">
                <span className="text-sm">1d 3h 25m logged</span>
                <span className="text-xs text-[#91929E] ">
                  Original Estimate 3d 8h
                </span>
              </div>
            </div>
            <PrimaryButton
              title={"Log time"}
              icon={"/icons/time.svg"}
              className={"w-fit "}
            />
          </div>
          <div className="gap-y-3 mt-1 flex flex-col mx-3">
            <div className="flex flex-col  gap-y-1">
              <span className="text-sm text-[#91929E]">Dead Line</span>
              <span className="text-sm text-[#0A1629]">Feb 23, 2020</span>
            </div>
          </div>
        </div>
        <div className="flexStart px-3">
          <img src="/icons/calender2.svg" alt="" className="w-4" />
          <span className="text-sm  text-[#7D8592]">Created May 28, 2020</span>
        </div>
      </div>
      {/* add task modal  */}
      <AddTask
        isOpen={showModalTask}
        onSubmit={handleTaskEdit}
        isLoading={isLoading}
        setShowModalTask={setShowModalTask}
        selectedProject={selectProject}
        assignee={taskDetails?.teams}
        initialValues={taskDetails}
      />
    </section>
  );
};

export default TaskOverView;
