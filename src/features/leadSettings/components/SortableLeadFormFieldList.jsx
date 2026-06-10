import CustomSelect from "./CustomSelect";
import { FIELD_TYPES, RULE_OPERATORS, isMandatoryField } from "../constants";
import { FiPlus, FiTrash2, FiLock, FiMenu, FiGitBranch, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
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

// ─────────────────────────────────────────────
// Rule Builder — shown inside each field card
// ─────────────────────────────────────────────
const FieldRuleBuilder = ({ field, allFields, onUpdateField }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ fieldId: "", operator: "equals", value: "" });

  const rules = field.rules || [];
  const ruleCount = rules.length;

  // Fields that appear *before* this field — these can be watched
  const fieldIndex = allFields.findIndex((f) => f.id === field.id);
  const eligibleFields = allFields.slice(0, fieldIndex).filter((f) => !isMandatoryField(f));

  const watchedField = eligibleFields.find((f) => f.id === draft.fieldId);
  const needsValue = draft.operator === "equals" || draft.operator === "not_equals";

  const handleAddRule = () => {
    if (!draft.fieldId || !draft.operator) return;
    const newRule = {
      fieldId: draft.fieldId,
      operator: draft.operator,
      value: needsValue ? draft.value : "",
    };
    onUpdateField(field.id, { rules: [...rules, newRule] });
    setDraft({ fieldId: "", operator: "equals", value: "" });
  };

  const handleRemoveRule = (index) => {
    onUpdateField(field.id, { rules: rules.filter((_, i) => i !== index) });
  };

  const getFieldLabel = (fieldId) => {
    const f = allFields.find((x) => x.id === fieldId);
    return f?.label || fieldId;
  };

  const getOperatorLabel = (op) => {
    return RULE_OPERATORS.find((r) => r.value === op)?.label || op;
  };

  return (
    <div className="mt-2">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all
          ${ruleCount > 0
            ? "text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100"
            : "text-slate-400 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-600"
          }`}
      >
        <FiGitBranch size={11} />
        {ruleCount > 0 ? `${ruleCount} Condition${ruleCount > 1 ? "s" : ""}` : "Add Conditions"}
        {open ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="mt-2 rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white p-3 space-y-3">
          <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
            Show this field only when…
          </p>

          {/* Existing rules */}
          {rules.length === 0 && (
            <p className="text-[11px] text-slate-400 italic">
              No conditions yet — field always shows.
            </p>
          )}
          <div className="space-y-1.5">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center gap-2 flex-wrap bg-white border border-indigo-100 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm"
              >
                <span className="text-indigo-500 font-bold">{getFieldLabel(rule.fieldId)}</span>
                <span className="text-slate-400">{getOperatorLabel(rule.operator)}</span>
                {rule.value && (
                  <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                    {rule.value}
                  </span>
                )}
                {index < rules.length - 1 && (
                  <span className="text-[9px] font-extrabold text-amber-500 uppercase bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded ml-1">
                    OR
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveRule(index)}
                  className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* No eligible watch fields */}
          {eligibleFields.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">
              Add other fields above this one to use conditions.
            </p>
          ) : (
            /* Add rule row */
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {/* Watch field */}
                <CustomSelect
                  value={draft.fieldId}
                  onChange={(v) => setDraft((d) => ({ ...d, fieldId: v, value: "" }))}
                  options={[
                    { value: "", label: "Select a field to watch…" },
                    ...eligibleFields.map((f) => ({ value: f.id, label: f.label })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-2">
                  {/* Operator */}
                  <CustomSelect
                    value={draft.operator}
                    onChange={(v) => setDraft((d) => ({ ...d, operator: v, value: "" }))}
                    options={RULE_OPERATORS.map((op) => ({ value: op.value, label: op.label }))}
                  />

                  {/* Value — hidden for is_filled / is_empty */}
                  {needsValue ? (
                    watchedField?.type === "select" ? (
                      <CustomSelect
                        value={draft.value}
                        onChange={(v) => setDraft((d) => ({ ...d, value: v }))}
                        options={[
                          { value: "", label: "Select value…" },
                          ...(watchedField.options || []).map((opt) => ({
                            value: opt,
                            label: opt,
                          })),
                        ]}
                      />
                    ) : (
                      <input
                        className="h-9 rounded-xl border border-slate-200 px-3 text-[12px] font-medium focus:outline-none focus:border-indigo-400 bg-white"
                        placeholder="Value…"
                        value={draft.value}
                        onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
                      />
                    )
                  ) : (
                    <div className="h-9 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-300 italic">
                      no value needed
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddRule}
                disabled={!draft.fieldId}
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                <FiPlus size={12} />
                Add Condition
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sortable Field Item Component
// ─────────────────────────────────────────────
const SortableFieldItem = ({
  field,
  allFields,
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
      className={`space-y-2 border rounded-xl p-2.5 ${isMandatory ? "border-blue-100 bg-white shadow-sm" : "border-slate-100 bg-white"
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

          {/* Conditional Rule Builder — only for custom fields */}
          {!isMandatory && (
            <FieldRuleBuilder
              field={field}
              allFields={allFields}
              onUpdateField={onUpdateField}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const SortableLeadFormFieldList = ({
  fields,
  onUpdateField,
  onRemoveField,
  onFieldOptionChange,
  onReorderFields,
}) => {
  const [optionDrafts, setOptionDrafts] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
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
              allFields={fields}
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
