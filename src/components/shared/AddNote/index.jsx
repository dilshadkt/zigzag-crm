import React from "react";
import { BiPlus } from "react-icons/bi";

const AddNote = ({ onAddNote }) => {
  return (
    <div
      onClick={onAddNote}
      className="group relative cursor-pointer rounded-3xl bg-[#F4F9FD] p-4 py-5 shadow-sm hover:shadow-md transition-all duration-300 min-h-[200px] border border-gray-100 flexCenter"
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-white group-hover:bg-gray-50 rounded-full flexCenter mx-auto mb-3 transition-colors duration-200 shadow-sm">
          <BiPlus className="w-6 h-6 text-[#7D8592]" />
        </div>
        <div className="flex flex-col gap-y-1">
          <h4 className="font-medium text-gray-800">Add New Note</h4>
          <span className="text-xs text-[#91929E]">
            Click to create a sticky note
          </span>
        </div>
      </div>

      {/* Decorative tape effect */}
      <div className="absolute -top-1 left-6 w-8 h-3 bg-gray-200/60 rotate-12 rounded-sm"></div>
    </div>
  );
};

export default AddNote;
