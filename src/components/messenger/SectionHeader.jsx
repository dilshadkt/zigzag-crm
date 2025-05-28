import React from "react";

const SectionHeader = ({
  title,
  sectionType,
  isCollapsed = false,
  onToggle,
}) => (
  <div
    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg mx-2"
    onClick={() => onToggle(sectionType)}
  >
    <svg
      className={`w-4 h-4 text-blue-500 transition-transform ${
        isCollapsed ? "-rotate-90" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
    <span className="text-sm font-medium text-blue-500">{title}</span>
  </div>
);

export default SectionHeader;
