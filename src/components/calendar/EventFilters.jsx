import React from "react";
import { FaGift } from "react-icons/fa";
import { MdTask, MdFolder, MdSubdirectoryArrowRight } from "react-icons/md";

const EventFilters = ({ eventFilters, onToggleFilter }) => {
  return (
    <div className="flex items-center gap-2 ml-auto mr-4">
      {/* Tasks Filter */}
      <button
        onClick={() => onToggleFilter("tasks")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.tasks
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Tasks"
      >
        <MdTask className="text-sm" />
        Tasks
      </button>

      {/* Subtasks Filter */}
      <button
        onClick={() => onToggleFilter("subtasks")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.subtasks
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Subtasks"
      >
        <MdSubdirectoryArrowRight className="text-sm" />
        Subtasks
      </button>

      {/* Projects Filter */}
      <button
        onClick={() => onToggleFilter("projects")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.projects
            ? "bg-amber-100 text-amber-700 border border-amber-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Projects"
      >
        <MdFolder className="text-sm" />
        Projects
      </button>

      {/* Birthdays Filter */}
      <button
        onClick={() => onToggleFilter("birthdays")}
        className={`flex items-center cursor-pointer gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          eventFilters.birthdays
            ? "bg-purple-100 text-purple-700 border border-purple-200"
            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Toggle Birthdays"
      >
        <FaGift className="text-sm" />
        Events
      </button>
    </div>
  );
};

export default EventFilters;
