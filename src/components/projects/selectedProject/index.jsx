import React, { useState } from "react";
import { IoArrowUpOutline } from "react-icons/io5";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useNavigate } from "react-router-dom";
import FileAndLinkUpload from "../../shared/fileUpload";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  useDeleteProject,
  usePauseProject,
  useResumeProject,
} from "../../../api/hooks";
import Modal from "../../shared/modal";
import { assetPath } from "../../../utils/assetPath";

const SelectedProject = ({ currentProject }) => {
  const navigate = useNavigate();
  const { isCompany, user } = useAuth();
  const { hasPermission } = usePermissions();
  const isEmployee = user?.role === "employee";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteProject = useDeleteProject();
  const pauseProject = usePauseProject();
  const resumeProject = useResumeProject();

  // Permission checks
  const canEditProject = isCompany || hasPermission("projects", "edit");
  const canDeleteProject = isCompany || hasPermission("projects", "delete");
  const canPauseProject = isCompany || hasPermission("projects", "edit");

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

  const handleToggleProjectStatus = () => {
    const isPaused = currentProject?.status === "paused";
    const mutation = isPaused ? resumeProject : pauseProject;
    const action = isPaused ? "resumed" : "paused";

    mutation.mutate(currentProject._id, {
      onSuccess: () => {
        console.log(`Project ${action} successfully`);
      },
      onError: (error) => {
        console.error(`Failed to ${action} project:`, error);
      },
    });
  };

  const handleDeleteProject = () => {
    deleteProject.mutate(currentProject._id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate("/projects");
      },
    });
  };

  return (
    <div
      className="col-span-1  bg-white md:overflow-y-auto text-[#0A1629]
rounded-3xl  flex flex-col  p-4"
    >
      <div className="flex flex-col overflow-y-auto">
        <div className="flexBetween">
          <span className="text-sm text-[#91929E] ">Project Number</span>
          <PrimaryButton
            disable={!canEditProject}
            icon={assetPath("icons/edit.svg")}
            onclick={handleEditClick}
            className="bg-[#F4F9FD]"
          />
        </div>
        <span className="-translate-y-1.5 mt-2 uppercase">
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
            {currentProject?.creator && (
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
            )}
          </div>

          {currentProject?.teams?.length > 0 && (
            <div className="flex flex-col gap-y-2">
              <span className="text-sm text-[#91929E]">Team </span>
              <div className=" flexStart">
                {currentProject?.teams.map((team, index) => (
                  <div
                    key={team?._id}
                    className="w-6 h-6 group cursor-pointer relative  rounded-full hover:scale-150
                    transition-all duration-300  bg-black text-white flexCenter border border-white"
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
                    {team?.profileImage ? (
                      <img
                        src={team?.profileImage}
                        alt={team?.firstName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      team?.firstName?.slice(0, 1)
                    )}
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
              <img
                src={assetPath("icons/fillCalender.svg")}
                alt=""
                className="w-4"
              />
              <span className="text-sm text-[#91929E]">
                Created {formatedDate(currentProject?.createdAt)}
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
            {canPauseProject && (
              <PrimaryButton
                title={
                  pauseProject.isLoading || resumeProject.isLoading
                    ? currentProject?.status === "paused"
                      ? "Resuming..."
                      : "Pausing..."
                    : currentProject?.status === "paused"
                    ? "Resume Project"
                    : "Pause Project"
                }
                className="w-full text-white bg-gray-400 hover:bg-gray-800 cursor-pointer mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onclick={handleToggleProjectStatus}
                disable={
                  pauseProject.isLoading ||
                  resumeProject.isLoading ||
                  currentProject?.status === "completed"
                }
              />
            )}
            {canDeleteProject && (
              <PrimaryButton
                title="Remove Project"
                className="w-full text-white bg-red-400 hover:bg-red-500 cursor-pointer  text-sm"
                onclick={() => setIsDeleteModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="flex flex-col gap-6">
          <p className="text-gray-700">
            Are you sure you want to delete this project? This action cannot be
            undone and will also delete all associated tasks.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProject}
              disabled={deleteProject.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {deleteProject.isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SelectedProject;
