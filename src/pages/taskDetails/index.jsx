import React from "react";
import TaskOverView from "../TaskOverView";
import { useProject } from "../../hooks/useProject";
import { useGetTaskById, useProjectDetails } from "../../api/hooks";
import { useParams } from "react-router-dom";

const TaskDetails = () => {
  const { taskId } = useParams();
  const { data } = useGetTaskById(taskId);

  return <TaskOverView taskDetails={data} />;
};

export default TaskDetails;
