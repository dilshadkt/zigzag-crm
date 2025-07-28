import React from "react";
import { IoArrowUpOutline, IoCloseOutline } from "react-icons/io5";
import { BiEdit, BiTrash, BiArchive } from "react-icons/bi";

const ViewNoteModal = ({ note, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !note) return null;

  const priorityColors = {
    low: "#00D097",
    medium: "#FFBD21",
    high: "#FF4D4F",
  };

  const priorityColor =
    priorityColors[note.priority?.toLowerCase()] || priorityColors.medium;

  const backgroundColors = {
    yellow: "bg-yellow-50",
    pink: "bg-pink-50",
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  };

  const noteColor = (() => {
    if (!note.color) return backgroundColors.yellow;

    // If color is already a full class name (e.g., "bg-yellow-50")
    if (note.color.startsWith("bg-")) {
      return note.color;
    }

    // If color is a simple name (e.g., "yellow"), map it to full class name
    return backgroundColors[note.color] || backgroundColors.yellow;
  })();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    onEdit(note._id);
    onClose();
  };

  const handleDelete = () => {
    onDelete(note._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`${noteColor} px-6 py-4 border-b border-gray-100`}>
          <div className="flexBetween">
            <div className="flex items-center gap-x-3">
              <span className="text-xs text-[#91929E] uppercase font-medium">
                NOTE
              </span>
              <div
                className="flexCenter text-xs gap-x-1 px-2 py-1 rounded-full"
                style={{
                  color: priorityColor,
                  backgroundColor: `${priorityColor}15`,
                }}
              >
                <IoArrowUpOutline className="text-sm" />
                <span className="font-medium capitalize">{note.priority}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
            >
              <IoCloseOutline className="w-5 h-5 text-[#7D8592]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 leading-relaxed">
            {note.title || "Untitled Note"}
          </h2>

          {note.desc && (
            <div className="prose prose-gray max-w-none">
              <p className="text-[#7D8592] leading-relaxed whitespace-pre-wrap">
                {note.desc}
              </p>
            </div>
          )}

          {!note.desc && (
            <p className="text-[#91929E] italic">No description provided</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flexBetween">
            <div className="flex flex-col gap-y-1">
              <div className="flexStart gap-x-2 text-xs text-[#91929E]">
                <img src="/icons/calender2.svg" alt="" className="w-4" />
                <span>Created: {formatDate(note.createdAt)}</span>
              </div>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div className="flexStart gap-x-2 text-xs text-[#91929E]">
                  <img src="/icons/calender2.svg" alt="" className="w-4" />
                  <span>Updated: {formatDate(note.updatedAt)}</span>
                </div>
              )}
            </div>

            <div className="flexEnd gap-x-2">
              <button
                onClick={handleEdit}
                className="flexCenter gap-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
              >
                <BiEdit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flexCenter gap-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
              >
                <BiTrash className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;
