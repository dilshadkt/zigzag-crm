import React from "react";

const AttachmentViewer = ({ attachment, isOpen, onClose }) => {
  if (!isOpen || !attachment) return null;

  const renderPreview = () => {
    switch (attachment.type) {
      case "image":
        return (
          <div className="flex justify-center">
            <img
              src={attachment.preview}
              alt={attachment.title}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );

      case "pdf":
        return (
          <div className="w-full h-96">
            <iframe
              src={attachment.preview}
              title={attachment.title}
              className="w-full h-full rounded-lg border"
              frameBorder="0"
            />
          </div>
        );

      case "video":
        return (
          <div className="flex justify-center">
            <video
              controls
              className="max-w-full max-h-96 rounded-lg"
              src={attachment.preview}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="flex justify-center p-8">
            <audio controls className="w-full max-w-md">
              <source src={attachment.preview} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      case "link":
        return (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-gray-600 mb-4">External Link</p>
            <a
              href={attachment.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Open Link
              <svg
                className="w-4 h-4 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        );

      default:
        return (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📎</div>
            <p className="text-gray-600 mb-4">Cannot preview this file type</p>
            <a
              href={attachment.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Download File
              <svg
                className="w-4 h-4 ml-2"
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
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {attachment.title}
            </h3>
            {attachment.description && (
              <p className="text-sm text-gray-500 mt-1">
                {attachment.description}
              </p>
            )}
            {attachment.uploadedBy && (
              <p className="text-xs text-gray-400 mt-1">
                Uploaded by {attachment.uploadedBy.firstName} on{" "}
                {new Date(attachment.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-96">{renderPreview()}</div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            File Type: {attachment.type.toUpperCase()}
          </div>
          <div className="flex gap-2">
            <a
              href={attachment.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
              </svg>
              Open in New Tab
            </a>
            <a
              href={attachment.preview}
              download={attachment.title}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentViewer;
