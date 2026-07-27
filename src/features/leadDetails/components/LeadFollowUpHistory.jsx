import React from "react";
import { format } from "date-fns";
import { FiMessageCircle, FiCalendar, FiCheckCircle } from "react-icons/fi";

const LeadFollowUpHistory = ({ activities, isLoading, followUpCount }) => {
  const followUpLogs = (activities || []).filter(
    (act) => act.type === "interaction_logged"
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Follow Up History</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            A timeline of interactions and follow-ups with this lead.
          </p>
        </div>
      </div>

      {followUpLogs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
          <FiMessageCircle className="w-12 h-12 mb-4 text-slate-300" />
          <p>No follow-up history available yet.</p>
        </div>
      ) : (
        <div className="relative pl-4 space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {/* Timeline Line */}
          <div className="absolute left-6 top-2 bottom-2 w-[2px] bg-indigo-100 rounded-full" />

          {followUpLogs.map((log) => {
            const meta = log.metadata || {};
            const performedBy = log.performedBy || {};
            
            return (
              <div key={log._id || log.id} className="relative z-10 flex gap-4">
                {/* Timeline Dot */}
                <div className="w-5 h-5 rounded-full bg-white border-4 border-indigo-500 shadow-sm mt-1 shrink-0" />
                
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                        {performedBy.firstName?.[0] || performedBy.name?.[0] || "?"}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {performedBy.firstName} {performedBy.lastName}
                      </span>
                      {meta.followUpNumber && (
                        <span className="text-[9px] font-bold bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full ml-1">
                          #{meta.followUpNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed mb-3">
                    {meta.note ? `"${meta.note}"` : <span className="text-slate-400 italic">No notes provided.</span>}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200">
                    {meta.oldStatus && meta.newStatus && meta.oldStatus !== meta.newStatus && (
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <FiCheckCircle className="text-emerald-500 w-2.5 h-2.5" />
                        <span className="text-slate-500">Status changed from</span>
                        <span className="font-semibold text-slate-700">{meta.oldStatus}</span>
                        <span className="text-slate-500">to</span>
                        <span className="font-semibold text-emerald-600">{meta.newStatus}</span>
                      </div>
                    )}
                    
                    {meta.nextFollowUp && (
                      <div className="flex items-center gap-1.5 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">
                        <FiCalendar className="w-2.5 h-2.5" />
                        <span className="font-semibold">Next Follow up:</span>
                        <span>{format(new Date(meta.nextFollowUp), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeadFollowUpHistory;
