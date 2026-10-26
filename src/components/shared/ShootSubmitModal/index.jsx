import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "../modal";
import { useShootCandidates } from "../../../api/hooks";
import { getShootCategory, isHttpLink } from "../../../utils/shootSession";

const MAX_EXTRA = 50;
const MAX_FIELDS = 10;
const emptyField = () => ({ label: "", type: "text", value: "", perTaskOn: false, perTask: {} });

// The fields the shoot category defines (e.g. "work link"), asked for every shot task
const categoryFieldRows = (category) =>
  (Array.isArray(category?.fields) ? category.fields : [])
    .filter((field) => field?.label)
    .map((field) => ({
      label: field.label,
      type: field.type === "url" ? "url" : "text",
      value: "",
      perTaskOn: true,
      perTask: {},
      fromCategory: true,
      required: Boolean(field.required),
    }));

const dueLabel = (task) => {
  const date = task?.dueDate ? new Date(task.dueDate) : null;
  if (!date || Number.isNaN(date.getTime())) return task?.taskMonth || "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const TaskRow = ({ task, checked, onToggle, disabled }) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 hover:bg-gray-50">
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onToggle(String(task._id))}
      disabled={disabled}
      className="h-4 w-4 rounded text-blue-600"
    />
    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
      {task.title}
    </span>
    <span className="shrink-0 text-xs text-gray-400">{dueLabel(task)}</span>
  </label>
);

/**
 * Shown when a shoot-session subtask is sent to review: the drive link, which
 * of the scheduled tasks were actually shot (points = category points x ticked
 * tasks), extra fields to write onto each shot task, and any extra reels to put
 * in the client's asset bank.
 */
const ShootSubmitModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  subtask,
  projectId,
  shootTaskId,
  workType = "reels",
}) => {
  const { data, isLoading: loadingTasks } = useShootCandidates(
    projectId,
    { workType, shootTaskId },
    { enabled: isOpen && !!shootTaskId }
  );
  const covered = useMemo(() => data?.covered || [], [data]);
  const available = useMemo(() => data?.available || [], [data]);

  const stored = subtask?.shootSubmission;
  const shootCategory = getShootCategory(subtask);
  // A category with its own fields collects the links through them; the plain
  // footage link is only asked for when it has none.
  const hasCategoryFields = categoryFieldRows(shootCategory).length > 0;
  const [link, setLink] = useState("");
  const [ticked, setTicked] = useState(() => new Set());
  const [fields, setFields] = useState([]);
  const [extraCount, setExtraCount] = useState(0);
  // One entry per extra shoot: { topic, values: { [field index]: value } }
  const [extraItems, setExtraItems] = useState([]);
  const [error, setError] = useState("");
  const initialized = useRef(false);

  // Start from the stored submission on a resubmit, else from what the shoot covers.
  // Done once per opening, so a background refetch never wipes what was typed.
  useEffect(() => {
    if (!isOpen) {
      initialized.current = false;
      return;
    }
    if (!data || initialized.current) return;
    initialized.current = true;

    const storedShot = (stored?.shotTasks || []).map((t) => String(t._id || t));
    const coveredIds = covered.map((t) => String(t._id));
    setTicked(new Set(storedShot.length ? storedShot : coveredIds));
    setLink(stored?.footageLink || "");
    setExtraCount(stored?.extraCount || 0);
    setExtraItems([]);
    const storedFields = (stored?.fields || []).map((field) => ({
      label: field.label || "",
      type: field.type || "text",
      value: field.value || "",
      perTask: field.perTask || {},
      perTaskOn: Object.keys(field.perTask || {}).length > 0,
    }));
    // Category fields always come first; anything extra a resubmit added follows
    const categoryRows = categoryFieldRows(shootCategory).map((row) => {
      const saved = storedFields.find(
        (field) => field.label.toLowerCase() === row.label.toLowerCase()
      );
      return saved ? { ...row, ...saved, perTaskOn: true } : row;
    });
    const categoryLabels = new Set(categoryRows.map((row) => row.label.toLowerCase()));
    setFields([
      ...categoryRows,
      ...storedFields.filter((field) => !categoryLabels.has(field.label.toLowerCase())),
    ]);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, data]);

  const toggle = (id) => {
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError("");
  };

  const updateField = (index, patch) => {
    setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)));
    setError("");
  };
  const setTaskValue = (index, taskId, value) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, perTask: { ...field.perTask, [taskId]: value } } : field
      )
    );
    setError("");
  };

  // Ticked tasks in list order, for the per-task inputs
  const tickedTasks = useMemo(
    () => [...covered, ...available].filter((task) => ticked.has(String(task._id))),
    [covered, available, ticked]
  );

  const categoryPoints = Number(subtask?.taskCategory?.points) || 0;
  const count = ticked.size;
  const multiplier = Math.max(1, count);

  const extraTotal = Math.max(0, Math.min(MAX_EXTRA, Math.floor(Number(extraCount) || 0)));
  const extraItem = (index) => extraItems[index] || { topic: "", values: {} };
  const updateExtra = (index, patch) => {
    setExtraItems((prev) => {
      const next = Array.from(
        { length: Math.max(prev.length, index + 1) },
        (_, i) => prev[i] || { topic: "", values: {} }
      );
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setError("");
  };
  const setExtraValue = (index, fieldIndex, value) =>
    updateExtra(index, { values: { ...extraItem(index).values, [fieldIndex]: value } });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasCategoryFields && !isHttpLink(link)) {
      setError("Enter the footage drive link (a full http/https link).");
      return;
    }
    if (link.trim() && !isHttpLink(link)) {
      setError("The footage drive link must be a full http/https link.");
      return;
    }
    if (covered.length > 0 && count === 0) {
      setError("Tick at least one task this shoot covered.");
      return;
    }

    const customFields = [];
    for (const field of fields) {
      const label = field.label.trim();
      if (!label) {
        setError("Every extra field needs a label (or remove the empty one).");
        return;
      }
      const perTask = {};
      if (field.perTaskOn) {
        tickedTasks.forEach((task) => {
          const text = String(field.perTask[String(task._id)] || "").trim();
          if (text) perTask[String(task._id)] = text;
        });
      }
      const value = field.perTaskOn ? "" : field.value.trim();
      if (!value && !Object.keys(perTask).length) {
        if (field.fromCategory && !field.required) continue;
        setError(
          field.fromCategory
            ? `Fill in "${label}" for every task you shot.`
            : `Fill in "${label}" or remove the field.`
        );
        return;
      }
      if (field.type === "url") {
        const bad = [value, ...Object.values(perTask)].find((text) => text && !isHttpLink(text));
        if (bad) {
          setError(`"${label}" must be a full http/https link.`);
          return;
        }
      }
      customFields.push({ label, type: field.type, value, perTask });
    }

    // Required category fields must be filled on every ticked task
    for (const field of fields) {
      if (!field.fromCategory || !field.required) continue;
      const missing = tickedTasks.find(
        (task) => !String(field.perTask[String(task._id)] || "").trim()
      );
      if (missing) {
        setError(`Fill in "${field.label}" for "${missing.title}".`);
        return;
      }
    }

    const extraPayload = Array.from({ length: extraTotal }, (_, index) => {
      const item = extraItem(index);
      return {
        topic: item.topic.trim(),
        fields: fields
          .map((field, fieldIndex) => ({
            label: field.label.trim(),
            type: field.type,
            value: String(item.values[fieldIndex] || "").trim(),
          }))
          .filter((field) => field.label && field.value),
      };
    });
    const badExtra = extraPayload
      .flatMap((item) => item.fields)
      .find((field) => field.type === "url" && !isHttpLink(field.value));
    if (badExtra) {
      setError(`"${badExtra.label}" must be a full http/https link.`);
      return;
    }

    const extras = Math.max(0, Math.min(MAX_EXTRA, Math.floor(Number(extraCount) || 0)));
    onSubmit({
      footageLink: link.trim(),
      shotTaskIds: [...ticked],
      customFields,
      extraCount: extras,
      extraItems: extraPayload,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit shoot for review" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {!hasCategoryFields && (
        <div className="space-y-1.5">
          <label className="block text-[13px] font-bold text-gray-700">
            Footage drive link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setError("");
            }}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
          <p className="text-[11px] text-gray-500">
            This link is added to every {workType} task you tick below.
          </p>
        </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-gray-700">
              Tasks you shot ({count})
            </label>
            {categoryPoints > 0 && (
              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                {categoryPoints} × {multiplier} = {categoryPoints * multiplier} pts
              </span>
            )}
          </div>
          {loadingTasks ? (
            <p className="text-xs text-gray-400">Loading scheduled tasks...</p>
          ) : (
            <>
              {covered.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Planned for this shoot
                  </p>
                  {covered.map((task) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      checked={ticked.has(String(task._id))}
                      onToggle={toggle}
                      disabled={isLoading}
                    />
                  ))}
                  <p className="text-[11px] text-gray-500">
                    Untick anything you did not shoot. It goes back to the schedule.
                  </p>
                </div>
              )}
              {available.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Other scheduled {workType} (tick to add to this shoot)
                  </p>
                  <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                    {available.map((task) => (
                      <TaskRow
                        key={task._id}
                        task={task}
                        checked={ticked.has(String(task._id))}
                        onToggle={toggle}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>
              )}
              {covered.length === 0 && available.length === 0 && (
                <p className="text-xs text-gray-500">
                  No scheduled {workType} tasks to attach. Only the footage link is needed.
                </p>
              )}
            </>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <label className="block text-[13px] font-bold text-gray-700">
                Additional fields
                <span className="ml-1 font-normal text-gray-400">(optional)</span>
              </label>
              <p className="text-[11px] text-gray-500">
                Shown on the details page of each task you ticked, e.g. Location, Clip link.
              </p>
            </div>
            <button
              type="button"
              disabled={fields.length >= MAX_FIELDS || isLoading}
              onClick={() => setFields((prev) => [...prev, emptyField()])}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
            >
              <FiPlus className="h-3 w-3" /> Add field
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-gray-100 bg-white p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                    Field label
                  </label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="e.g. Location"
                    maxLength={60}
                    readOnly={field.fromCategory}
                    className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 ${
                      field.fromCategory ? "bg-gray-50 text-gray-600" : ""
                    }`}
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value })}
                    disabled={field.fromCategory}
                    className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="text">Text</option>
                    <option value="url">Link</option>
                  </select>
                </div>
                {!field.fromCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setFields((prev) => prev.filter((_, i) => i !== index));
                      // Keep each extra's values lined up with the remaining fields
                      setExtraItems((prev) =>
                        prev.map((item) => {
                          const values = {};
                          Object.entries(item?.values || {}).forEach(([key, value]) => {
                            const at = Number(key);
                            if (at < index) values[at] = value;
                            else if (at > index) values[at - 1] = value;
                          });
                          return { ...item, values };
                        })
                      );
                    }}
                    className="mb-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="Remove field"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {!field.perTaskOn && (
                <input
                  type={field.type === "url" ? "url" : "text"}
                  value={field.value}
                  onChange={(e) => updateField(index, { value: e.target.value })}
                  placeholder={
                    field.type === "url" ? "https://... (same on every ticked task)" : "Same on every ticked task"
                  }
                  maxLength={500}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              )}

              <label
                className={`inline-flex items-center gap-2 ${field.fromCategory ? "" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={field.perTaskOn}
                  disabled={field.fromCategory}
                  onChange={(e) => updateField(index, { perTaskOn: e.target.checked })}
                  className="h-3.5 w-3.5 rounded text-blue-600"
                />
                <span className="text-[12px] font-medium text-gray-600">
                  Different value for each task
                </span>
                {field.fromCategory && field.required && (
                  <span className="text-[11px] font-semibold text-red-500">Required</span>
                )}
              </label>

              {field.perTaskOn && (
                <div className="space-y-1.5">
                  {tickedTasks.length === 0 ? (
                    <p className="text-[11px] text-gray-400">Tick tasks above first.</p>
                  ) : (
                    tickedTasks.map((task) => (
                      <div key={task._id} className="flex items-center gap-2">
                        <span className="w-2/5 shrink-0 truncate text-xs font-medium text-gray-700">
                          {task.title}
                        </span>
                        <input
                          type={field.type === "url" ? "url" : "text"}
                          value={field.perTask[String(task._id)] || ""}
                          onChange={(e) => setTaskValue(index, String(task._id), e.target.value)}
                          placeholder={field.type === "url" ? "https://..." : "Value"}
                          maxLength={500}
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                    ))
                  )}
                  <p className="text-[11px] text-gray-400">
                    A task left blank gets no value for this field.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
          <label className="block text-[13px] font-bold text-gray-700">
            Extra {workType} shot (add to the client&apos;s bank)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max={MAX_EXTRA}
              value={extraCount}
              onChange={(e) => setExtraCount(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">
              Footage beyond the tasks above. Usable later in any month.
            </span>
          </div>
          {extraTotal > 0 && (
            <div className="space-y-2 pt-1">
              {Array.from({ length: extraTotal }, (_, index) => {
                const item = extraItem(index);
                return (
                  <div key={index} className="space-y-2 rounded-lg border border-gray-100 bg-white p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Extra {workType} {index + 1}
                    </p>
                    <input
                      type="text"
                      value={item.topic}
                      onChange={(e) => updateExtra(index, { topic: e.target.value })}
                      placeholder="Topic (optional), e.g. Diwali offer"
                      maxLength={200}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                    />
                    {fields.map((field, fieldIndex) =>
                      field.label.trim() ? (
                        <div key={fieldIndex} className="flex items-center gap-2">
                          <span className="w-2/5 shrink-0 truncate text-xs font-medium text-gray-700">
                            {field.label}
                          </span>
                          <input
                            type={field.type === "url" ? "url" : "text"}
                            value={item.values[fieldIndex] || ""}
                            onChange={(e) => setExtraValue(index, fieldIndex, e.target.value)}
                            placeholder={field.type === "url" ? "https://..." : "Value"}
                            maxLength={500}
                            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                );
              })}
              <p className="text-[11px] text-gray-400">
                Each extra keeps its own values and carries them to the task made from it.
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || loadingTasks}
            className={`h-10 rounded-xl px-6 text-sm font-medium ${
              isLoading || loadingTasks
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit for review"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ShootSubmitModal;
