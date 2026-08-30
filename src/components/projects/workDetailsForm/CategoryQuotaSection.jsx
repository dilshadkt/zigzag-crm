import React, { useMemo, useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { useGetTaskCategories } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import {
  addCategoryToWorkDetails,
  getSelectedWorkItems,
  matchStandardWorkType,
  removeWorkItem,
  updateWorkItemField,
} from "./workTypeMapping";

const categoryId = (value) => String(value?._id || value || "");

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
        isEditMode
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
        {items.map((item) => (
          <div
            key={`${item.kind}-${item.key || item.otherIndex}-${item.name}`}
            className="border p-3 rounded-lg border-gray-200 bg-white shadow-sm relative"
          >
            <div className="flex items-center justify-between">
              <h6 className="font-medium text-sm truncate pr-2">{item.name}</h6>
              <div className="flex items-center gap-2">
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
            </div>
          </div>
        ))}
      </div>

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
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="p-2 border border-gray-200 rounded bg-white text-sm"
              >
                <option value="">Select category</option>
                {availableCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                    {category.points > 0 ? ` (${category.points} pts)` : ""}
                  </option>
                ))}
              </select>
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
