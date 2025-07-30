import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetTaskById,
  useUpdateTaskById,
  useGetAllEmployees,
  useCompanyProjects,
} from "../../api/hooks";
import { useAuth } from "../../hooks/useAuth";
import { uploadSingleFile } from "../../api/service";
import AddTask from "../../components/projects/addTask";
import TaskDetails from "../../components/projects/taskDetails";
import TaskInfo from "../../components/projects/taskInfo";
import { processAttachments, cleanTaskData } from "../../lib/attachmentUtils";

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const { user } = useAuth();
  const [showModalTask, setShowModalTask] = useState(false);
  const { data: taskDetails, isLoading } = useGetTaskById(taskId);
  const { mutate } = useUpdateTaskById(taskId, () => setShowModalTask(false));

  // Check if task has a project
  const hasProject = !!taskDetails?.project;

  // Fetch all employees if task doesn't have a project
  const { data: allEmployeesData } = useGetAllEmployees(!hasProject);

  // Fetch all projects for project selection
  const { data: projectsData } = useCompanyProjects(user?.company);

  // Get teams based on whether task has a project or not
  const teams = hasProject
    ? taskDetails?.teams
    : allEmployeesData?.employees || [];

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
      <section className="col-span-4 overflow-hidden grid grid-cols-4">
        <div className="col-span-3 bg-white rounded-3xl mr-5 flex flex-col"></div>
        <div className="col-span-1 bg-white rounded-3xl px-2 justify-between py-5 flex flex-col"></div>
      </section>
    );
  }

  return (
    <section className="col-span-4 h-full grid grid-cols-4">
      <TaskDetails
        setShowModalTask={setShowModalTask}
        taskDetails={taskDetails}
        teams={taskDetails?.teams}
      />
      {/* task info */}
      <TaskInfo taskDetails={taskDetails} />
      {/* add task modal */}
      <AddTask
        isEdit={true}
        isOpen={showModalTask}
        onSubmit={handleTaskEdit}
        isLoading={isLoading}
        setShowModalTask={setShowModalTask}
        teams={teams}
        initialValues={taskDetails}
        selectedMonth={taskDetails?.taskMonth}
        showProjectSelection={!hasProject} // Enable project selection for tasks without projects
        projects={projectsData || []}
      />
    </section>
  );
};

export default TaskDetailPage;
