import CustomSelect from "./CustomSelect";
import { FIELD_TYPES, isMandatoryField } from "../constants";
import { FiPlus, FiTrash2, FiLock, FiMenu } from "react-icons/fi";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Field Item Component
const SortableFieldItem = ({
  field,
  onUpdateField,
  onRemoveField,
  onFieldOptionChange,
  optionDraft,
  onOptionDraftChange,
}) => {
  const isMandatory = isMandatoryField(field);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddOption = () => {
    const draft = optionDraft?.trim();
    if (!draft) return;
    onFieldOptionChange(field.id, [...(field.options || []), draft]);
    onOptionDraftChange(field.id, "");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`space-y-2 border rounded-xl p-2.5 ${isMandatory ? "border-blue-100 bg-blue-50/50" : "border-slate-100 bg-white"
        } ${isDragging ? "shadow-lg scale-[1.01]" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-2.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
          title="Drag to reorder"
        >
          <FiMenu size={16} />
        </button>

        <div className="flex-1 space-y-2">
          {isMandatory && (
            <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
              <FiLock size={10} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                System Requirement
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={field.label}
              onChange={(event) => {
                // Prevent changing label for mandatory fields to maintain consistency
                if (
                  !isMandatory ||
                  (field.key === "system_name" &&
                    event.target.value.toLowerCase().includes("name")) ||
                  (field.key === "system_email" &&
                    (event.target.value.toLowerCase().includes("email") ||
                      field.type === "email")) ||
                  (field.key === "system_phone" &&
                    (event.target.value.toLowerCase().includes("contact") ||
                      event.target.value.toLowerCase().includes("phone") ||
                      field.type === "tel"))
                ) {
                  onUpdateField(field.id, { label: event.target.value });
                }
              }}
              className="h-8.5 rounded-lg border border-slate-200 px-2.5 text-[12px] font-bold focus:outline-none focus:border-blue-500 transition-all bg-white"
            />
            <CustomSelect
              value={field.type}
              onChange={(value) => {
                // Prevent changing type for mandatory fields
                if (!isMandatory) {
                  onUpdateField(field.id, { type: value });
                } else if (
                  (field.key === "system_email" && value === "email") ||
                  (field.key === "system_phone" && value === "tel") ||
                  (field.key === "system_name" && value === "text")
                ) {
                  // Allow if it maintains the mandatory field type
                  onUpdateField(field.id, { type: value });
                }
              }}
              disabled={isMandatory}
              options={FIELD_TYPES.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
            />
            <input
              value={field.placeholder || ""}
              onChange={(event) =>
                onUpdateField(field.id, { placeholder: event.target.value })
              }
              placeholder="Hint text"
              className="h-8.5 rounded-lg border border-slate-200 px-2.5 text-[12px] font-medium focus:outline-none focus:border-blue-500 transition-all bg-white"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(event) => {
                  onUpdateField(field.id, {
                    required: event.target.checked,
                  });
                }}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5 pt-0.5">
                Required Field
                {isMandatory && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-blue-500 font-extrabold uppercase bg-blue-100/50 px-1.5 py-0.5 rounded">
                    <FiLock size={10} />
                    System
                  </span>
                )}
              </span>
            </label>
            <div className="flex items-center gap-1">
              <button
                className={`p-1.5 rounded-lg transition-all ${isMandatory
                  ? "text-slate-200 cursor-not-allowed"
                  : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                onClick={() => {
                  if (isMandatory) {
                    alert(
                      "This is a system field and cannot be deleted. However, you can uncheck 'Required' if you want to make it optional."
                    );
                    return;
                  }
                  if (
                    window.confirm(
                      `Are you sure you want to remove "${field.label}"?`
                    )
                  ) {
                    onRemoveField(field.id);
                  }
                }}
                disabled={isMandatory}
                title={
                  isMandatory
                    ? "System fields cannot be deleted"
                    : "Remove field"
                }
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>

          {field.type === "select" && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Dropdown Options
              </p>
              <div className="flex flex-wrap gap-2">
                {(field.options || []).map((option, index) => (
                  <span
                    key={`${option}-${index}`}
                    className="inline-flex items-center gap-2 bg-slate-100 text-xs font-semibold text-slate-700 px-3 py-1 rounded-full"
                  >
                    {option}
                    <button
                      onClick={() =>
                        onFieldOptionChange(
                          field.id,
                          field.options.filter((_, idx) => idx !== index)
                        )
                      }
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-10 rounded-2xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
                  placeholder="Add option"
                  value={optionDraft || ""}
                  onChange={(event) =>
                    onOptionDraftChange(field.id, event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <button
                  type="button"
                  className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center"
                  onClick={handleAddOption}
                >
                  <FiPlus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const SortableLeadFormFieldList = ({
  fields,
  onUpdateField,
  onRemoveField,
  onFieldOptionChange,
  onReorderFields,
}) => {
  const [optionDrafts, setOptionDrafts] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOptionDraftChange = (fieldId, value) => {
    setOptionDrafts((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      const reorderedFields = arrayMove(fields, oldIndex, newIndex);
      onReorderFields(reorderedFields);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {fields.map((field) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              onUpdateField={onUpdateField}
              onRemoveField={onRemoveField}
              onFieldOptionChange={onFieldOptionChange}
              optionDraft={optionDrafts[field.id]}
              onOptionDraftChange={handleOptionDraftChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableLeadFormFieldList;
