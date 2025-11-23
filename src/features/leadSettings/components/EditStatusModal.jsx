import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const COLOR_OPTIONS = [
  { label: "Slate", value: "#94a3b8" },
  { label: "Blue", value: "#3f8cff" },
  { label: "Green", value: "#10b981" },
  { label: "Yellow", value: "#f59e0b" },
  { label: "Red", value: "#ef4444" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Indigo", value: "#6366f1" },
];

const EditStatusModal = ({ isOpen, onClose, status, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#94a3b8",
    order: 0,
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (status && isOpen) {
      setFormData({
        name: status.name || "",
        description: status.description || "",
        color: status.color || "#94a3b8",
        order: status.order || 0,
        isDefault: status.isDefault || false,
      });
      setErrors({});
    }
  }, [status, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Status name is required";
    }
    if (formData.order < 0) {
      newErrors.order = "Order must be 0 or greater";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      order: Number(formData.order),
      isDefault: formData.isDefault,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Edit Status</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full h-11 rounded-2xl border px-3 text-sm focus:outline-none focus:border-[#3f8cff] ${
                errors.name ? "border-red-300" : "border-slate-200"
              }`}
              placeholder="Enter status name"
              disabled={isLoading}
            />
            {errors.name && (
              <span className="text-xs text-red-500 mt-1">{errors.name}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full h-24 rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#3f8cff] resize-none"
              placeholder="Enter status description"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleChange("color", color.value)}
                  className={`h-12 rounded-2xl border-2 transition-all ${
                    formData.color === color.value
                      ? "border-slate-900 scale-105"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  disabled={isLoading}
                  aria-label={color.label}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:border-[#3f8cff]"
                placeholder="#94a3b8"
                disabled={isLoading}
              />
              <div
                className="w-9 h-9 rounded-xl border border-slate-200"
                style={{ backgroundColor: formData.color }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => handleChange("order", e.target.value)}
                className={`w-full h-11 rounded-2xl border px-3 text-sm focus:outline-none focus:border-[#3f8cff] ${
                  errors.order ? "border-red-300" : "border-slate-200"
                }`}
                placeholder="0"
                min="0"
                disabled={isLoading}
              />
              {errors.order && (
                <span className="text-xs text-red-500 mt-1">{errors.order}</span>
              )}
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => handleChange("isDefault", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#3f8cff] focus:ring-[#3f8cff]"
                  disabled={isLoading}
                />
                <span className="text-sm font-semibold text-slate-700">
                  Set as Default
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-full bg-[#3f8cff] text-white text-sm font-semibold hover:bg-[#2f6bff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStatusModal;

