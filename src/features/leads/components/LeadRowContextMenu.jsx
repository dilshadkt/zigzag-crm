import React, { useEffect, useRef, useState } from "react";
import { FiEdit, FiMail, FiCheckSquare, FiUser, FiTrash2, FiRefreshCw, FiLink, FiChevronRight, FiFolder, FiBriefcase } from "react-icons/fi";

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
  branches = [],
  onMoveToBranch,
  projects = [],
  onMoveToProject,
}) => {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [showBranches, setShowBranches] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowBranches(false);
      setShowProjects(false);
    }
  }, [visible]);

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

      // Check if menu goes off-screen on the bottom - FLIP UP if needed
      if (position.y + menuRect.height > viewportHeight) {
        // Calculate flipped position: position.y is rect.bottom + 5
        // We want newY to be rect.top - menuRect.height - 5
        // Approximating button height as 30px: rect.top = position.y - 35
        newY = position.y - menuRect.height - 40; 
      }

      // Final safety check for top
      if (newY < 10) {
        newY = 10;
        // If it's still too tall, it will be scrollable due to max-h and overflow-y
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [visible, position, showBranches]); // Re-adjust when branches show/hide

  useEffect(() => {
    const handleCloseOthers = () => {
      if (visible) onClose();
    };
    window.addEventListener("close-all-lead-dropdowns", handleCloseOthers);
    return () => window.removeEventListener("close-all-lead-dropdowns", handleCloseOthers);
  }, [visible, onClose]);

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

  const otherProjects = projects.filter(
    (proj) => proj._id !== (lead?.project?._id || lead?.project)
  );

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
    {
      label: "Move to Branch",
      icon: FiFolder,
      onClick: (e) => {
        e.stopPropagation();
        setShowBranches(!showBranches);
        setShowProjects(false);
      },
      show: branches.length > 0 && !!onMoveToBranch,
      hasSubmenu: true,
    },
    {
      label: "Move to Project",
      icon: FiBriefcase,
      onClick: (e) => {
        e.stopPropagation();
        setShowProjects(!showProjects);
        setShowBranches(false);
      },
      show: otherProjects.length > 0 && !!onMoveToProject,
      hasSubmenu: true,
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
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{ background: "transparent" }}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px] max-h-[80vh] overflow-y-auto scrollbar-hide"
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
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.hasSubmenu) {
                      item.onClick(e);
                    } else {
                      handleItemClick(item.onClick);
                    }
                  }}
                  className={`w-full px-3 py-1.5 text-left text-[13px] transition-colors flex items-center justify-between cursor-pointer ${
                    isDestructive
                      ? "text-red-600 hover:bg-red-50 active:bg-red-100"
                      : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  } ${item.hasSubmenu && (showBranches || showProjects) ? "bg-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isDestructive ? "text-red-600" : "text-gray-600"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <FiChevronRight className={`w-3 h-3 text-gray-400 transition-transform ${(item.label === "Move to Branch" ? showBranches : showProjects) ? "rotate-90" : ""}`} />
                  )}
                </button>
 
                {item.hasSubmenu && showBranches && item.label === "Move to Branch" && (
                  <div className="bg-gray-50 border-y border-gray-100 py-1">
                    {branches.map((branch) => (
                      <button
                        key={branch.id || branch.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToBranch(lead, branch.name);
                          onClose();
                        }}
                        className="w-full px-10 py-1.5 text-left text-[12px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        {branch.name}
                      </button>
                    ))}
                  </div>
                )}

                {item.hasSubmenu && showProjects && item.label === "Move to Project" && (
                  <div className="bg-gray-50 border-y border-gray-100 py-1 max-h-[200px] overflow-y-auto scrollbar-hide">
                    {otherProjects.map((proj) => (
                      <button
                        key={proj._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToProject(lead, proj._id, proj.name);
                          onClose();
                        }}
                        className="w-full px-3 py-2 text-left text-[12px] text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                        title={proj.name}
                      >
                        {proj.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

