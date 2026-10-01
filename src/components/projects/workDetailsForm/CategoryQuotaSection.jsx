import React, { useMemo, useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useGetTaskCategories } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { FiEdit3, FiSearch, FiChevronDown } from "react-icons/fi";
import {
  addCategoryToWorkDetails,
  collectMonthlyExtraWork,
  getSelectedWorkItems,
  matchStandardWorkType,
  removeWorkItem,
  updateWorkItemField,
  swapCategoryInWorkDetails
} from "./workTypeMapping";

const categoryId = (value) => String(value?._id || value || "");

const SearchableCategorySelect = ({ options, value, onChange, placeholder = "Select category..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const selectedOption = options.find(opt => categoryId(opt) === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="flex items-center justify-between w-full p-2 border border-gray-200 rounded bg-white text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <FiSearch className="text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-gray-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt._id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${value === opt._id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => {
                    onChange(opt._id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt.name} {opt.points > 0 ? `(${opt.points} pts)` : ""}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-gray-500 text-center italic">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryQuotaSection = ({
  workDetails,
  onChange,
  isEditMode = false,
}) => {
  const { companyId, user } = useAuth();
  const effectiveCompanyId = companyId || user?.company;
  const { data: categories = [], isLoading } = useGetTaskCategories(effectiveCompanyId);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editingItemKey, setEditingItemKey] = useState(null);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  const items = useMemo(
    () => getSelectedWorkItems(workDetails, categories),
    [workDetails, categories]
  );

  const availableCategories = useMemo(() => {
    const usedKeys = new Set(
      items.filter((item) => item.kind === "standard").map((item) => item.key)
    );
    const usedNames = new Set(
      items.map((item) => String(item.name || "").trim().toLowerCase())
    );
    const usedIds = new Set(
      items.map((item) => categoryId(item.taskCategory)).filter(Boolean)
    );

    return (categories || []).filter((category) => {
      if (category.isActive === false) return false;
      const standardKey = matchStandardWorkType(category.name);
      if (standardKey && usedKeys.has(standardKey)) return false;
      if (usedNames.has(String(category.name || "").trim().toLowerCase())) return false;
      if (usedIds.has(categoryId(category))) return false;
      return true;
    });
  }, [categories, items]);

  const extraOnlyItems = useMemo(() => {
    const quotaOtherNames = new Set(
      items
        .filter((item) => item.kind === "other")
        .map((item) => String(item.name || "").trim().toLowerCase())
    );
    return collectMonthlyExtraWork(workDetails).filter(
      (item) =>
        item.kind === "other" &&
        !quotaOtherNames.has(String(item.name || "").trim().toLowerCase())
    );
  }, [items, workDetails]);

  const emit = (next) => onChange?.(next);

  const handleAdd = () => {
    const category = availableCategories.find(
      (item) => categoryId(item) === selectedCategoryId
    );
    if (!category) return;
    emit(
      addCategoryToWorkDetails(
        workDetails,
        {
          name: category.name,
          taskCategory: category._id,
          count: Number(count) || 0,
          total: Number(total) || 0,
        },
        isEditMode,
        categories
      )
    );
    setSelectedCategoryId("");
    setCount(0);
    setTotal(0);
    setShowAdd(false);
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <h6 className="font-medium text-sm">Work types</h6>
        <PrimaryButton
          title="Add Category"
          onclick={() => setShowAdd(true)}
          className="text-white px-3 py-1.5 text-sm"
        />
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        Pick from Settings → Master. Existing Reels / Poster numbers stay on this project.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const itemKey = `${item.kind}-${item.key || item.otherIndex}-${item.name}`;
          const isEditing = editingItemKey === itemKey;

          return (
            <div
              key={itemKey}
              className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 pr-2 flex-1">
                  {isEditing ? (
                    <div className="w-full relative z-10 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <SearchableCategorySelect
                          options={categories} // Show all active categories for swapping
                          value={item.taskCategory}
                          onChange={(val) => {
                            const selectedCat = categories.find(c => categoryId(c) === val);
                            if (selectedCat) {
                              emit(swapCategoryInWorkDetails(workDetails, item, selectedCat));
                            }
                            setEditingItemKey(null);
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => setEditingItemKey(null)}
                        className="text-gray-400 hover:text-gray-600 px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h6 className="font-medium text-sm truncate">{item.name}</h6>
                      <button
                        onClick={() => setEditingItemKey(itemKey)}
                        className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="Change Category"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
                      </button>
                      {Number(item.extra) > 0 && (
                        <div className="shrink-0 flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          {isEditMode ? (
                            <>
                              <span className="text-[10px] font-semibold text-amber-700">Extra:</span>
                              <input
                                type="number"
                                value={item.extra || 0}
                                onChange={(e) =>
                                  emit(
                                    updateWorkItemField(
                                      workDetails,
                                      item,
                                      "extra",
                                      parseInt(e.target.value, 10) || 0,
                                      isEditMode
                                    )
                                  )
                                }
                                className="w-10 px-1 text-[10px] font-bold text-amber-900 border border-amber-200 rounded text-center focus:outline-none focus:border-amber-400"
                              />
                            </>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700">
                              +{item.extra} extra
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditMode && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Total:</span>
                        <input
                          name={`${item.kind}-${item.key || item.otherIndex}-total`}
                          type="number"
                          value={item.total || 0}
                          onChange={(e) =>
                            emit(
                              updateWorkItemField(
                                workDetails,
                                item,
                                "total",
                                parseInt(e.target.value, 10) || 0,
                                isEditMode
                              )
                            )
                          }
                          placeholder="Total"
                          className="w-20 px-2 py-1 border rounded border-gray-200 text-gray-600"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Balance:</span>
                      <input
                        name={`${item.kind}-${item.key || item.otherIndex}-count`}
                        type="number"
                        value={item.count || 0}
                        onChange={(e) =>
                          emit(
                            updateWorkItemField(
                              workDetails,
                              item,
                              "count",
                              parseInt(e.target.value, 10) || 0,
                              isEditMode
                            )
                          )
                        }
                        placeholder="Balance"
                        className="w-20 px-2 py-1 border rounded border-gray-200 text-gray-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => emit(removeWorkItem(workDetails, item))}
                      className="cursor-pointer text-red-500 p-1 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {extraOnlyItems.length > 0 && (
        <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/60">
          <h6 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
            Extra work this month
          </h6>
          <div className="flex flex-wrap gap-2">
            {extraOnlyItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1.5 bg-white border border-amber-200 px-2 py-1 rounded-lg"
              >
                <span className="text-[11px] font-semibold text-amber-800">
                  {item.name}:
                </span>
                {isEditMode ? (
                  <input
                    type="number"
                    value={item.extra || 0}
                    onChange={(e) =>
                      emit(
                        updateWorkItemField(
                          workDetails,
                          item,
                          "extra",
                          parseInt(e.target.value, 10) || 0,
                          isEditMode
                        )
                      )
                    }
                    className="w-12 px-1 text-[11px] font-bold text-amber-900 border border-amber-200 rounded text-center focus:outline-none focus:border-amber-400"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-amber-900">
                    +{item.extra}
                  </span>
                )}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() =>
                      emit(updateWorkItemField(workDetails, item, "extra", 0, isEditMode))
                    }
                    className="ml-1 text-amber-500 hover:text-amber-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h6 className="font-medium text-sm mb-3">Add from task categories</h6>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : availableCategories.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">
              {categories.length === 0
                ? "No task categories yet. Add them in Settings → Master first."
                : "All available categories are already on this project."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <SearchableCategorySelect
                options={availableCategories}
                value={selectedCategoryId}
                onChange={(val) => setSelectedCategoryId(val)}
              />
              <div className="flex gap-2">
                {isEditMode && (
                  <input
                    name="new-category-total"
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(parseInt(e.target.value, 10) || 0)}
                    placeholder="Total items"
                    className="px-2 py-1 border border-gray-200 rounded w-full"
                  />
                )}
                <input
                  name="new-category-count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
                  placeholder="Number of items"
                  className="px-2 py-1 border border-gray-200 rounded w-full"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <PrimaryButton
              title="Cancel"
              onclick={() => setShowAdd(false)}
              className="bg-gray-200 text-gray-800 px-3 py-1.5 text-sm"
            />
            <PrimaryButton
              title="Add"
              onclick={handleAdd}
              className="text-white px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryQuotaSection;
