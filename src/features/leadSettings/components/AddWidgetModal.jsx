import React, { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";

const AddWidgetModal = ({ isOpen, onClose, onSave, fields, editingWidget = null }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("bar");
  const [field, setField] = useState("");

  useEffect(() => {
    if (editingWidget) {
      setTitle(editingWidget.title);
      setType(editingWidget.type);
      setField(editingWidget.field);
    } else {
      setTitle("");
      setType("bar");
      setField(fields[0]?.key || "");
    }
  }, [editingWidget, isOpen, fields]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !field) return;
    onSave({
      id: editingWidget?.id || `widget_${Date.now()}`,
      title,
      type,
      field,
      isActive: editingWidget ? editingWidget.isActive : true,
    });
    onClose();
  };

  const chartTypes = [
    { id: "bar", label: "Bar Chart", icon: "📊" },
    { id: "pie", label: "Pie Chart", icon: "🍕" },
    { id: "area", label: "Area Chart", icon: "📈" },
  ];

  // Filter fields that make sense for charts (select, checkbox, text with limited options)
  const chartableFields = [
    { key: "status", label: "Lead Status (System)" },
    { key: "source", label: "Source (System)" },
    { key: "owner", label: "Owner (System)" },
    ...fields.filter(f => ["select", "checkbox", "text"].includes(f.type))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {editingWidget ? "Edit Widget" : "Add Dashboard Widget"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <FiX className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Widget Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leads by Source"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Data Field</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              required
            >
              <option value="" disabled>Select a field</option>
              {chartableFields.map(f => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1 ml-1">This field will be used to group and count your leads.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Chart Type</label>
            <div className="grid grid-cols-3 gap-3">
              {chartTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    type === t.id
                      ? "bg-blue-50 border-blue-200 text-blue-600 ring-4 ring-blue-500/5"
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[10px] font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-bold text-white bg-[#3f8cff] rounded-2xl hover:bg-[#337ae6] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <FiCheck className="w-4 h-4" />
              {editingWidget ? "Update Widget" : "Create Widget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWidgetModal;
