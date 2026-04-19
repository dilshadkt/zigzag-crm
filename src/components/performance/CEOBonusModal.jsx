import React, { useState } from "react";
import Modal from "../shared/modal";
import { Zap, Award, Info } from "lucide-react";
import { addBonusPoints } from "../../api/service";
import { toast } from "react-hot-toast";

const CEOBonusModal = ({ isOpen, onClose, employeeId, onBonusAdded }) => {
  const [points, setPoints] = useState(5);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for the bonus");
      return;
    }

    try {
      setLoading(true);
      const res = await addBonusPoints({
        userId: employeeId,
        points: Number(points),
        reason,
        periodType: "monthly"
      });

      if (res.success) {
        toast.success("Bonus points awarded successfully!");
        onBonusAdded && onBonusAdded();
        onClose();
      }
    } catch (err) {
      toast.error(err.message || "Failed to award bonus points");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Award CEO Bonus Points">
      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex gap-3">
          <Info className="w-5 h-5 text-purple-600 shrink-0" />
          <p className="text-xs text-purple-800 leading-relaxed">
            CEO Bonus points are special recognition for creativity and exceptional contribution. 
            Points are capped at **10 per month**.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex justify-between">
            Points to Award
            <span className="text-purple-600 font-black">{points} Pts</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
            <span>Minimum (1)</span>
            <span>Maximum (10)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Recognition Reason</label>
          <textarea 
            required
            placeholder="Why is this employee receiving this bonus? (e.g., Exceptional creativity on the ABC project)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-32 p-4 text-sm bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-purple-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : (
              <>
                <Award className="w-4 h-4" />
                Award Bonus
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CEOBonusModal;
