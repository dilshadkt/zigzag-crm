import React, { useState } from "react";
import { FiPlus, FiGrid, FiTrash2, FiEdit3 } from "react-icons/fi";
import { useGetDashboardConfig, useUpdateDashboardConfig } from "../../../api/hooks";
import AddWidgetModal from "./AddWidgetModal";
import { toast } from "react-hot-toast";

const LeadDashboardConfig = ({ fields }) => {
  const { data: configData, isLoading } = useGetDashboardConfig();
  const updateConfig = useUpdateDashboardConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  const config = configData?.data || { widgets: [] };
  const widgets = config.widgets || [];

  const handleAddWidget = () => {
    setEditingWidget(null);
    setIsModalOpen(true);
  };

  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
    setIsModalOpen(true);
  };

  const handleSaveWidget = async (widgetData) => {
    let updatedWidgets;
    if (editingWidget) {
      updatedWidgets = widgets.map(w => w.id === widgetData.id ? widgetData : w);
    } else {
      updatedWidgets = [...widgets, widgetData];
    }

    try {
      await updateConfig.mutateAsync({ widgets: updatedWidgets });
      toast.success(editingWidget ? "Widget updated" : "Widget added");
    } catch (error) {
      toast.error("Failed to update dashboard configuration");
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if (!window.confirm("Are you sure you want to remove this widget from your dashboard?")) return;

    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    try {
      await updateConfig.mutateAsync({ widgets: updatedWidgets });
      toast.success("Widget removed");
    } catch (error) {
      toast.error("Failed to remove widget");
    }
  };

  const handleToggleActive = async (widgetId) => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, isActive: !w.isActive } : w
    );
    try {
      await updateConfig.mutateAsync({ widgets: updatedWidgets });
    } catch (error) {
      toast.error("Failed to toggle widget");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3f8cff]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Custom Dashboard</h2>
          <p className="text-sm text-slate-500">Add or remove custom charts and graphs based on your lead data.</p>
        </div>
        <button
          onClick={handleAddWidget}
          className="flex items-center gap-2 px-4 py-2 bg-[#3f8cff] text-white rounded-xl hover:bg-[#337ae6] transition-all font-bold text-sm shadow-lg shadow-blue-500/20"
        >
          <FiPlus className="w-4 h-4" />
          Add Widget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`bg-white p-4 rounded-3xl border transition-all ${widget.isActive ? "border-slate-100 " : "border-dashed border-slate-200 opacity-60"
              }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${widget.isActive ? "bg-blue-50 text-blue-500" : "bg-slate-50 text-slate-400"}`}>
                  <FiGrid className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 truncate">{widget.title}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditWidget(widget)}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-500 rounded-lg transition-all"
                >
                  <FiEdit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteWidget(widget.id)}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-md uppercase">
                  {widget.type}
                </span>
                <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px]">
                  Field: {widget.field}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widget.isActive}
                  onChange={() => handleToggleActive(widget.id)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        ))}

        {widgets.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[32px] bg-white/50">
            <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
              <FiGrid className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">No custom widgets yet</h3>
            <p className="text-slate-400 text-sm max-w-[280px] mx-auto">Click "Add Widget" to create personalized charts for your lead data.</p>
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 max-w-xl">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
          <div className="p-2 bg-orange-50 text-orange-500 rounded-xl shadow-sm shadow-orange-100/50 flex-shrink-0">
            <FiGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">General Dashboard Settings</h3>
            <p className="text-[11px] text-slate-500 font-medium">Configure metrics and scoring thresholds.</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <label className="text-[12px] font-bold text-slate-700">Hot Lead Threshold Score</label>
            <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black rounded-md uppercase tracking-wider">Classification</span>
          </div>

          <div className="group bg-slate-50/40 p-4 rounded-2xl border border-slate-100 hover:border-orange-200/50 hover:bg-slate-50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={config.hotLeadThreshold || 70}
                onChange={(e) => updateConfig.mutate({ hotLeadThreshold: parseInt(e.target.value) })}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3f8cff] hover:accent-orange-500 transition-colors"
              />
              <div className="w-12 h-12 bg-white border-2 border-slate-100 group-hover:border-orange-500 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all duration-300">
                <span className="text-[12px] font-black text-[#3f8cff] leading-none">{config.hotLeadThreshold || 70}</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase leading-none mt-1 group-hover:text-orange-500 transition-colors">Score</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 px-1">
            <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 flex-shrink-0"></div>
            <p className="text-[10px] text-slate-400 font-medium leading-normal italic">
              Values &ge; <span className="text-orange-500 font-bold not-italic">{config.hotLeadThreshold || 70}</span> categorized as <span className="text-orange-500 font-bold not-italic">"Hot Leads"</span>.
            </p>
          </div>
        </div>
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWidget}
        fields={fields}
        editingWidget={editingWidget}
      />
    </div>
  );
};

export default LeadDashboardConfig;
