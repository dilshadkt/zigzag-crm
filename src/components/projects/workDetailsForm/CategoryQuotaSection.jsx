import React, { useMemo, useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useGetTaskCategories } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { FiEdit3, FiSearch, FiChevronDown, FiTrash2 } from "react-icons/fi";
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

const numberValue = (value) => (value === "" ? "" : value ?? 0);

const CountField = ({ label, name, value, onChange }) => (
  <label className="flex w-[92px] flex-col gap-1">
    <span className="text-[11px] font-medium text-gray-500">{label}</span>
    <input
      name={name}
      type="number"
      min="0"
      value={numberValue(value)}
      onChange={onChange}
      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-800 focus:border-blue-400 focus:outline-none"
    />
  </label>
);

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
      const standardKey = matchStandardWorkType(category);
      if (standardKey && usedKeys.has(standardKey)) return false;
      if (usedNames.has(String(category.name || "").trim().toLowerCase())) return false;
      if (usedIds.has(categoryId(category))) return false;
      return true;
    });
  }, [categories, items]);

  const extraOnlyItems = useMemo(() => {
    const quotaStandardKeys = new Set(
      items.filter((item) => item.kind === "standard").map((item) => item.key)
    );
    const quotaOtherNames = new Set(
      items
        .filter((item) => item.kind === "other")
        .map((item) => String(item.name || "").trim().toLowerCase())
    );
    return collectMonthlyExtraWork(workDetails).filter((item) =>
      item.kind === "standard"
        ? !quotaStandardKeys.has(item.key)
        : !quotaOtherNames.has(String(item.name || "").trim().toLowerCase())
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

  const setField = (item, field) => (event) => {
    emit(
      updateWorkItemField(
        workDetails,
        item,
        field,
        event.target.value === "" ? "" : parseInt(event.target.value, 10),
        isEditMode
      )
    );
  };

  return (
    <div className="mt-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h6 className="text-sm font-semibold text-gray-900">Work types</h6>
          <p className="text-[11px] text-gray-500">
            {isEditMode
              ? "Monthly total is the package. Remaining is what is still left this month."
              : "Add the work this project includes each month."}
          </p>
        </div>
        <PrimaryButton
          title="Add Category"
          onclick={() => setShowAdd((open) => !open)}
          className="text-white px-3 py-1.5 text-sm"
        />
      </div>

      {items.length === 0 && !showAdd && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-[#F8FAFC] px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No work types yet</p>
          <p className="mt-1 text-xs text-gray-500">
            Add a category from Settings → Master to set this month’s quota.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const itemKey = `${item.kind}-${item.key || item.otherIndex}-${item.name}`;
          const isEditing = editingItemKey === itemKey;
          const total = Number(item.total);
          const remaining = Number(item.count);
          const used =
            Number.isFinite(total) && Number.isFinite(remaining)
              ? Math.max(0, total - remaining)
              : null;

          return (
            <div
              key={itemKey}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3"
            >
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <SearchableCategorySelect
                      options={categories}
                      value={item.taskCategory}
                      onChange={(val) => {
                        const selectedCat = categories.find((c) => categoryId(c) === val);
                        if (selectedCat) {
                          emit(swapCategoryInWorkDetails(workDetails, item, selectedCat));
                        }
                        setEditingItemKey(null);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItemKey(null)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h6 className="text-sm font-semibold text-gray-900">{item.name}</h6>
                      <button
                        type="button"
                        onClick={() => setEditingItemKey(itemKey)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Change category"
                      >
                        <FiEdit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {isEditMode && used !== null && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {used} used this month
                        {Number(item.extra) > 0 ? ` · ${item.extra} extra` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    {isEditMode && (
                      <CountField
                        label="Monthly total"
                        name={`${item.kind}-${item.key || item.otherIndex}-total`}
                        value={item.total}
                        onChange={setField(item, "total")}
                      />
                    )}
                    <CountField
                      label={isEditMode ? "Remaining" : "Count"}
                      name={`${item.kind}-${item.key || item.otherIndex}-count`}
                      value={item.count}
                      onChange={setField(item, "count")}
                    />
                    {isEditMode && (
                      <CountField
                        label="Extra"
                        name={`${item.kind}-${item.key || item.otherIndex}-extra`}
                        value={item.extra}
                        onChange={setField(item, "extra")}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => emit(removeWorkItem(workDetails, item))}
                      className="mb-0.5 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Remove"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
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
                    value={item.extra === "" ? "" : item.extra ?? 0}
                    onChange={(e) =>
                      emit(
                        updateWorkItemField(
                          workDetails,
                          item,
                          "extra",
                          e.target.value === "" ? "" : parseInt(e.target.value, 10),
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
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <span className="mb-1 block text-[11px] font-medium text-gray-500">Category</span>
                <SearchableCategorySelect
                  options={availableCategories}
                  value={selectedCategoryId}
                  onChange={(val) => setSelectedCategoryId(val)}
                />
              </div>
              <div className="flex gap-2">
                {isEditMode && (
                  <CountField
                    label="Monthly total"
                    name="new-category-total"
                    value={total}
                    onChange={(e) => setTotal(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                  />
                )}
                <CountField
                  label={isEditMode ? "Remaining" : "Count"}
                  name="new-category-count"
                  value={count}
                  onChange={(e) => setCount(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
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
