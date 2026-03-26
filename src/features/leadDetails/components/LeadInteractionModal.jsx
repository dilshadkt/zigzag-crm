import { useState, useEffect } from "react";
import { FiX, FiSave } from "react-icons/fi";
import LeadStatusBadge from "../../leads/components/LeadStatusBadge";

const LeadInteractionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  lead, 
  statuses,
  interactionType 
}) => {
  const [note, setNote] = useState("");
  const [statusId, setStatusId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  
  useEffect(() => {
    if (lead?.status) {
      const currentStatusId = lead.status._id || lead.status.id || lead.status;
      setStatusId(currentStatusId);
    }
    if (isOpen) {
      setNote("");
      setScheduledDate("");
      setIsFollowUp(interactionType === 'followup');
    }
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ 
      note, 
      statusId, 
      scheduled: scheduledDate,
      isFollowUp 
    });
    onClose();
  };

  const getTitle = () => {
    if (interactionType === 'call') return "How was the call?";
    if (interactionType === 'whatsapp') return "WhatsApp Follow-up";
    if (interactionType === 'followup') return "Schedule Follow-up";
    return "Log Interaction";
  };

  const getPlaceholder = () => {
    if (interactionType === 'call') return "Add a note about the call...";
    if (interactionType === 'whatsapp') return "Add a note about your conversation...";
    if (interactionType === 'followup') return "Reason for follow-up...";
    return "Enter your note here...";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">{getTitle()}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 shadow-sm sm:shadow-none"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Add Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-[#3f8cff]/10 focus:border-[#3f8cff] outline-none transition-all resize-none h-32 text-slate-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Update Lead Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statuses.map((status) => (
                <button
                  key={status.id || status._id}
                  onClick={() => setStatusId(status.id || status._id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    statusId === (status.id || status._id)
                      ? "border-[#3f8cff] bg-blue-50/50 ring-2 ring-blue-100/50"
                      : "border-slate-50 hover:border-slate-200 bg-slate-50/30"
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: status.color }} 
                  />
                  <span className={`text-sm font-bold truncate ${
                    statusId === (status.id || status._id) ? "text-[#3f8cff]" : "text-slate-600"
                  }`}>
                    {status.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Follow-up Specific Fields */}
          {(interactionType === 'followup' || interactionType === 'call' || interactionType === 'whatsapp') && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">
                  Mark as Follow-up Lead?
                </label>
                <button
                  onClick={() => setIsFollowUp(!isFollowUp)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    isFollowUp ? 'bg-[#3f8cff]' : 'bg-slate-200'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    isFollowUp ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {isFollowUp && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Next Follow-up Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-[#3f8cff]/10 focus:border-[#3f8cff] outline-none transition-all text-slate-600 bg-slate-50/50"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 pb-10 sm:pb-6 pt-2 flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-5 rounded-2xl bg-[#3f8cff] text-white font-bold hover:bg-[#2f6bff] shadow-xl shadow-blue-200 transition-all active:scale-[0.97]"
          >
            <FiSave size={20} />
            Save Log
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-5 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all active:scale-[0.97]"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadInteractionModal;
