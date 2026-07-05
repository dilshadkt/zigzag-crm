import React, { useState, useEffect } from "react";
import Modal from "../modal";
import PrimaryButton from "../buttons/primaryButton";
import VoiceRecorder from "../VoiceRecorder";
import { uploadSingleFile } from "../../../api/service";
import { FiMic, FiTrash2, FiPlay, FiSquare } from "react-icons/fi";
import { toast } from "react-hot-toast";

const ReworkReasonModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const [reason, setReason] = useState("");
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [voiceNoteUrl, setVoiceNoteUrl] = useState(null);
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef(null);

    useEffect(() => {
        if (isOpen) {
            setReason("");
            setVoiceNoteUrl(null);
            setShowVoiceRecorder(false);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim() && !voiceNoteUrl) return;
        onSubmit({ reason, voiceNoteUrl });
    };

    const handleVoiceUpload = async (file) => {
        if (!file) return;
        setIsUploadingVoice(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await uploadSingleFile(formData);
            if (response.success) {
                setVoiceNoteUrl(response.fileUrl || response.url);
                toast.success("Voice note attached");
            } else {
                toast.error("Failed to upload voice note");
            }
        } catch (error) {
            console.error("Voice upload error", error);
            toast.error("Failed to upload voice note");
        } finally {
            setIsUploadingVoice(false);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnded = () => setIsPlaying(false);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Reason for Rework">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please describe why this needs rework:
                        </label>
                        <textarea
                            autoFocus
                            required={!voiceNoteUrl}
                            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
                            placeholder="E.g., Missing assets, formatting issues, etc."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    
                    {/* Voice Note Section */}
                    <div>
                        {voiceNoteUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={togglePlay}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                        isPlaying ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
                                    }`}
                                >
                                    {isPlaying ? <FiSquare className="w-4 h-4 fill-current" /> : <FiPlay className="w-4 h-4 fill-current ml-1" />}
                                </button>
                                <div className="flex-1 text-sm font-medium text-blue-900">
                                    Voice Note Attached
                                    <audio 
                                        ref={audioRef}
                                        src={voiceNoteUrl}
                                        onEnded={handleAudioEnded}
                                        onPause={() => setIsPlaying(false)}
                                        onPlay={() => setIsPlaying(true)}
                                        className="hidden"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setVoiceNoteUrl(null)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowVoiceRecorder(true)}
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                                    <FiMic className="w-4 h-4" />
                                </div>
                                {isUploadingVoice ? "Uploading Voice Note..." : "Add Voice Note"}
                            </button>
                        )}
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
                            disabled={(!reason.trim() && !voiceNoteUrl) || isLoading || isUploadingVoice}
                            className={`px-6 h-10 rounded-xl text-sm font-medium transition-all duration-200 
                ${(!reason.trim() && !voiceNoteUrl) || isLoading || isUploadingVoice
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-[#3F8CFF] text-white hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95"}`}
                        >
                            {isLoading ? "Updating..." : "Confirm Rework"}
                        </button>
                    </div>
                </form>
            </Modal>
            
            <VoiceRecorder
                isOpen={showVoiceRecorder}
                onClose={() => setShowVoiceRecorder(false)}
                onUpload={handleVoiceUpload}
                isUploading={isUploadingVoice}
            />
        </>
    );
};

export default ReworkReasonModal;
