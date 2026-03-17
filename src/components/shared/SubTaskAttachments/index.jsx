import React, { useRef, useState, useEffect } from "react";
import { useSubTaskAttachments } from "../../../hooks/useSubTaskAttachments";
import AttachmentViewer from "../AttachmentViewer";
import Modal from "../modal";
import PrimaryButton from "../buttons/primaryButton";
import Description from "../Field/description";
import { useUpdateSubTaskById, useGetProjectSocialMedia } from "../../../api/hooks";
import { FiMoreVertical, FiFilePlus, FiEdit3, FiPaperclip, FiLink, FiPlusSquare, FiChevronDown, FiChevronUp } from "react-icons/fi";

const SubTaskAttachments = ({ subTask, parentTaskId, projectData, canEdit = false }) => {
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showURLModal, setShowURLModal] = useState(false);
  const [contentValues, setContentValues] = useState({
    copyOfDescription: subTask?.copyOfDescription || "",
    description: subTask?.description || "",
    ideas: subTask?.ideas || "",
  });

  const [urlValues, setUrlValues] = useState(subTask?.publishUrls || {});
  const [isExpanded, setIsExpanded] = useState(false);

  const hasPublishUrls = subTask.publishUrls && 
    Object.values(subTask.publishUrls).some(url => url && typeof url === 'string' && url.trim() !== "");

  const updateSubTask = useUpdateSubTaskById(subTask._id, parentTaskId);

  // Get project social media data if not provided in projectData
  const projectId = typeof projectData === 'string' ? projectData : projectData?._id;
  const { data: socialMediaData } = useGetProjectSocialMedia(
    projectId &&
      (!projectData?.socialMedia ||
        Object.keys(projectData.socialMedia).length === 0)
      ? projectId
      : null
  );

  // Use projectData if available, otherwise use fetched social media data
  const effectiveProjectData = projectData?.socialMedia
    ? projectData
    : { socialMedia: socialMediaData?.socialMedia || {} };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update content values when subTask changes
  useEffect(() => {
    setContentValues({
      copyOfDescription: subTask?.copyOfDescription || "",
      description: subTask?.description || "",
      ideas: subTask?.ideas || "",
    });
    setUrlValues(subTask?.publishUrls || {});
  }, [subTask]);

  const {
    isUploading,
    handleFileUpload,
    handleRemoveAttachment,
    isAddingAttachment,
    isRemovingAttachment,
  } = useSubTaskAttachments(subTask._id, parentTaskId);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    const result = await handleFileUpload(files);
    console.log(result);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!result.success) {
      // You can add toast notification here if needed
      console.error("Failed to upload attachments:", result.error);
    }
  };

  const handleRemoveAttachmentClick = async (attachmentId) => {
    if (window.confirm("Are you sure you want to remove this attachment?")) {
      const result = await handleRemoveAttachment(attachmentId);

      if (!result.success) {
        // You can add toast notification here if needed
        console.error("Failed to remove attachment:", result.error);
      }
    }
  };

  const handleViewAttachment = (attachment) => {
    setSelectedAttachment(attachment);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedAttachment(null);
  };

  const handleSaveContent = async () => {
    try {
      await updateSubTask.mutateAsync(contentValues);
      setShowContentModal(false);
    } catch (error) {
      console.error("Failed to update subtask content:", error);
    }
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setContentValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveURLs = async () => {
    try {
      await updateSubTask.mutateAsync({ publishUrls: urlValues });
      setShowURLModal(false);
    } catch (error) {
      console.error("Failed to update subtask URLs:", error);
    }
  };

  const handleURLChange = (platform, value) => {
    setUrlValues((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const isContentSubTask = subTask.title?.toLowerCase() === "content";
  const isPublishSubTask = subTask.title?.toLowerCase() === "publish";

  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "pdf":
        return "📄";
      case "doc":
        return "📝";
      case "video":
        return "🎥";
      case "audio":
        return "🎵";
      case "link":
        return "🔗";
      default:
        return "📎";
    }
  };

  const attachments = subTask.attachments || [];
  const MAX_ATTACHMENTS = 4;
  const isAttachmentLimitReached = attachments.length >= MAX_ATTACHMENTS;

  return (
    <>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            Attachments ({attachments.length})
          </span>

          {canEdit && (
            <div className="flex items-center gap-1 relative" ref={menuRef}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,application/pdf,.doc,.docx,video/*,audio/*"
                disabled={isAttachmentLimitReached}
              />
              <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={
                  isUploading || isAddingAttachment
                }
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Options"
              >
                {isUploading || isAddingAttachment ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                ) : (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              {/* Options Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white shadow-xl rounded-xl border border-gray-100 py-1.5 z-[60] min-w-[160px] animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      fileInputRef.current?.click();
                    }}
                    disabled={isAttachmentLimitReached}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <FiPaperclip className="text-blue-500" />
                    <span>Add Attachment</span>
                  </button>
                  {isContentSubTask && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowContentModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiEdit3 className="text-orange-500" />
                      <span>Add Contents</span>
                    </button>
                  )}
                  {isPublishSubTask && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowURLModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiLink className="text-green-500" />
                      <span>Add URLs</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {isAttachmentLimitReached && (
            <div className="text-xs text-red-500 mt-1">
              Maximum {MAX_ATTACHMENTS} attachments allowed.
            </div>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="space-y-1">
            {attachments.map((attachment, index) => (
              <div
                key={attachment._id || index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-lg group hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => handleViewAttachment(attachment)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm">
                    {getFileIcon(attachment.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {attachment.title}
                    </p>
                    {attachment.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {attachment.description}
                      </p>
                    )}
                    {attachment.uploadedBy && (
                      <p className="text-xs text-gray-400">
                        by {attachment.uploadedBy.firstName}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAttachment(attachment);
                    }}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                    title="View attachment"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {attachment.type === "link" ? (
                    <a
                      href={attachment.preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                      title="Open link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  ) : (
                    <a
                      href={attachment.preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-700 p-1 rounded transition-colors"
                      title="Download"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  )}

                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAttachmentClick(attachment._id);
                      }}
                      disabled={isRemovingAttachment}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded"
                      title="Remove attachment"
                    >
                      {isRemovingAttachment ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                      ) : (
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {attachments.length === 0 && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">No attachments</p>
          </div>
        )}

        {/* Show More toggle for Content Subtasks */}
        {isContentSubTask && (subTask.copyOfDescription || subTask.description || subTask.ideas) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 px-4 text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50/50 hover:bg-orange-50 rounded-xl border border-orange-100/50 transition-all duration-200"
          >
            {isExpanded ? (
              <>
                <FiChevronUp className="w-3.5 h-3.5" />
                Show Less Content
              </>
            ) : (
              <>
                <FiChevronDown className="w-3.5 h-3.5" />
                Show More Content
              </>
            )}
          </button>
        )}

        {/* Task Content Details (Always shown for Publish, Toggled for Content) */}
        {((isPublishSubTask && hasPublishUrls) || 
          (isContentSubTask && isExpanded)) && (
          <div className={`mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 space-y-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300`}>
            {/* Content Description */}
            {isContentSubTask && subTask.copyOfDescription && (
              <div className="group/section">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FiEdit3 className="w-3 h-3" />
                    Content Description
                  </h6>
                  {canEdit && (
                    <button
                      onClick={() => setShowContentModal(true)}
                      className="opacity-0 group-hover/section:opacity-100 transition-opacity p-1 text-orange-500 hover:bg-orange-50 rounded-md"
                      title="Edit Content"
                    >
                      <FiPlusSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-gray-100/80">
                  {subTask.copyOfDescription}
                </p>
              </div>
            )}

            {/* Ideas */}
            {isContentSubTask && subTask.ideas && (
              <div className="group/section">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 3a1 1 0 012 0v2a1 1 0 11-2 0V5zM9 9a1 1 0 000 2v3a1 1 0 102 0v-3a1 1 0 00-2 0z" />
                    </svg>
                    Ideas
                  </h6>
                  {canEdit && (
                    <button
                      onClick={() => setShowContentModal(true)}
                      className="opacity-0 group-hover/section:opacity-100 transition-opacity p-1 text-yellow-600 hover:bg-yellow-50 rounded-md"
                      title="Edit Ideas"
                    >
                      <FiPlusSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-gray-100/80 whitespace-pre-wrap">
                  {subTask.ideas}
                </p>
              </div>
            )}

            {/* Publish URLs */}
            {isPublishSubTask && hasPublishUrls && (
              <div className="group/section">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FiLink className="w-3 h-3" />
                    Publish URLs
                  </h6>
                  {canEdit && (
                    <button
                      onClick={() => setShowURLModal(true)}
                      className="opacity-0 group-hover/section:opacity-100 transition-opacity p-1 text-green-600 hover:bg-green-50 rounded-md"
                      title="Edit URLs"
                    >
                      <FiPlusSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {Object.entries(subTask.publishUrls)
                    .filter(([_, url]) => url && url.trim() !== "")
                    .map(([platform, url]) => (
                    <div key={platform} className="flex items-center gap-3 bg-white/80 p-2.5 rounded-xl border border-gray-100/80">
                      <span className="text-[10px] font-bold text-gray-400 uppercase w-20 truncate">
                        {platform}:
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate flex-1 font-medium"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attachment Viewer Modal */}
      <AttachmentViewer
        attachment={selectedAttachment}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />

      {/* Content Management Modal */}
      <Modal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        title="Manage Subtask Content"
        size="lg"
      >
        <div className="space-y-4 py-2">
          <Description
            title="Content for Description"
            placeholder="Add content description"
            name="copyOfDescription"
            value={contentValues}
            onChange={handleContentChange}
            disabled={updateSubTask.isLoading}
          />
          <Description
            title="Description for publishing"
            placeholder="Add publish description"
            name="description"
            value={contentValues}
            onChange={handleContentChange}
            disabled={updateSubTask.isLoading}
          />
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="flex items-center gap-2 text-sm font-bold text-[#7D8592] pl-1.5">
              <svg
                className="w-4 h-4 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
              Ideas
            </label>
            <textarea
              className="rounded-[14px] text-sm min-h-[100px] w-full border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none resize-none transition-all focus:border-blue-300"
              name="ideas"
              value={contentValues.ideas}
              onChange={handleContentChange}
              placeholder="Record your ideas here..."
              disabled={updateSubTask.isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowContentModal(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton
              title={updateSubTask.isLoading ? "Saving..." : "Save Changes"}
              onclick={handleSaveContent}
              disable={updateSubTask.isLoading}
            />
          </div>
        </div>
      </Modal>
      {/* URL Management Modal */}
      <Modal
        isOpen={showURLModal}
        onClose={() => setShowURLModal(false)}
        title="Manage Publish URLs"
        size="md"
      >
        <div className="space-y-4 py-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
              <svg
                className="w-4 h-4 text-blue-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-blue-700">
                Configure platform URLs for this project. Only enabled platforms in project settings are shown.
              </p>
            </div>

            {/* Instagram */}
            {effectiveProjectData?.socialMedia?.instagram?.manage && (
              <div className="flex flex-col gap-y-1.5">
                <label className="text-sm font-bold text-[#7D8592] pl-1.5 flex items-center gap-2">
                  <span className="text-pink-500">Instagram</span>
                </label>
                <input
                  type="url"
                  className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:border-blue-300 transition-all"
                  value={urlValues.instagram || ""}
                  onChange={(e) => handleURLChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/p/..."
                />
              </div>
            )}

            {/* Facebook */}
            {effectiveProjectData?.socialMedia?.facebook?.manage && (
              <div className="flex flex-col gap-y-1.5">
                <label className="text-sm font-bold text-[#7D8592] pl-1.5 flex items-center gap-2">
                  <span className="text-blue-600">Facebook</span>
                </label>
                <input
                  type="url"
                  className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:border-blue-300 transition-all"
                  value={urlValues.facebook || ""}
                  onChange={(e) => handleURLChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
            )}

            {/* LinkedIn */}
            {effectiveProjectData?.socialMedia?.linkedin?.manage && (
              <div className="flex flex-col gap-y-1.5">
                <label className="text-sm font-bold text-[#7D8592] pl-1.5 flex items-center gap-2">
                  <span className="text-blue-700">LinkedIn</span>
                </label>
                <input
                  type="url"
                  className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:border-blue-300 transition-all"
                  value={urlValues.linkedin || ""}
                  onChange={(e) => handleURLChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/posts/..."
                />
              </div>
            )}

            {/* GMB / Google */}
            {effectiveProjectData?.socialMedia?.google?.manage && (
              <div className="flex flex-col gap-y-1.5">
                <label className="text-sm font-bold text-[#7D8592] pl-1.5 flex items-center gap-2">
                  <span className="text-red-500">Google My Business (GMB)</span>
                </label>
                <input
                  type="url"
                  className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:border-blue-300 transition-all"
                  value={urlValues.google || ""}
                  onChange={(e) => handleURLChange("google", e.target.value)}
                  placeholder="https://google.com/..."
                />
              </div>
            )}

            {/* Other social media platforms */}
            {effectiveProjectData?.socialMedia?.other?.map(
              (platform, index) =>
                platform.manage && (
                  <div key={index} className="flex flex-col gap-y-1.5">
                    <label className="text-sm font-bold text-[#7D8592] pl-1.5 flex items-center gap-2">
                      <span className="text-gray-500">{platform.platform}</span>
                    </label>
                    <input
                      type="url"
                      className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:border-blue-300 transition-all"
                      value={urlValues[platform.platform.toLowerCase()] || ""}
                      onChange={(e) => handleURLChange(platform.platform.toLowerCase(), e.target.value)}
                      placeholder={`https://${platform.platform.toLowerCase()}.com/...`}
                    />
                  </div>
                )
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowURLModal(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton
              title={updateSubTask.isLoading ? "Saving..." : "Save URLs"}
              onclick={handleSaveURLs}
              disable={updateSubTask.isLoading}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubTaskAttachments;
