import { FaWhatsapp } from "react-icons/fa";
import { FiPhone, FiMail, FiClipboard } from "react-icons/fi";

const LeadQuickActions = ({ onCall, onWhatsapp, onEmail, onNotes, phoneNumber }) => {
  const actions = [
    { 
      label: "Email", 
      icon: FiMail,
      onClick: () => {
        if (onEmail) onEmail();
      }
    },
    { 
      label: "WhatsApp", 
      icon: FaWhatsapp,
      onClick: () => {
        if (onWhatsapp) onWhatsapp();
        if (phoneNumber) {
          window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}`, "_blank");
        }
      }
    },
    { 
      label: "Call", 
      icon: FiPhone,
      onClick: () => {
        if (onCall) onCall();
        if (phoneNumber) {
          window.location.href = `tel:${phoneNumber}`;
        }
      }
    },
    { 
      label: "Notes", 
      icon: FiClipboard,
      onClick: () => {
        if (onNotes) onNotes();
      }
    },
  ];

  return (
    <div className="bg-white rounded-3xl flex items-center justify-around p-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#3f8cff] transition-all group"
          >
            <span className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
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
