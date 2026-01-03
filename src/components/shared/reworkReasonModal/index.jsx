import React, { useState, useEffect } from "react";
import Modal from "../modal";
import PrimaryButton from "../buttons/primaryButton";

const ReworkReasonModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (isOpen) {
            setReason("");
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) return;
        onSubmit(reason);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reason for Rework">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please describe why this needs rework:
                    </label>
                    <textarea
                        autoFocus
                        required
                        className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
                        placeholder="E.g., Missing assets, formatting issues, etc."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!reason.trim() || isLoading}
                        className={`px-6 h-10 rounded-xl text-sm font-medium transition-all duration-200 
              ${!reason.trim() || isLoading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-[#3F8CFF] text-white hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95"}`}
                    >
                        {isLoading ? "Updating..." : "Confirm Rework"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReworkReasonModal;
