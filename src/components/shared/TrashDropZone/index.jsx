import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { BiTrash } from "react-icons/bi";

const TrashDropZone = ({ isDragging }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "trash-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isDragging ? "scale-110 opacity-100" : "scale-90 opacity-60"
      }`}
    >
      <div
        className={`w-16 h-16 rounded-full flexCenter shadow-lg transition-all duration-300 ${
          isOver
            ? "bg-red-500 scale-125 shadow-xl"
            : isDragging
            ? "bg-red-400 hover:bg-red-500"
            : "bg-gray-400"
        }`}
      >
        <BiTrash
          className={`transition-all duration-300 ${
            isOver ? "w-8 h-8 text-white" : "w-6 h-6 text-white"
          }`}
        />
      </div>

      {/* Label */}
      {isDragging && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-lg">
            {isOver ? "Release to delete" : "Drop to delete"}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashDropZone;
