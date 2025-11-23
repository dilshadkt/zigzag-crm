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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Lead Statuses
          </h3>
          <p className="text-sm text-slate-500">
            Manage lead statuses and their progression workflow.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-slate-800"
        >
          + Add Status
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
