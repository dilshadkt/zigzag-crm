import React, { useEffect, useState } from "react";
import Modal from "../shared/modal";
import { Pencil } from "lucide-react";

const EditLedgerEntryModal = ({ isOpen, entry, onClose, onSave, saving }) => {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen || !entry) return;
    setPoints(String(entry.points ?? ""));
    setReason(entry.reason || "");
  }, [isOpen, entry]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      points: Number(points),
      reason: reason.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit score">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">
          {entry.title}. This changes the points for this history row only.
        </p>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Points
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            required
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Use a negative number for a deduction.
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !reason.trim() || points === ""}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3F8CFF] hover:bg-[#3F8CFF]/90 text-white text-sm font-medium rounded-xl disabled:opacity-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save score"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditLedgerEntryModal;
