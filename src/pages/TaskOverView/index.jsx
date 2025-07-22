import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTaskById, useUpdateTaskById } from "../../api/hooks";
import { uploadSingleFile } from "../../api/service";
import AddTask from "../../components/projects/addTask";
import TaskDetails from "../../components/projects/taskDetails";
import TaskInfo from "../../components/projects/taskInfo";
import { useProject } from "../../hooks/useProject";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";

const TaskOverView = () => {
  const { taskId } = useParams();
  const [showModalTask, setShowModalTask] = useState(false);
  const { activeProject: selectProject } = useProject();
  const { data: taskDetails, isLoading } = useGetTaskById(taskId);
  const { mutate } = useUpdateTaskById(taskId, () => setShowModalTask(false));

  const handleTaskEdit = async (values, { setSubmitting }) => {
    try {
      const updatedValues = cleanTaskData(values);

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
      <TaskDetails
        setShowModalTask={setShowModalTask}
        taskDetails={taskDetails}
        teams={taskDetails?.teams}
      />
      {/* task info  */}
      <TaskInfo taskDetails={taskDetails} />
      {/* add task modal  */}
      <AddTask
        isEdit={true}
        isOpen={showModalTask}
        onSubmit={handleTaskEdit}
        isLoading={isLoading}
        setShowModalTask={setShowModalTask}
        selectedProject={selectProject}
        teams={taskDetails?.teams}
        initialValues={taskDetails}
        selectedMonth={taskDetails?.taskMonth}
        showProjectSelection={false}
      />
    </section>
  );
};

export default TaskOverView;
