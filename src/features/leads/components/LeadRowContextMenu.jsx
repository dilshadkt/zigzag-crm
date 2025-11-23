import React, { useEffect, useRef, useState } from "react";
import { FiEdit, FiMail, FiCheckSquare, FiUser, FiTrash2, FiRefreshCw, FiLink } from "react-icons/fi";

const LeadRowContextMenu = ({
  visible,
  position,
  onClose,
  onEdit,
  onSendEmail,
  onCreateTask,
  onAssign,
  onDelete,
  onConvert,
  onCopyURL,
  lead,
}) => {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (visible && menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Check if menu goes off-screen on the right
      if (position.x + menuRect.width > viewportWidth) {
        newX = viewportWidth - menuRect.width - 10;
      }

      // Check if menu goes off-screen on the left
      if (newX < 10) {
        newX = 10;
      }

      // Check if menu goes off-screen on the bottom
      if (position.y + menuRect.height > viewportHeight) {
        newY = viewportHeight - menuRect.height - 10;
      }

      // Check if menu goes off-screen on the top
      if (newY < 10) {
        newY = 10;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [visible, position]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const menuItems = [
    {
      label: "Edit",
      icon: FiEdit,
      onClick: onEdit,
      show: !!onEdit,
    },
    {
      label: "Send Email",
      icon: FiMail,
      onClick: onSendEmail,
      show: !!onSendEmail && lead?.contact?.email,
    },
    {
      label: "Create Task",
      icon: FiCheckSquare,
      onClick: onCreateTask,
      show: !!onCreateTask,
    },
    {
      label: "Change Owner",
      icon: FiUser,
      onClick: onAssign,
      show: !!onAssign,
    },
    {
      label: "Delete",
      icon: FiTrash2,
      onClick: onDelete,
      show: !!onDelete,
      isDestructive: true,
    },
    {
      label: "Convert",
      icon: FiRefreshCw,
      onClick: onConvert,
      show: !!onConvert,
    },
    {
      label: "Copy URL",
      icon: FiLink,
      onClick: onCopyURL,
      show: !!onCopyURL,
    },
  ].filter((item) => item.show);

  const handleItemClick = (onClick) => {
    if (onClick) {
      onClick(lead);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ background: "transparent" }}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px]"
        style={{
          top: `${adjustedPosition.y}px`,
          left: `${adjustedPosition.x}px`,
        }}
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === menuItems.length - 1;
          const isDestructive = item.isDestructive;

          return (
            <React.Fragment key={item.label}>
              <button
                onClick={() => handleItemClick(item.onClick)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-3 cursor-pointer ${
                  isDestructive
                    ? "text-red-600 hover:bg-red-50 active:bg-red-100"
                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isDestructive ? "text-red-600" : "text-gray-600"}`} />
                <span>{item.label}</span>
              </button>
              {!isLast && !isDestructive && index < menuItems.length - 1 && !menuItems[index + 1]?.isDestructive && (
                <div className="border-t border-gray-200 my-1"></div>
              )}
              {isDestructive && !isLast && (
                <div className="border-t border-gray-200 my-1"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

export default LeadRowContextMenu;

