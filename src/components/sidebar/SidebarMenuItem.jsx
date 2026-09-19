import React from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";

const SidebarMenuItem = ({
  item,
  isActive,
  isOpen,
  hasChildren,
  taskCount,
  onToggle,
  onNavigate,
  pathname,
  getTaskCount,
}) => {
  return (
    <li className="flex flex-col gap-y-1">
      <div
        onClick={() => {
          if (hasChildren) {
            onToggle(item.title);
          } else {
            onNavigate(item.path);
          }
        }}
        className={` relative cursor-pointer px-2 py-[10px] flexStart
gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] group ${isActive ? `bg-[#ECF3FF] text-[#3F8CFF]` : ""
          }`}
      >
        <item.icon className="text-lg group-hover:text-[#3F8CFF]" />
        <span
          className="group-hover:text-[#3F8CFF] group-hover:translate-x-1
transition-all duration-300 text-sm flex-1"
        >
          {item.title}
        </span>
        {taskCount !== null && taskCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[20px] text-center">
            {taskCount}
          </span>
        )}
        {hasChildren && (
          <div className="text-gray-400">
            {isOpen ? (
              <MdKeyboardArrowDown className="text-xl" />
            ) : (
              <MdKeyboardArrowRight className="text-xl" />
            )}
          </div>
        )}
      </div>

      {/* Render Sub-items */}
      {hasChildren && isOpen && (
        <ul className="flex flex-col gap-y-1   border-[#F4F9FD]">
          {item.children.map((child, childIdx) => {
            const childTaskCount = getTaskCount(child);
            const isChildActive = pathname === child.path;

            return (
              <li
                key={childIdx}
                onClick={() => onNavigate(child.path)}
                className={`relative cursor-pointer px-3 py-[8px] flexStart
        gap-x-3 rounded-[8px] hover:bg-[#ECF3FF] group ${isChildActive ? `text-[#3F8CFF]` : ""
                  }`}
              >
                <span
                  className={`group-hover:text-[#3F8CFF] group-hover:translate-x-1
          transition-all duration-300 text-[13px] flex-1 ${isChildActive ? "font-medium" : ""}`}
                >
                  {child.title}
                </span>
                {childTaskCount !== null && childTaskCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full min-w-[16px] text-center">
                    {childTaskCount}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default SidebarMenuItem;
