import React, { useEffect } from "react";
import {
  FaTimes,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const ImageLightbox = ({
  image,
  isOpen,
  onClose,
  allImages = [],
  currentIndex = 0,
  onNavigate,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleArrowKeys = (e) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < allImages.length - 1
      ) {
        onNavigate(currentIndex + 1);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleArrowKeys);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleArrowKeys);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, currentIndex, allImages.length, onNavigate]);

  if (!isOpen || !image) return null;

  const hasMultipleImages = allImages.length > 1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < allImages.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all text-white z-20"
          title="Close (Esc)"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {/* Download Button */}
        <a
          href={image.url || image.preview}
          download={image.originalName || image.title}
          className="absolute top-4 right-20 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all text-white z-20"
          title="Download"
          onClick={(e) => e.stopPropagation()}
        >
          <FaDownload className="w-5 h-5" />
        </a>

        {/* Previous Button */}
        {hasMultipleImages && canGoPrevious && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all text-white z-20"
            title="Previous (←)"
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasMultipleImages && canGoNext && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all text-white z-20"
            title="Next (→)"
          >
            <FaChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <img
          src={image.url || image.preview}
          alt={image.originalName || image.title || "Image"}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Image Info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
          <p className="text-sm font-medium">
            {image.originalName || image.title || "Image"}
          </p>
          {hasMultipleImages && (
            <p className="text-xs text-gray-300 mt-1">
              {currentIndex + 1} / {allImages.length}
            </p>
          )}
          {image.time && (
            <p className="text-xs text-gray-400 mt-1">Shared {image.time}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;
