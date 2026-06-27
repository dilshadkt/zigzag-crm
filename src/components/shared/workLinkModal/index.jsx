import React, { useState, useEffect } from "react";
import Modal from "../modal";
import { FiLink } from "react-icons/fi";

const WorkLinkModal = ({ isOpen, onClose, onSubmit, isLoading, initialValue = "", history = [] }) => {
    const [workLink, setWorkLink] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setWorkLink(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(workLink);
    };

    const handleRemove = () => {
        setWorkLink("");
        onSubmit("");
    };

    const isGoogleDrive = (url) => {
        return url?.includes("drive.google.com");
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Generate Google Drive embed URL for preview if possible
    const getDriveEmbedUrl = (url) => {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes('drive.google.com')) {
                // /file/d/FILE_ID/ pattern
                const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
                if (fileMatch) {
                    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
                }
                // /open?id=FILE_ID or /uc?id=FILE_ID
                const idParam = parsed.searchParams.get('id');
                if (idParam) {
                    return `https://drive.google.com/file/d/${idParam}/preview`;
                }
            }
        } catch (e) {
            // ignore malformed URLs
        }
        return null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit Work Link">
            <div className="space-y-6">
                {/* History Section */}
                {history && history.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <FiLink className="w-3 h-3" />
                            Previous Submissions ({history.length})
                        </h4>
                        <div className="space-y-3 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                            {[...history].reverse().map((entry, idx) => (
                                <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <a
                                                href={entry.link?.startsWith("http") ? entry.link : `https://${entry.link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-xs font-medium hover:underline truncate"
                                            >
                                                {entry.link}
                                            </a>
                                            {isGoogleDrive(entry.link) && (
                                                <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded w-fit">
                                                    GOOGLE DRIVE
                                                </span>
                                            )}
                                            {/* Embed preview if Google Drive link */}
                                            {(() => {
                                                const embedUrl = getDriveEmbedUrl(entry.link);
                                                return embedUrl ? (
                                                    <iframe
                                                        src={embedUrl}
                                                        width="100%"
                                                        height="200"
                                                        allow="autoplay"
                                                        className="border rounded mt-2"
                                                    />
                                                ) : null;
                                            })()}
                                        </div>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase font-bold">
                                            {entry.statusAtSubmission}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <div className="flex items-center gap-1">
                                            {entry.submittedBy?.profileImage && (
                                                <img
                                                    src={entry.submittedBy.profileImage}
                                                    alt=""
                                                    className="w-3 h-3 rounded-full"
                                                />
                                            )}
                                            <span>{entry.submittedBy?.firstName || "Unknown"}</span>
                                        </div>
                                        <span>{formatDate(entry.submittedAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 outline-none"
                            placeholder="https://drive.google.com/..."
                            value={workLink}
                            onChange={(e) => setWorkLink(e.target.value)}
                        />
                    </div>
                    <div className="flexBetween gap-3 mt-6">
                        <div>
                            {initialValue && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Remove Link
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-6 h-10 rounded-xl text-sm font-medium transition-all duration-200 
                ${isLoading
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg active:scale-95"}`}
                            >
                                {isLoading ? "Updating..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default WorkLinkModal;
