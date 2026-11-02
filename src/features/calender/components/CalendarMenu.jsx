import React from "react";
import { CALENDAR_MENU_ITEMS } from "../constants";

const CalendarMenu = ({
  handleMenuItemClick,
  isDropdownOpen,
  position = "top",
  align = "right", // Which edge of the button the menu is anchored to
}) => {
  if (!isDropdownOpen) return null;

  const side = align === "left" ? "left-0" : "right-0";
  const arrowSide = align === "left" ? "left-3" : "right-3";

  // Dynamic positioning classes
  const getPositionClasses = () => {
    if (position === "bottom") {
      return `absolute top-full ${side} mt-2`; // Show below the button
    }
    return `absolute bottom-full ${side} mb-2`; // Show above the button (default)
  };

  // Arrow indicator positioning
  const getArrowClasses = () => {
    if (position === "bottom") {
      return `absolute -top-1 ${arrowSide} w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45`;
    }
    return `absolute -bottom-1 ${arrowSide} w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45`;
  };

  return (
    <div className="relative">
      {/* Arrow indicator */}
      <div className={getArrowClasses()}></div>

      {/* Menu container */}
      <div
        className={`${getPositionClasses()} w-48 bg-white border
       border-gray-200 rounded-lg shadow-lg z-50 py-2`}
      >
        {CALENDAR_MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => handleMenuItemClick(item.key)}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 cursor-pointer transition-colors 
                 flex items-center gap-2 text-[13px] text-gray-700"
          >
            <item.icon className="text-gray-500" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarMenu;
