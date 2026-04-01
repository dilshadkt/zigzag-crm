import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, setIsOpen, title, children, maxWidth = "sm:max-w-lg" }) => {
  const closeAction = onClose || setIsOpen;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && closeAction) closeAction();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        onClick={() => closeAction && closeAction()}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-4">
        <div
          className={`relative transform rounded-3xl bg-white px-4 pb-4 pt-5 text-left 
          shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all
           duration-300 ease-in-out sm:my-8 sm:w-full ${maxWidth} 
           sm:p-6 scale-100 flex flex-col max-h-[90vh]`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
            <h3
              className="text-[17px] font-bold tracking-tight text-gray-900"
              id="modal-title"
            >
              {title}
            </h3>
            <button
              onClick={() => closeAction && closeAction()}
              className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all duration-200 outline-none"
            >
              <IoClose className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content - with internal scroll if needed */}
          <div className="mt-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

