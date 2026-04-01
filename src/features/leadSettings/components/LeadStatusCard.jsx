import { FiStar, FiEdit2, FiTrash2 } from "react-icons/fi";

const LeadStatusCard = ({ status, onSetDefault, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between hover:border-slate-200 transition-all group/card">
      <div className="flex items-center gap-3">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-50 shadow-sm"
          style={{ backgroundColor: `${status.color}1A` }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-slate-800 leading-tight">{status.name}</p>
            {status.isDefault && (
              <span className="text-[9px] font-extrabold uppercase tracking-tight text-[#3f8cff] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                Primary
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-500 leading-tight">{status.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
        <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-tighter">Order: {status.order}</span>
        <div className="flex items-center gap-1">
          <button
            className={`p-1.5 rounded-lg border transition-all ${
              status.isDefault
                ? "text-blue-500 bg-blue-50 border-blue-200 shadow-sm"
                : "text-slate-300 border-transparent hover:text-blue-500 hover:bg-blue-50"
            }`}
            onClick={() => onSetDefault(status._id || status.id)}
            title="Set as Default Stage"
          >
            <FiStar size={16} />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
            onClick={() => onEdit(status)}
            title="Configure Stage"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            onClick={() => onDelete(status._id || status.id)}
            title="Remove Stage"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadStatusCard;

