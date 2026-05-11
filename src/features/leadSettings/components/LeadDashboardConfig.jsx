import React, { useState } from "react";
import { FiPlus, FiGrid, FiTrash2, FiEdit3 } from "react-icons/fi";
import { useGetDashboardConfig, useUpdateDashboardConfig } from "../../../api/hooks";
import AddWidgetModal from "./AddWidgetModal";
import { toast } from "react-hot-toast";

const LeadDashboardConfig = ({ fields, projectId }) => {
  const { data: configData, isLoading } = useGetDashboardConfig(projectId);
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
      await updateConfig.mutateAsync({ 
        widgets: updatedWidgets,
        projectId,
        isProjectWide: !!projectId 
      });
      toast.success(editingWidget ? "Widget updated" : "Widget added");
    } catch (error) {
      toast.error("Failed to update dashboard configuration");
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if (!window.confirm("Are you sure you want to remove this widget from your dashboard?")) return;

    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    try {
      await updateConfig.mutateAsync({ 
        widgets: updatedWidgets,
        projectId,
        isProjectWide: !!projectId
      });
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
      await updateConfig.mutateAsync({ 
        widgets: updatedWidgets,
        projectId,
        isProjectWide: !!projectId
      });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <FiGrid className="w-4 h-4 text-[#3f8cff]" />
            Dashboard Personalization
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Configure project-specific analytics widgets and scoring thresholds.</p>
        </div>
        <button
          onClick={handleAddWidget}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#3f8cff] text-white rounded-xl hover:bg-[#337ae6] transition-all font-bold text-[11px] shadow-lg shadow-blue-500/20 whitespace-nowrap"
        >
          <FiPlus className="w-3.5 h-3.5" />
          Create New Widget
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`bg-white p-3.5 rounded-2xl border transition-all hover:shadow-md ${widget.isActive ? "border-slate-100 " : "border-dashed border-slate-200 opacity-60 bg-slate-50/50"
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${widget.isActive ? "bg-blue-50 text-blue-500" : "bg-slate-100 text-slate-400"}`}>
                  <FiGrid className="w-3 h-3" />
                </div>
                <h4 className="font-bold text-[11px] text-slate-800 truncate">{widget.title}</h4>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleEditWidget(widget)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-500 rounded-lg transition-all"
                >
                  <FiEdit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteWidget(widget.id)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-md uppercase tracking-tight">
                  {widget.type}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={widget.isActive}
                  onChange={() => handleToggleActive(widget.id)}
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        ))}

        {widgets.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
            <FiGrid className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <h3 className="text-slate-800 font-bold text-xs">No project widgets</h3>
            <p className="text-slate-400 text-[10px] mt-1">Add custom charts to visualize this project's lead data.</p>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 text-orange-500 rounded-xl shadow-sm shadow-orange-100/50 flex-shrink-0">
            <FiGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[12px] font-bold text-slate-800 leading-tight">Hot Lead Threshold</h3>
            <p className="text-[10px] text-slate-500 font-medium">Automatic classification score.</p>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-6 bg-slate-50/50 p-3 rounded-xl border border-slate-50">
          <div className="flex-1 flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={config.hotLeadThreshold || 70}
              onChange={(e) => updateConfig.mutate({ 
                hotLeadThreshold: parseInt(e.target.value),
                projectId,
                isProjectWide: !!projectId
              })}
              className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3f8cff] hover:accent-orange-500 transition-colors"
            />
            <div className="w-10 h-10 bg-white border-2 border-slate-100 group-hover:border-orange-500 rounded-lg flex flex-col items-center justify-center shadow-sm">
              <span className="text-[11px] font-black text-[#3f8cff]">{config.hotLeadThreshold || 70}</span>
              <span className="text-[7px] font-bold text-slate-400 uppercase leading-none">Min</span>
            </div>
          </div>
          
          <div className="hidden lg:block border-l border-slate-200 pl-6">
            <p className="text-[10px] text-slate-400 font-medium leading-normal italic max-w-[140px]">
              Leads with score &ge; <span className="text-orange-500 font-bold">{config.hotLeadThreshold || 70}</span> will be marked as <span className="text-orange-500 font-bold">Hot</span>.
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
