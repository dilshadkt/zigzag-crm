import {
  FiUsers,
  FiDownload,
  FiUpload,
  FiSettings,
  FiShare2,
  FiX,
} from "react-icons/fi";

const MENU_ITEMS = [
  {
    label: "Visibilities: Collaborates",
    icon: FiUsers,
  },
  {
    label: "Download Template",
    icon: FiDownload,
  },
  {
    label: "Upload",
    icon: FiUpload,
  },
  {
    label: "Settings",
    icon: FiSettings,
  },
  {
    label: "Print, export, and share",
    icon: FiShare2,
  },
];

const LeadActionsMenu = ({ onClose, onUpload, onSettings, onDownloadTemplate }) => {
  return (
    <div className="bg-white w-72 rounded-3xl border border-slate-200 shadow-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900">Lead Menu</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Close lead menu"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-2 py-1 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                if (item.label === "Upload" && onUpload) {
                  onUpload();
                } else if (item.label === "Settings" && onSettings) {
                  onSettings();
                } else if (item.label === "Download Template" && onDownloadTemplate) {
                  onDownloadTemplate();
                } else {
                  onClose();
                  return;
                }
                onClose();
              }}
            >
              <span className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                <Icon />
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeadActionsMenu;
