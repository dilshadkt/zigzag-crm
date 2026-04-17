import React, { useState, useEffect } from "react";
import { X, Calendar, Tag, AlignLeft, RefreshCw } from "lucide-react";

const TYPES = [
  { value: "national", label: "National", description: "Public holiday for all citizens" },
  { value: "regional", label: "Regional", description: "State / region-level holiday" },
  { value: "company", label: "Company", description: "Internal company holiday" },
  { value: "optional", label: "Optional", description: "Employees may choose this day off" },
];

const HolidayModal = ({ isOpen, onClose, holiday, onSave, isSaving }) => {
  const isEdit = !!holiday;

  const [form, setForm] = useState({
    name: "",
    date: "",
    description: "",
    type: "company",
    isRecurring: false,
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (holiday) {
      const d = new Date(holiday.date);
      // Format as YYYY-MM-DD for the date input (UTC safe)
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      setForm({
        name: holiday.name || "",
        date: `${yyyy}-${mm}-${dd}`,
        description: holiday.description || "",
        type: holiday.type || "company",
        isRecurring: holiday.isRecurring || false,
      });
    } else {
      setForm({
        name: "",
        date: "",
        description: "",
        type: "company",
        isRecurring: false,
      });
    }
    setErrors({});
  }, [holiday, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Holiday name is required";
    if (!form.date) e.date = "Date is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-800">
                {isEdit ? "Edit Holiday" : "Add Holiday"}
              </h2>
              <p className="text-[11px] text-gray-400">
                {isEdit ? "Update this holiday entry" : "Mark a day the company will be closed"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-bold text-gray-600 mb-1.5">
              Holiday Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Christmas Day"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-[13px] text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all placeholder:text-gray-300 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-300"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-[12px] font-bold text-gray-600 mb-1.5">
              Date <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-[13px] text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.date
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-300"
                }`}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-[11px] text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-[12px] font-bold text-gray-600 mb-1.5">
              Holiday Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, type: t.value }))
                  }
                  className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all ${
                    form.type === t.value
                      ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-200"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`text-[12px] font-bold ${
                      form.type === t.value ? "text-indigo-700" : "text-gray-700"
                    }`}
                  >
                    {t.label}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    {t.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-bold text-gray-600 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={2}
                placeholder="Brief note about this holiday…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all placeholder:text-gray-300 resize-none"
              />
            </div>
          </div>

          {/* Recurring toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isRecurring: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors duration-200 ${
                  form.isRecurring ? "bg-indigo-500" : "bg-gray-200"
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.isRecurring ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <div>
              <span className="text-[12px] font-bold text-gray-700 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-gray-400" />
                Repeats every year
              </span>
              <p className="text-[10px] text-gray-400">
                Mark this as a recurring annual holiday
              </p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Update Holiday"
              ) : (
                "Add Holiday"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayModal;
