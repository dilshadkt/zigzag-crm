import React, { useRef, useState } from "react";
import { useSubTaskAttachments } from "../../../hooks/useSubTaskAttachments";
import AttachmentViewer from "../AttachmentViewer";

const SubTaskAttachments = ({ subTask, parentTaskId, canEdit = false }) => {
  const fileInputRef = useRef(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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

  return (
    <>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            Attachments ({attachments.length})
          </span>
          {canEdit && (
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,application/pdf,.doc,.docx,video/*,audio/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isAddingAttachment}
                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add attachments"
              >
                {isUploading || isAddingAttachment ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                ) : (
                  <svg
                    className="w-3 h-3"
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
      </div>

      {/* Attachment Viewer Modal */}
      <AttachmentViewer
        attachment={selectedAttachment}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </>
  );
};

export default SubTaskAttachments;
