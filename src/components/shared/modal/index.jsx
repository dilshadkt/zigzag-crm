import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, title, children }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with reduced opacity */}
      <div
        className="fixed inset-0 bg-black/20 bg-opacity-30 
        backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container with enhanced styling */}
      <div className="flex min-h-full items-center justify-center p-4 
      text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-2xl 
          bg-white px-4 pb-4 pt-5 text-left 
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all
           duration-300 ease-in-out sm:my-8 sm:w-full sm:max-w-lg 
           sm:p-6 scale-100 "
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header with enhanced styling */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3
              className="text-xl font-semibold leading-6 text-gray-900"
              id="modal-title"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              <span className="sr-only">Close</span>
              <IoClose className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Content with enhanced spacing */}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 