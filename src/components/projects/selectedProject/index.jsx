import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoArrowUpOutline } from "react-icons/io5";
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin, FaTwitter, FaGlobe, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useNavigate } from "react-router-dom";
import FileAndLinkUpload from "../../shared/fileUpload";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  useDeleteProject,
  usePauseProject,
  useResumeProject,
  useGetProjectFields,
} from "../../../api/hooks";
import Modal from "../../shared/modal";
import { assetPath } from "../../../utils/assetPath";

import { SelectedProjectShimmer } from "../ProjectDetailShimmer";

const SocialIcon = ({ platform }) => {
  const iconClass = "text-xl";
  switch (platform.toLowerCase()) {
    case "instagram": return <FaInstagram className={`text-pink-600 ${iconClass}`} />;
    case "facebook": return <FaFacebook className={`text-blue-700 ${iconClass}`} />;
    case "youtube": return <FaYoutube className={`text-red-600 ${iconClass}`} />;
    case "linkedin": return <FaLinkedin className={`text-blue-800 ${iconClass}`} />;
    case "twitter": return <FaTwitter className={`text-sky-500 ${iconClass}`} />;
    default: return (
      <div className="min-w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg uppercase px-1 shadow-sm border border-gray-200">
        {platform.slice(0, 3).toUpperCase()}
      </div>
    );
  }
};

const getSocialUrl = (platform, handle) => {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;

  const h = handle.startsWith("@") ? handle.slice(1) : handle;

  switch (platform.toLowerCase()) {
    case "instagram": return `https://www.instagram.com/${h}`;
    case "facebook": return `https://www.facebook.com/${h}`;
    case "youtube": return `https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`;
    case "twitter": return `https://www.twitter.com/${h}`;
    case "linkedin": return `https://www.linkedin.com/company/${h}`;
    default: return null;
  }
};

const SelectedProject = ({ currentProject, isLoading, selectedMonth }) => {
  const navigate = useNavigate();
  const { isCompany, companyId, user } = useAuth();
  const { hasPermission } = usePermissions();
  const isEmployee = user?.role === "employee";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteProject = useDeleteProject();
  const pauseProject = usePauseProject();
  const resumeProject = useResumeProject();
  const [failedImages, setFailedImages] = useState({});

  const { data: projectFields } = useGetProjectFields(companyId);

  const hasCustomFields = projectFields?.some(field => {
    const value = currentProject?.customFields?.[field.key];
    return value !== undefined && value !== null && value !== "";
  });

  const managedSocials = Object.entries(currentProject?.socialMedia || {})
    .filter(([k, v]) => k !== 'other' && k !== '_id' && k !== '__v' && v?.manage);
  const managedOthers = currentProject?.socialMedia?.other?.filter(v => v.manage) || [];
  const hasSocialMedia = managedSocials.length > 0 || managedOthers.length > 0;

  if (isLoading) {
    return <SelectedProjectShimmer />;
  }

  const handleImageError = (id) => {
    if (!id) return;
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

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

  const handleToggleProjectStatus = async () => {
    const isPaused = currentProject?.status === "paused";
    const mutation = isPaused ? resumeProject : pauseProject;
    const action = isPaused ? "resumed" : "paused";

    try {
      await mutation.mutateAsync(currentProject._id);
      toast.success(`Project ${action} successfully`);
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} project`);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject.mutateAsync(currentProject._id);
      toast.success("Project deleted successfully");
      setIsDeleteModalOpen(false);
      navigate("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error(error?.response?.data?.message || "Failed to delete project");
    }
  };

  const handleProfileTeamClick = (id) => {
    navigate(`/employees/${id}`);
  };

  return (
    <div
      className="col-span-1  bg-white md:overflow-y-auto text-[#0A1629]
rounded-3xl  flex flex-col  p-4"
    >
      <div className="flex flex-col overflow-y-auto">
        <div className="flexBetween">
          <span className="text-sm text-[#91929E] ">Project Number</span>
          {canEditProject && (
            <PrimaryButton
              icon={assetPath("icons/edit.svg")}
              onclick={handleEditClick}
              className="bg-[#F4F9FD]"
            />
          )}
        </div>
        <div
          onClick={() => navigate(`/projects/${currentProject?._id}`)}
          className="-translate-y-1.5 mt-2 uppercase text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 group transition-colors"
          title="View Project Overview"
        >
          <span>#{currentProject?._id?.slice(-7)}</span>
          <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <div className="flex flex-col gap-y-2 my-4">
          <h4 className="font-medium">Description</h4>
          <div 
            className="text-[#0A1629]/80 text-sm line-clamp-3 prose prose-sm max-w-none prose-p:my-0" 
            title={typeof currentProject?.description === 'string' ? currentProject.description.replace(/<[^>]*>?/gm, '') : ''}
            dangerouslySetInnerHTML={{ __html: currentProject?.description }}
          />
        </div>
        <div className="flex flex-col gap-y-5 mt-1">
          <div className="flex flex-col gap-y-2">
            {currentProject?.reporters && currentProject.reporters.length > 0 ? (
              <div className="flex flex-col overflow-hidden py-2 gap-y-2">
                <span className="text-sm text-[#91929E]">Reporter </span>
                <div className="flexStart flex-wrap gap-y-2">
                  {currentProject.reporters.map((reporter, index) => (
                    <div
                      onClick={() => handleProfileTeamClick(reporter._id || reporter.id)}
                      key={reporter?._id || reporter?.id}
                      className="w-6 h-6 group cursor-pointer relative rounded-full hover:scale-150
                      transition-all duration-300 bg-black text-white flexCenter border border-white"
                      style={{
                        marginLeft: index > 0 ? "-8px" : "0",
                      }}
                    >
                      <div
                        className="absolute -top-7 left-1/2 transform -translate-x-1/2
                        bg-gray-800 text-white text-[8px] py-1 px-2 rounded opacity-0 
                        group-hover:opacity-100 whitespace-nowrap pointer-events-none
                        transition-opacity duration-200 z-[1000]"
                      >
                        {reporter?.firstName || reporter?.name}
                      </div>
                      {reporter?.profileImage && !failedImages[reporter?._id || reporter?.id] ? (
                        <img
                          src={reporter?.profileImage}
                          alt={reporter?.firstName}
                          className="w-full h-full rounded-full object-cover"
                          onError={() => handleImageError(reporter?._id || reporter?.id)}
                        />
                      ) : (
                        (reporter?.firstName || reporter?.name || "").slice(0, 1)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : currentProject?.creator ? (
              <div className="flex flex-col gap-y-2">
                <span className="text-sm text-[#91929E]">Reporter </span>
                <div className="flexStart gap-x-3 ">
                  <div className="w-6 h-6 rounded-full overflow-hidden flexCenter bg-black text-white text-[10px]">
                    {currentProject?.creator?.profileImage &&
                      !failedImages[currentProject?.creator?._id] ? (
                      <img
                        src={currentProject?.creator?.profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() =>
                          handleImageError(currentProject?.creator?._id)
                        }
                      />
                    ) : (
                      currentProject?.creator?.firstName?.slice(0, 1)
                    )}
                  </div>
                  <span>{currentProject?.creator?.firstName}</span>
                </div>
              </div>
            ) : null}
          </div>

          {currentProject?.teams?.length > 0 && (
            <div className="flex flex-col overflow-hidden py-5 gap-y-2">
              <span className="text-sm text-[#91929E]">Team </span>
              <div className=" flexStart flex-wrap gap-y-2 ">
                {currentProject?.teams.map((team, index) => (
                  <div
                    onClick={() => handleProfileTeamClick(team._id)}
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
                    {team?.profileImage && !failedImages[team?._id] ? (
                      <img
                        src={team?.profileImage}
                        alt={team?.firstName}
                        className="w-full h-full rounded-full object-cover"
                        onError={() => handleImageError(team?._id)}
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

            {/* Streamlined Sidebar: Removed Custom Fields, Social Media, and Work Progress as they are now in the Overview tab */}

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
                loading={pauseProject.isPending || resumeProject.isPending || pauseProject.isLoading || resumeProject.isLoading}
                disable={
                  pauseProject.isPending ||
                  resumeProject.isPending ||
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
          {deleteProject.isError && (
            <p className="text-red-500 text-sm">
              {deleteProject.error?.response?.data?.message ||
                "Failed to delete project. Please try again."}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProject}
              disabled={deleteProject.isPending || deleteProject.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {deleteProject.isPending || deleteProject.isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SelectedProject;
