import React, { useState } from "react";

const MessageAttachment = ({ attachment, messageType }) => {
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.startsWith("video/")) return "🎥";
    if (mimetype.startsWith("audio/")) return "🎵";
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("document") || mimetype.includes("word")) return "📝";
    if (mimetype.includes("zip") || mimetype.includes("rar")) return "📦";
    return "📄";
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.originalName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageClick = () => {
    setShowFullImage(true);
  };

  const closeFullImage = () => {
    setShowFullImage(false);
  };

  // Image preview for image files
  if (
    messageType === "image" &&
    attachment.mimetype.startsWith("image/") &&
    !imageError
  ) {
    return (
      <>
        <div className="mt-2 max-w-xs">
          <img
            src={attachment.url}
            alt={attachment.originalName}
            className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity max-w-full h-auto"
            onClick={handleImageClick}
            onError={() => setImageError(true)}
          />
          <div className="text-xs text-gray-500 mt-1">
            {attachment.originalName} ({formatFileSize(attachment.size)})
          </div>
        </div>

        {/* Full image modal */}
        {showFullImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closeFullImage}
          >
            <div className="max-w-4xl max-h-full p-4">
              <img
                src={attachment.url}
                alt={attachment.originalName}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={closeFullImage}
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // File attachment display for non-image files
  return (
    <div className="mt-2 max-w-xs">
      <div
        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleDownload}
      >
        <div className="text-2xl">{getFileIcon(attachment.mimetype)}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {attachment.originalName}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(attachment.size)}
          </div>
        </div>
        <div className="text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MessageAttachment;
