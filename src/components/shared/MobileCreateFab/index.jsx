import React, { useEffect, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

/**
 * Mobile-only speed dial. Hidden from md and up.
 * Pass actions with { id, label, icon, onClick, show? }.
 * One visible action: tap opens it. Multiple: tap expands the menu.
 */
const MobileCreateFab = ({
  actions = [],
  ariaLabel = "Create",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const visible = actions.filter((action) => action && action.show !== false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!visible.length) return null;

  const runAction = (action) => {
    setOpen(false);
    action?.onClick?.();
  };

  const handleMainClick = () => {
    if (visible.length === 1) {
      runAction(visible[0]);
      return;
    }
    setOpen((prev) => !prev);
  };

  return (
    <div
      className={`fixed bottom-[90px] left-6 z-50 md:hidden ${className}`}
    >
      {open && (
        <button
          type="button"
          aria-label="Close create menu"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="relative z-50 flex flex-col-reverse items-start gap-3">
        <button
          type="button"
          onClick={handleMainClick}
          aria-label={open ? "Close create menu" : ariaLabel}
          aria-expanded={visible.length > 1 ? open : undefined}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#3f8cff] text-white shadow-xl transition-all duration-200 hover:bg-[#2f6bff] active:scale-95 ${
            open ? "rotate-45" : ""
          }`}
        >
          {open ? <FiX size={22} /> : <FiPlus size={22} />}
        </button>

        {open &&
          visible.map((action) => (
            <button
              key={action.id || action.label}
              type="button"
              onClick={() => runAction(action)}
              className="flex items-center gap-2 rounded-full bg-white pl-2.5 pr-4 py-2 text-sm font-semibold text-slate-700 shadow-lg border border-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F9FD] text-[#3F8CFF]">
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
      </div>
    </div>
  );
};

export default MobileCreateFab;
