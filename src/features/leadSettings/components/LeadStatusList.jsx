import LeadStatusCard from "./LeadStatusCard";

const LeadStatusList = ({
  statuses,
  onSetDefault,
  onEdit,
  onDelete,
  onAdd,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
            Lead Status Pipeline
          </h3>
          <p className="text-[11px] font-medium text-slate-500">
            Define the progression stages for your sales cycle.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-[12px] font-bold px-4 py-1.5 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          + Add Stage
        </button>
      </div>
      <div className="space-y-3">
        {statuses.map((status) => (
          <LeadStatusCard
            key={status._id || status.id}
            status={status}
            onSetDefault={onSetDefault}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default LeadStatusList;
