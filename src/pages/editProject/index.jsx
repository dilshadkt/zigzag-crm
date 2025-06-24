import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectDetails } from "../../api/hooks";
import AddProject from "../../components/projects/addProject";
import { useUpdateProject } from "../../api/hooks";
import Navigator from "../../components/shared/navigator";

const EditProject = () => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const { data: currentProject } = useProjectDetails(projectName);
  const { mutate } = useUpdateProject(currentProject?._id, () => {
    navigate(`/projects/${projectName}`);
  });
  const handleEditProject = async (values, { setSubmitting }) => {
    try {
      const updatedValues = {
        ...values,
        teams: values.teams.map((team) => team._id),
      };
      mutate(updatedValues);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentProject) {
    return null;
  }
  return (
    <div className="w-full h-full bg-[#F4F9FD] p-5">
      <div className="max-w-[1149px] mx-auto">
        <Navigator path={`/projects/${projectName}`} title="Back to Project" />
        <AddProject
          isOpen={true}
          setShowModalProject={() => navigate(`/projects/${projectName}`)}
          isEditMode={true}
          onSubmit={handleEditProject}
          initialValues={{
            name: currentProject?.name || "",
            taskGroup: currentProject?.taskGroup || "",
            startDate: currentProject?.startDate || "",
            endDate: currentProject?.endDate || "",
            periority: currentProject?.periority || "",
            assignee: currentProject?.teams || "",
            description: currentProject?.description || "",
            attachments: currentProject?.attachments,
            teams: currentProject?.teams.map((team) => ({
              _id: team._id,
              name: team.firstName,
              position: team.position,
              email: team.email,
            })),
            workDetails: currentProject?.workDetails || {
              reels: { count: 0, completed: 0 },
              poster: { count: 0, completed: 0 },
              motionPoster: { count: 0, completed: 0 },
              shooting: { count: 0, completed: 0 },
              motionGraphics: { count: 0, completed: 0 },
              other: [],
            },
            socialMedia: currentProject?.socialMedia || {
              instagram: { manage: false, handle: "", notes: "" },
              facebook: { manage: false, handle: "", notes: "" },
              youtube: { manage: false, handle: "", notes: "" },
              linkedin: { manage: false, handle: "", notes: "" },
              twitter: { manage: false, handle: "", notes: "" },
              other: [],
            },
          }}
        />
      </div>
    </div>
  );
};

export default EditProject;
