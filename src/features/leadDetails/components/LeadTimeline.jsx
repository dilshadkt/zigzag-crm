const timelineColors = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
};

const LeadTimeline = ({ timeline }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h3>
      <div className="space-y-4">
        {timeline.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <span
              className={`w-2 h-2 rounded-full ${item.color || timelineColors.blue
                }`}
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {item.label}
              </p>
              <p className="text-xs text-slate-500">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadTimeline;

