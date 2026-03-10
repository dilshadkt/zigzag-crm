import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetTaskById,
  useUpdateTaskById,
  useGetSubTasksByParentTask,
} from "../../api/hooks";
import { uploadSingleFile } from "../../api/service";
import AddTask from "../../components/projects/addTask";
import TaskDetails from "../../components/projects/taskDetails";
import TaskInfo from "../../components/projects/taskInfo";
import { useProject } from "../../hooks/useProject";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";

import TaskOverViewShimmer from "./TaskOverViewShimmer";

const TaskOverView = () => {
  const { taskId } = useParams();
  const [showModalTask, setShowModalTask] = useState(false);
  const { activeProject: selectProject } = useProject();
  const { data: taskDetails, isLoading } = useGetTaskById(taskId);
  const { data: subTasks = [] } = useGetSubTasksByParentTask(taskId);
  const { mutate } = useUpdateTaskById(taskId, () => setShowModalTask(false));

  const computedProgress = React.useMemo(() => {
    if (!subTasks || subTasks.length === 0) return 0;
    const completedSubtasks = subTasks.filter((t) =>
      ["completed", "approved", "client-approved"].includes(
        t.status?.toLowerCase()
      )
    );
    return Math.round((completedSubtasks.length / subTasks.length) * 100);
  }, [subTasks]);

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
    return <TaskOverViewShimmer />;
  }

  return (
    <section className="col-span-4  gap-y-6 md:gap-y-0 md:overflow-hidden grid grid-cols-1 md:grid-cols-4   ">
      <TaskDetails
        setShowModalTask={setShowModalTask}
        taskDetails={taskDetails}
        teams={taskDetails?.teams}
        computedProgress={computedProgress}
      />
      {/* task info  */}
      <TaskInfo
        taskDetails={taskDetails}
        computedProgress={computedProgress}
      />
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
