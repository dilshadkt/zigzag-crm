import React, { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BiEdit, BiTrash, BiDotsVerticalRounded } from "react-icons/bi";
import { IoArrowUpOutline } from "react-icons/io5";

const StickyNote = ({
  id,
  title,
  desc,
  priority = "medium",
  color,
  onEdit,
  onDelete,
  onView,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    // Reduce activation constraint for better drag detection
    activationConstraint: {
      distance: 5,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: "#00D097",
    medium: "#FFBD21",
    high: "#FF4D4F",
  };

  const priorityColor =
    priorityColors[priority?.toLowerCase()] || priorityColors.medium;

  // Predefined color options that match the backend schema
  const backgroundColors = {
    yellow: "bg-yellow-50",
    pink: "bg-pink-50",
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  };

  // Use the color from props if available, otherwise use a default
  const noteColor =
    color && backgroundColors[color]
      ? backgroundColors[color]
      : backgroundColors.yellow; // default color

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    onEdit(id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    onDelete(id);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleNoteClick = (e) => {
    // Don't trigger view if dropdown is open
    if (showDropdown) {
      return;
    }

    // Don't trigger if clicking on the dropdown button area
    if (e.target.closest("[data-dropdown-trigger]")) {
      return;
    }

    // Don't trigger if it's a drag handle area
    if (e.target.closest("[data-drag-handle]")) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onView?.(id);
  };

  // Truncate text for better display
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-3xl ${noteColor} p-4 py-5 
      shadow-sm hover:shadow-md transition-all duration-300 min-h-[200px]
       border border-gray-100`}
    >
      {/* Action Menu - No drag functionality */}
      <div className="absolute top-3 right-3 z-50" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          data-dropdown-trigger
          className="p-2 bg-white rounded-full shadow-sm
           hover:bg-gray-50 transition-colors opacity-0 
           group-hover:opacity-100 focus:opacity-100"
          type="button"
        >
          <BiDotsVerticalRounded className="w-4 h-4 text-[#7D8592]" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flexStart gap-x-3 text-sm"
              type="button"
            >
              <BiEdit className="w-4 h-4 text-[#7D8592]" />
              <span className="text-gray-700">Edit Note</span>
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flexStart gap-x-3 text-sm"
              type="button"
            >
              <BiTrash className="w-4 h-4 text-red-600" />
              <span className="text-red-600">Delete Note</span>
            </button>
          </div>
        )}
      </div>

      {/* Drag Handle - Small area in bottom right for dragging */}
      <div
        {...attributes}
        {...listeners}
        data-drag-handle
        className="absolute bottom-2 right-2 w-6 h-6 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 bg-gray-400 rounded-sm flex items-center justify-center"
        title="Drag to reorder"
      >
        <div className="w-3 h-3 bg-gray-600 rounded-sm opacity-60">
          <svg className="w-3 h-3" viewBox="0 0 6 6" fill="currentColor">
            <circle cx="1" cy="1" r="0.5" />
            <circle cx="3" cy="1" r="0.5" />
            <circle cx="5" cy="1" r="0.5" />
            <circle cx="1" cy="3" r="0.5" />
            <circle cx="3" cy="3" r="0.5" />
            <circle cx="5" cy="3" r="0.5" />
            <circle cx="1" cy="5" r="0.5" />
            <circle cx="3" cy="5" r="0.5" />
            <circle cx="5" cy="5" r="0.5" />
          </svg>
        </div>
      </div>

      {/* Clickable Note Content Area */}
      <div
        onClick={handleNoteClick}
        className="h-full flex flex-col gap-y-3 cursor-pointer select-none"
      >
        <div className="flexBetween">
          <div className="flex flex-col gap-y-1">
            <span className="text-xs text-[#91929E] uppercase">NOTE</span>
            <h4 className="font-medium text-gray-800 line-clamp-2">
              {title || "Untitled Note"}
            </h4>
          </div>
          <div
            className="flexEnd text-xs gap-x-1 mr-12"
            style={{ color: priorityColor }}
          >
            <IoArrowUpOutline className="text-sm" />
            <span className="font-medium">{priority}</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-[#7D8592] line-clamp-6">
            {truncateText(desc) || "No description"}
          </p>
          {desc && desc.length > 150 && (
            <p className="text-xs text-blue-500 mt-1 font-medium">
              Click to read more...
            </p>
          )}
        </div>

        <div className="flexBetween mt-auto">
          <div className="flexStart gap-x-2">
            <img src="/icons/calender2.svg" alt="" className="w-4" />
            <span className="text-xs text-[#7D8592]">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative tape effect */}
      <div className="absolute -top-1 left-6 w-8 h-3 bg-gray-200/60 rotate-12 rounded-sm pointer-events-none"></div>
    </div>
  );
};

export default StickyNote;
