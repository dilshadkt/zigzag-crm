import React, { useState, useEffect } from "react";
import Modal from "../modal";
import { FiLink } from "react-icons/fi";

const WorkLinkModal = ({ isOpen, onClose, onSubmit, isLoading, initialValue = "" }) => {
    const [workLink, setWorkLink] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setWorkLink(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!workLink.trim()) return;
        onSubmit(workLink);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit Work Link">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                            <FiLink className="w-3.5 h-3.5" />
                        </span>
                        Google Drive / Work Link:
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        A work link is mandatory for this subtask. Please provide the link to your work before submitting for review.
                    </p>
                    <input
                        type="url"
                        autoFocus
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="https://drive.google.com/..."
                        value={workLink}
                        onChange={(e) => setWorkLink(e.target.value)}
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
                        disabled={!workLink.trim() || isLoading}
                        className={`px-6 h-10 rounded-xl text-sm font-medium transition-all duration-200 
              ${!workLink.trim() || isLoading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg active:scale-95"}`}
                    >
                        {isLoading ? "Updating..." : "Submit for Review"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default WorkLinkModal;
