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

const SelectedProject = ({ currentProject, isLoading }) => {
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
            )}
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

            {/* Custom Project Fields - Enhanced Display */}
            {hasCustomFields && projectFields && (
              <div className="flex flex-col gap-y-4 mt-4 border-t pt-5 border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-x-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#91929E]">
                    Additional Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-y-4">
                  {projectFields.map((field) => {
                    const value = currentProject.customFields[field.key];
                    // Skip if value is truly empty
                    if (value === undefined || value === null || value === "")
                      return null;

                    return (
                      <div
                        key={field._id}
                        className="flex flex-col gap-y-1.5 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-[11px] font-semibold text-[#91929E] uppercase tracking-tight">
                          {field.label}
                        </span>
                        <div className="text-sm font-medium text-[#0A1629]">
                          {field.type === "checkbox" ? (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {value ? "Yes" : "No"}
                            </span>
                          ) : field.type === "dynamic_list" && Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {value.map((item, i) => item && (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-semibold border border-blue-100 shadow-sm">
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : field.type === "url" ? (
                            <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              {value}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                          ) : field.type === "image" ? (
                            <div className="mt-1">
                              <a href={value} target="_blank" rel="noreferrer" className="block w-full">
                                <img
                                  src={value}
                                  alt={field.label}
                                  className="w-full max-h-48 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"
                                />
                              </a>
                            </div>
                          ) : field.type === "file" ? (
                            <a
                              href={value}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-1 truncate group"
                            >
                              <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <img src="/icons/file.svg" alt="" className="w-4 h-4" />
                              </div>
                              <span className="truncate underline underline-offset-4">{value.split('/').pop()}</span>
                            </a>
                          ) : (
                            <span className="break-words line-clamp-3" title={value}>
                              {value}
                            </span>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Social Media Section */}
            {hasSocialMedia && (
              <div className="flex flex-col gap-y-3 mt-6 border-t pt-5 border-gray-100">
                <div className="flex flex-wrap gap-4">
                  {managedSocials.map(([platform, data]) => {
                    const url = getSocialUrl(platform, data.handle);
                    return url ? (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        title={data.handle || platform}
                        className="transition-transform hover:scale-110 cursor-alias"
                      >
                        <SocialIcon platform={platform} />
                      </a>
                    ) : (
                      <div
                        key={platform}
                        title={data.handle || platform}
                        className="opacity-60 grayscale-[50%]"
                      >
                        <SocialIcon platform={platform} />
                      </div>
                    );
                  })}

                  {managedOthers.map((item) => {
                    const url = item.handle?.startsWith("http") ? item.handle : null;
                    return url ? (
                      <a
                        key={item._id}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        title={item.handle || item.platform}
                        className="transition-transform hover:scale-110 cursor-alias"
                      >
                        <SocialIcon platform={item.platform} />
                      </a>
                    ) : (
                      <div
                        key={item._id}
                        title={item.handle || item.platform}
                        className="opacity-60"
                      >
                        <SocialIcon platform={item.platform} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Work Progress Section */}
            {currentProject?.workDetails?.length > 0 && (
              <div className="flex flex-col gap-y-3 mt-4 border-t pt-5 border-gray-100">
                <div className="flex flex-col gap-y-1">
                  {[...currentProject.workDetails].reverse().slice(0, 3).map((detail) => (
                    <div
                      key={detail._id}
                      className="p-2.5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-orange-400 text-xs" />
                          <span className="text-[10px] font-bold text-gray-700 uppercase">
                            {new Date(detail.month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(detail).map(([key, value]) => {
                          if (["month", "year", "monthNumber", "_id", "other", "__v"].includes(key)) return null;
                          if (value && typeof value === 'object' && (value.total > 0 || value.count > 0)) {
                            return (
                              <div
                                key={key}
                                className="flex justify-between items-center p-2 bg-white rounded-xl border border-gray-100/50 "
                              >
                                <span className="capitalize text-[10px] font-medium text-gray-500">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[#0A1629]">
                                    {value.completed || 0}/{value.total || 0}
                                  </span>
                                  {value.completed >= value.total && value.total > 0 && (
                                    <FaCheckCircle className="text-green-500 text-[10px]" />
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))}
                  {currentProject.workDetails.length > 3 && (
                    <button className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-tighter text-left ml-1">
                      + View all history
                    </button>
                  )}
                </div>
              </div>
            )}

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
