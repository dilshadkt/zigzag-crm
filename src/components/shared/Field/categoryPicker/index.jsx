import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiSearch } from "react-icons/fi";

const UNGROUPED = "No department";

export const getCategoryDepartmentName = (category) => {
  const department = category?.department;
  if (!department) return "";
  if (typeof department === "object") return department.name || "";
  return "";
};

const categoryMatchesSearch = (category, term) => {
  if (!term) return true;
  const name = String(category?.name || "").toLowerCase();
  const department = getCategoryDepartmentName(category).toLowerCase();
  const points = String(category?.points ?? "");
  return (
    name.includes(term) ||
    department.includes(term) ||
    points.includes(term)
  );
};

const CategoryPicker = ({
  categories = [],
  value = "",
  onChange,
  placeholder = "Select category...",
  emptyLabel = "No category",
  disabled = false,
  compact = false,
  className = "",
  menuMinWidth = 280,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 280, maxHeight: 280 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const activeCategories = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).filter(
        (category) => category?.isActive !== false
      ),
    [categories]
  );

  const selectedCategory = useMemo(
    () =>
      activeCategories.find(
        (category) => String(category._id) === String(value || "")
      ),
    [activeCategories, value]
  );

  const groupedCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const groups = new Map();

    activeCategories.forEach((category) => {
      if (!categoryMatchesSearch(category, term)) return;
      const departmentName = getCategoryDepartmentName(category) || UNGROUPED;
      if (!groups.has(departmentName)) groups.set(departmentName, []);
      groups.get(departmentName).push(category);
    });

    return [...groups.entries()].sort(([a], [b]) => {
      if (a === UNGROUPED) return 1;
      if (b === UNGROUPED) return -1;
      return a.localeCompare(b);
    });
  }, [activeCategories, searchTerm]);

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, menuMinWidth);
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(320, openUp ? spaceAbove : spaceBelow));
    setMenuPos({
      top: openUp ? rect.top - 4 : rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - width - 8),
      width,
      maxHeight,
      openUp,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();
    const timer = setTimeout(() => searchRef.current?.focus(), 0);

    const handlePointer = (event) => {
      if (triggerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    const handleReposition = () => updateMenuPosition();
    const handleScroll = () => setIsOpen(false);

    document.addEventListener("mousedown", handlePointer);
    window.addEventListener("resize", handleReposition);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("resize", handleReposition);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, menuMinWidth]);

  useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  const handleSelect = (categoryId) => {
    onChange?.(categoryId);
    setIsOpen(false);
  };

  const selectedDepartment = getCategoryDepartmentName(selectedCategory);
  const hasValue = Boolean(selectedCategory);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((open) => !open);
        }}
        className={`flex w-full items-center gap-2 rounded-lg border px-2.5 text-left outline-none transition-colors ${
          compact ? "min-h-[36px] py-1.5" : "min-h-[42px] py-2"
        } ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "hover:border-blue-300 focus:border-blue-400"
        } ${
          hasValue
            ? "border-gray-200 bg-white text-gray-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {hasValue ? (
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: selectedCategory.color || "#3F8CFF" }}
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span className={`block truncate ${compact ? "text-xs font-semibold" : "text-sm font-semibold"}`}>
            {hasValue ? selectedCategory.name : placeholder}
          </span>
          {hasValue ? (
            <span className="block truncate text-[10px] font-medium text-gray-400">
              {selectedDepartment || "No department"}
              {Number(selectedCategory.points) > 0
                ? ` · ${selectedCategory.points} pts`
                : ""}
            </span>
          ) : null}
        </span>
        <FiChevronDown
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[1200] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            style={{
              top: menuPos.openUp ? undefined : menuPos.top,
              bottom: menuPos.openUp ? window.innerHeight - menuPos.top : undefined,
              left: menuPos.left,
              width: menuPos.width,
            }}
          >
            <div className="border-b border-gray-100 p-2">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                <FiSearch className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsOpen(false);
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  placeholder="Search category or department..."
                  className="w-full bg-transparent text-xs text-gray-700 outline-none"
                />
              </div>
            </div>

            <div
              className="overflow-y-auto py-1"
              style={{ maxHeight: menuPos.maxHeight }}
            >
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`flex w-full items-center px-3 py-2 text-left text-xs ${
                  !value
                    ? "bg-amber-50 font-semibold text-amber-800"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {emptyLabel}
              </button>

              {groupedCategories.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-gray-400">
                  No categories match “{searchTerm}”
                </p>
              ) : (
                groupedCategories.map(([departmentName, items]) => (
                  <div key={departmentName} className="pt-1">
                    <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      {departmentName}
                    </p>
                    {items.map((category) => {
                      const isSelected = String(category._id) === String(value || "");
                      return (
                        <button
                          key={category._id}
                          type="button"
                          onClick={() => handleSelect(category._id)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left ${
                            isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: category.color || "#3F8CFF" }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold">
                              {category.name}
                            </span>
                            <span className="block truncate text-[10px] text-gray-400">
                              {departmentName}
                              {Number(category.points) > 0
                                ? ` · ${category.points} pts`
                                : ""}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CategoryPicker;
