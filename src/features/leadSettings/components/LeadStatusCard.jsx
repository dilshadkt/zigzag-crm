import { FiStar, FiEdit2, FiTrash2 } from "react-icons/fi";

const LeadStatusCard = ({ status, onSetDefault, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${status.color}1A` }}
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{status.name}</p>
            {status.isDefault && (
              <span className="text-xs font-semibold text-[#3f8cff] bg-[#e5edff] px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{status.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>Order: {status.order}</span>
        <button
          className={`p-2 rounded-full border ${
            status.isDefault
              ? "text-[#3f8cff] border-[#3f8cff]/30"
              : "text-slate-400 border-transparent hover:text-[#3f8cff]"
          }`}
          onClick={() => onSetDefault(status._id || status.id)}
          aria-label="Set default status"
        >
          <FiStar size={18} />
        </button>
        <button
          className="p-2 text-slate-400 hover:text-slate-900"
          onClick={() => onEdit(status)}
          aria-label="Edit status"
        >
          <FiEdit2 size={18} />
        </button>
        <button
          className="p-2 text-slate-400 hover:text-red-500"
          onClick={() => onDelete(status._id || status.id)}
          aria-label="Delete status"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default LeadStatusCard;

