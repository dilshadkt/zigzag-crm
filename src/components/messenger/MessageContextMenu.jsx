import React, { useEffect, useRef, useState } from "react";

const MessageContextMenu = ({
  visible,
  position,
  onClose,
  onPin,
  onUnpin,
  onReply,
  onCopy,
  onDelete,
  isPinned = false,
  isOwn = false,
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
        newX = viewportWidth - menuRect.width - 10; // 10px padding from edge
      }

      // Check if menu goes off-screen on the left
      if (newX < 10) {
        newX = 10;
      }

      // Check if menu goes off-screen on the bottom
      if (position.y + menuRect.height > viewportHeight) {
        newY = viewportHeight - menuRect.height - 10; // 10px padding from edge
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
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] max-w-[220px] animate-in fade-in zoom-in-95 duration-100"
        style={{
          top: `${adjustedPosition.y}px`,
          left: `${adjustedPosition.x}px`,
        }}
      >
        {/* Pin/Unpin */}
        {isPinned ? (
          <button
            onClick={() => {
              onUnpin && onUnpin();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Unpin Message</span>
          </button>
        ) : (
          <button
            onClick={() => {
              onPin && onPin();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
            </svg>
            <span>Pin Message</span>
          </button>
        )}

        {/* Reply */}
        {onReply && (
          <button
            onClick={() => {
              onReply();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            <span>Reply</span>
          </button>
        )}

        {/* Copy */}
        {onCopy && (
          <button
            onClick={() => {
              onCopy();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>Copy Text</span>
          </button>
        )}

        {/* Delete (only for own messages) */}
        {isOwn && onDelete && (
          <>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-3 text-red-600 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>Delete Message</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default MessageContextMenu;
