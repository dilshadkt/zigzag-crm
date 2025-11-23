import {
  FiMail,
  FiPhone,
  FiFileText,
  FiUserCheck,
  FiMessageSquare,
} from "react-icons/fi";

const iconMap = {
  email: FiMail,
  email_sent: FiMail,
  email_received: FiMail,
  call: FiPhone,
  call_made: FiPhone,
  call_received: FiPhone,
  attachment: FiFileText,
  attachment_uploaded: FiFileText,
  note: FiMessageSquare,
  note_added: FiMessageSquare,
  assignment: FiUserCheck,
  assigned: FiUserCheck,
  unassigned: FiUserCheck,
  created: FiUserCheck,
  updated: FiFileText,
  status_changed: FiUserCheck,
  meeting_scheduled: FiMessageSquare,
  meeting_completed: FiMessageSquare,
  converted: FiUserCheck,
};

const LeadActivityPanel = ({ activity }) => {
  // Ensure activity is an array
  const activities = Array.isArray(activity) ? activity : [];

  return (
    <div
      className="bg-white rounded-3xl border border-slate-200
    h-full overflow-y-auto  p-6 flex flex-col gap-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Activity</h3>
        <p className="text-sm text-slate-500">
          Recent touchpoints across the team.
        </p>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-4">
            No activity recorded yet.
          </div>
        ) : (
          activities.map((item, index) => {
            const Icon = iconMap[item.type] || FiMessageSquare;

            // Format date - handle both formatted date string and ISO date
            let formattedDate = item.date;
            if (!formattedDate && item.createdAt) {
              formattedDate = new Date(item.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });
            }

            // Get title - use title, description, or type as fallback
            const activityTitle =
              item.title || item.description || item.type || "Activity";

            return (
              <div
                key={`${item._id || item.title || index}-${index}`}
                className="flex gap-4"
              >
                <span className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon className="text-slate-500" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {activityTitle}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formattedDate || "Unknown date"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeadActivityPanel;
