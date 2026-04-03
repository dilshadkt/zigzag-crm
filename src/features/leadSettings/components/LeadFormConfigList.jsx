import React, { useState, useMemo } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiZap,
  FiFileText,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import {
  useGetAllFormConfigs,
  useActivateFormConfig,
  useDeactivateFormConfig,
  useDeleteFormConfig,
  useCreateFormConfig,
} from "../../../api/hooks";
import { toast } from "react-hot-toast";
import { MANDATORY_FIELDS } from "../constants";

const LeadFormConfigList = ({ onEditForm }) => {
  const { data: configsData, isLoading, refetch } = useGetAllFormConfigs();
  const activateConfig = useActivateFormConfig();
  const deactivateConfig = useDeactivateFormConfig();
  const deleteConfig = useDeleteFormConfig();
  const createConfig = useCreateFormConfig();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  /**
   * Local optimistic state:
   * - null: no change being made
   * - string ID: this ID is becoming active
   * - { deactivate: true, id: string }: this ID is becoming inactive
   */
  const [optimisticState, setOptimisticState] = useState(null);

  const serverConfigs = configsData?.data || [];
  
  // Apply optimistic logic for instant UI response and ensuring ONLY ONE active badge
  const configs = useMemo(() => {
    if (!optimisticState) return serverConfigs;

    if (typeof optimisticState === "string") {
      // Activating specific ID -> everything else MUST be inactive
      return serverConfigs.map((c) => ({
        ...c,
        isActive: c._id === optimisticState
      }));
    }

    if (optimisticState.deactivate) {
      // Deactivating specific ID -> just turn it off
      return serverConfigs.map((c) => ({
        ...c,
        isActive: c._id === optimisticState.id ? false : c.isActive
      }));
    }

    return serverConfigs;
  }, [serverConfigs, optimisticState]);

  const handleActivate = async (configId, name) => {
    setOptimisticState(configId);
    try {
      await activateConfig.mutateAsync(configId);
      toast.success(`"${name}" is now the active form`);
    } catch (error) {
      toast.error("Failed to activate form");
    } finally {
      setOptimisticState(null);
    }
  };

  const handleDeactivate = async (configId, name) => {
    setOptimisticState({ deactivate: true, id: configId });
    try {
      await deactivateConfig.mutateAsync(configId);
      toast.success(`"${name}" is now inactive`);
    } catch (error) {
      toast.error("Failed to deactivate form");
    } finally {
      setOptimisticState(null);
    }
  };

  const handleDelete = async (configId, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    )
      return;
    try {
      await deleteConfig.mutateAsync(configId);
      toast.success("Form deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete form");
    }
  };

  const handleCreate = async () => {
    if (!newFormName.trim()) {
      toast.error("Form name is required");
      return;
    }
    try {
      const result = await createConfig.mutateAsync({
        name: newFormName.trim(),
        description: newFormDescription.trim(),
        fields: MANDATORY_FIELDS,
      });
      toast.success("Form created");
      setShowCreateModal(false);
      setNewFormName("");
      setNewFormDescription("");
      // Open the form builder for the newly created form
      if (result?.data?._id) {
        onEditForm(result.data._id);
      }
    } catch (error) {
      toast.error("Failed to create form");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white border border-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FiLayers size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
              Lead Forms
            </h3>
            <p className="text-[11px] font-medium text-slate-400">
              {configs.length} form{configs.length !== 1 ? "s" : ""} created •
              Only one form can be active at a time
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
        >
          <FiPlus size={14} />
          New Form
        </button>
      </div>

      {/* Empty State */}
      {configs.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <FiFileText size={24} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              No lead forms yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Create your first lead form to start capturing leads.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-[12px] font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <FiPlus size={14} />
            Create Lead Form
          </button>
        </div>
      )}

      {/* Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {configs.map((config) => (
          <FormCard
            key={config._id}
            config={config}
            onEdit={() => onEditForm(config._id)}
            onActivate={() => handleActivate(config._id, config.name)}
            onDeactivate={() => handleDeactivate(config._id, config.name)}
            onDelete={() => handleDelete(config._id, config.name)}
            isActivating={activateConfig.isPending || deactivateConfig.isPending}
          />
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Create New Lead Form
              </h3>
              <p className="text-xs text-slate-400">
                Give your form a name, then customize its fields.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1 block">
                  Form Name *
                </label>
                <input
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="e.g., Website Inquiry Form"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1 block">
                  Description (optional)
                </label>
                <textarea
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  placeholder="Brief description for this form"
                  className="w-full h-20 rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFormName("");
                  setNewFormDescription("");
                }}
                className="px-4 py-2 text-[12px] font-bold text-slate-500 rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createConfig.isPending || !newFormName.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-[12px] font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createConfig.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiPlus size={14} />
                )}
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual form card
const FormCard = ({ config, onEdit, onActivate, onDeactivate, onDelete, isActivating }) => {
  const fieldCount = config.fields?.length || 0;
  const requiredCount = config.fields?.filter((f) => f.required).length || 0;
  const updatedAt = config.updatedAt
    ? new Date(config.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const updatedBy = config.updatedBy
    ? `${config.updatedBy.firstName || ""} ${config.updatedBy.lastName || ""}`.trim()
    : "";

  return (
    <div
      className={`group relative bg-white rounded-2xl border p-4 transition-all hover:shadow-md ${
        config.isActive
          ? "border-blue-200 shadow-sm ring-1 ring-blue-100"
          : "border-slate-100 hover:border-slate-200"
      }`}
    >
      {/* Active badge */}
      {config.isActive && (
        <div className="absolute -top-2.5 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-md shadow-emerald-500/20">
            <FiZap size={10} />
            Active
          </span>
        </div>
      )}

      <div className="space-y-3">
        {/* Title & Description */}
        <div className="pr-8">
          <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">
            {config.name || "Untitled Form"}
          </h4>
          {config.description && (
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
              {config.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
          <span className="inline-flex items-center gap-1">
            <FiFileText size={11} />
            {fieldCount} field{fieldCount !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <FiCheck size={11} />
            {requiredCount} required
          </span>
          <span className="inline-flex items-center gap-1">
            <FiClock size={11} />
            {updatedAt}
          </span>
        </div>

        {/* Updated by */}
        {updatedBy && (
          <p className="text-[10px] text-slate-300 font-medium">
            Last edited by {updatedBy}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            <FiEdit3 size={12} />
            Edit
          </button>

          {config.isActive && (
            <button
              onClick={onDeactivate}
              disabled={isActivating}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-bold text-slate-400 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <FiZap size={14} className="fill-slate-400 opacity-50" />
              Deactivate
            </button>
          )}

          {!config.isActive && (
            <button
              onClick={onActivate}
              disabled={isActivating}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <FiZap size={12} />
              Set Active
            </button>
          )}

          {!config.isActive && (
            <button
              onClick={onDelete}
              disabled={isActivating}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-[11px] font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none"
            >
              <FiTrash2 size={12} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadFormConfigList;
