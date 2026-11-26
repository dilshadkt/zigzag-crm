import React, { Suspense, lazy, useId } from "react";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import ImageField from "./ImageField";
import { newItem } from "../formValues";
import { Spinner, btnGhost, btnSmall, inputCls, selectCls } from "../../accounts/components/ui";

// The editor is large, so it loads only when a section needs it
const RichTextField = lazy(() => import("./RichTextField"));

const isDay = (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value);

const Control = ({ field, value, onChange, disabled, siteId, suggestions, id }) => {
  const common = {
    id,
    disabled,
    value: value ?? "",
    onChange: (e) => onChange(e.target.value),
    className: inputCls,
  };

  switch (field.type) {
    case "textarea":
      return <textarea {...common} rows={4} />;
    case "richtext":
      return (
        <Suspense fallback={<Spinner label="Loading editor" />}>
          <RichTextField siteId={siteId} value={value} onChange={onChange} disabled={disabled} />
        </Suspense>
      );
    case "image":
      return <ImageField siteId={siteId} value={value} onChange={onChange} disabled={disabled} label={field.label} />;
    case "select":
      return (
        <select {...common} className={selectCls}>
          {!value && <option value="">Choose…</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "combo":
      return (
        <>
          <input {...common} list={`${id}-list`} autoComplete="off" />
          <datalist id={`${id}-list`}>
            {(suggestions?.[field.key] || []).map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </>
      );
    case "boolean":
      return (
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 accent-[#3F8CFF]"
        />
      );
    case "number":
      return <input {...common} type="number" step="any" min="0" />;
    case "date":
      // An older date written in another form is shown as text, not lost
      return <input {...common} type={isDay(value) ? "date" : "text"} />;
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={`${field.label} picker`}
            disabled={disabled}
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#dfd7d7"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-slate-200 bg-white p-1 cursor-pointer shrink-0"
          />
          <input {...common} />
        </div>
      );
    case "keywords":
      return <input {...common} value={Array.isArray(value) ? value.join(", ") : value ?? ""} />;
    case "slug":
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-slate-400">/</span>
          <input {...common} spellCheck={false} />
        </div>
      );
    default:
      return <input {...common} type="text" />;
  }
};

const Labelled = ({ field, children, htmlFor }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600 mb-1">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </label>
    {children}
    {field.hint && <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>}
  </div>
);

/** A list of repeated blocks, such as page sections or course modules. */
export const Repeater = ({ field, value, onChange, disabled, siteId }) => {
  const items = value || [];
  const name = field.itemLabel || field.label;
  const update = (index, next) => onChange(items.map((item, i) => (i === index ? next : item)));
  const move = (index, step) => {
    const next = [...items];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item._key} className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-700 truncate">
              {name} {index + 1}
              {item[field.titleKey] && <span className="font-medium text-slate-400"> · {item[field.titleKey]}</span>}
            </p>
            {!disabled && (
              <div className="flex gap-1 shrink-0">
                <button type="button" className={btnSmall} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move ${name} ${index + 1} up`}>
                  <FiArrowUp />
                </button>
                <button type="button" className={btnSmall} disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${name} ${index + 1} down`}>
                  <FiArrowDown />
                </button>
                <button type="button" className={btnSmall} onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Remove ${name} ${index + 1}`}>
                  <FiTrash2 />
                </button>
              </div>
            )}
          </div>
          <div className="p-3 space-y-4">
            {field.fields.map((sub) => (
              <FieldRenderer
                key={sub.key}
                field={sub}
                value={item[sub.key]}
                onChange={(v) => update(index, { ...item, [sub.key]: v })}
                disabled={disabled}
                siteId={siteId}
              />
            ))}
          </div>
        </div>
      ))}
      {!items.length && <p className="text-xs text-slate-400">Nothing added yet.</p>}
      {!disabled && (
        <button type="button" className={btnGhost} onClick={() => onChange([...items, newItem(field.fields)])}>
          <FiPlus /> Add {name.toLowerCase()}
        </button>
      )}
    </div>
  );
};

const FieldRenderer = (props) => {
  const id = useId();
  const { field } = props;
  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-3">
        <Control {...props} id={id} />
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {field.label}
        </label>
      </div>
    );
  }
  return (
    <Labelled field={field} htmlFor={["image", "richtext"].includes(field.type) ? undefined : id}>
      <Control {...props} id={id} />
    </Labelled>
  );
};

export default FieldRenderer;
