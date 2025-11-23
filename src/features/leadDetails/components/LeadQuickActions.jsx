import { FiMail, FiMessageCircle, FiPhone, FiClipboard } from "react-icons/fi";

const actions = [
  { label: "Email", icon: FiMail },
  { label: "Message", icon: FiMessageCircle },
  { label: "Call", icon: FiPhone },
  { label: "Notes", icon: FiClipboard },
];

const LeadQuickActions = () => {
  return (
    <div className="bg-white rounded-3xl    flex items-center justify-around">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900"
          >
            <span className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Icon size={18} />
            </span>
            <span className="text-xs font-semibold">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LeadQuickActions;
