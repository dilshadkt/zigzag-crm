import React, { useState, useRef } from "react";
import { FiClock, FiCalendar, FiUploadCloud, FiInstagram, FiHeart, FiMessageCircle, FiSend, FiBookmark, FiMoreHorizontal } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { schedulePost, uploadSocialMedia } from "../../../api/social";

export const ScheduleTab = ({ currentProject }) => {
    const [caption, setCaption] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("media", file);

        try {
            const result = await uploadSocialMedia(formData);
            setMediaUrl(result.url);
            toast.success("Image uploaded successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!mediaUrl || !scheduledDate || !scheduledTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const scheduledAt = `${scheduledDate}T${scheduledTime}`;
            await schedulePost({
                mediaUrl,
                caption,
                scheduledAt,
                platform: 'INSTAGRAM',
                project: currentProject._id
            });

            toast.success("Post scheduled successfully!");
            setCaption("");
            setMediaUrl("");
            setScheduledDate("");
            setScheduledTime("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule post");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row gap-6 pb-6 lg:pb-0 pr-1 custom-scrollbar">
            {/* Form Section */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col shadow-sm w-full lg:max-w-xl shrink-0 lg:shrink">
                <div className="mb-4 sm:mb-5">
                    <h2 className="text-base font-black text-slate-800">Schedule Post</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">For {currentProject.name}</p>
                </div>

                <form onSubmit={handleSchedule} className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Media</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative h-40 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all group overflow-hidden"
                        >
                            {mediaUrl ? (
                                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        {isUploading ? (
                                            <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                        ) : (
                                            <FiUploadCloud className="w-4 h-4 text-indigo-500" />
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        {isUploading ? 'Uploading...' : 'Click to upload media'}
                                    </span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/jpeg,image/png,video/mp4"
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Caption</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write an engaging caption..."
                            className="w-full h-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                <FiCalendar className="w-2.5 h-2.5" /> Date
                            </label>
                            <input
                                type="date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                <FiClock className="w-2.5 h-2.5" /> Time
                            </label>
                            <input
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </form>

                <div className="pt-4 border-t border-slate-100 mt-4">
                    <button
                        onClick={handleSchedule}
                        disabled={isSubmitting || !mediaUrl || !scheduledDate || !scheduledTime}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Schedule Post</>
                        )}
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="w-full max-w-[340px] mx-auto lg:mx-0 shrink-0 bg-slate-50 rounded-3xl border-8 border-slate-800 p-2 flex flex-col shadow-2xl overflow-hidden relative">
                {/* Phone Top Bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10" />

                <div className="flex-1 bg-white rounded-2xl overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FiInstagram className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <span className="text-xs font-black text-slate-800">{currentProject.name}</span>
                        </div>
                        <FiMoreHorizontal className="text-slate-400" />
                    </div>

                    {/* Media Preview */}
                    <div className="w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                        {mediaUrl ? (
                            <img src={mediaUrl} alt="Post Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-slate-300 flex flex-col items-center gap-2">
                                <FiUploadCloud className="w-8 h-8" />
                                <span className="text-[10px] font-bold">Image Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-2 text-slate-800">
                            <div className="flex items-center gap-3">
                                <FiHeart className="w-5 h-5 hover:text-rose-500 transition-colors cursor-pointer" />
                                <FiMessageCircle className="w-5 h-5 hover:text-slate-500 transition-colors cursor-pointer" />
                                <FiSend className="w-5 h-5 hover:text-slate-500 transition-colors cursor-pointer" />
                            </div>
                            <FiBookmark className="w-5 h-5 hover:text-slate-500 transition-colors cursor-pointer" />
                        </div>

                        {/* Caption Preview */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-800">1,234 likes</p>
                            <p className="text-xs text-slate-800 line-clamp-3">
                                <span className="font-black mr-1">{currentProject.name}</span>
                                {caption || <span className="text-slate-400 italic">Your caption will appear here...</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleTab;
