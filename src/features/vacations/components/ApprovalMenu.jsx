import React, { useRef, useEffect } from "react";
import { FaCheck, FaTimes, FaEdit } from "react-icons/fa";

const ApprovalMenu = ({
  onApprove,
  onReject,
  onModify,
  onCancel,
  isOpen,
  setIsOpen,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-4 top-12 bg-white shadow-lg rounded-lg py-2 z-10 min-w-[140px]"
    >
      <button
        onClick={onApprove}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-green-600"
      >
        <FaCheck size={12} />
        <span>Approve</span>
      </button>
      <button
        onClick={onModify}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-blue-600"
      >
        <FaEdit size={12} />
        <span>Modify dates</span>
      </button>
      <button
        onClick={onReject}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-500"
      >
        <FaTimes size={12} />
        <span>Reject</span>
      </button>
      <button
        onClick={onCancel}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-600"
      >
        <FaTimes size={12} />
        <span>Cancel</span>
      </button>
    </div>
  );
};

export default ApprovalMenu;
