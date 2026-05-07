import React, { useState, useRef } from "react";
import { FiClock, FiInstagram, FiImage, FiSend, FiCalendar, FiCheckCircle, FiInfo, FiTrash2, FiUploadCloud, FiExternalLink, FiBarChart2, FiMessageCircle, FiX, FiUsers, FiHeart, FiBookmark, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { schedulePost, uploadSocialMedia } from "../../api/social";
import { useGetScheduledPosts, useDeleteScheduledPost, useCompanyActiveProjects, useGetPostInsights, useGetPostComments, useReplyToComment } from "../../api/hooks";
import { format } from "date-fns";
import { FiLayout } from "react-icons/fi";

const InsightsModal = ({ post, onClose }) => {
    const { data: insights, isLoading } = useGetPostInsights(post?._id);

    if (!post) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all z-10">
                    <FiX className="w-5 h-5" />
                </button>

                <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                            <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Post Insights</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Instagram Analytics</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Fetching fresh data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-6 rounded-[32px] space-y-1 group hover:bg-rose-50 transition-all cursor-default">
                                <div className="flex items-center justify-between">
                                    <FiHeart className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Likes</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800">{insights?.likes || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[32px] space-y-1 group hover:bg-indigo-50 transition-all cursor-default">
                                <div className="flex items-center justify-between">
                                    <FiMessageCircle className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comments</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800">{insights?.comments || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[32px] space-y-1 group hover:bg-emerald-50 transition-all cursor-default">
                                <div className="flex items-center justify-between">
                                    <FiUsers className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reach</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800">{insights?.reach || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[32px] space-y-1 group hover:bg-amber-50 transition-all cursor-default">
                                <div className="flex items-center justify-between">
                                    <FiBarChart2 className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impressions</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800">{insights?.impressions || 0}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-indigo-600 p-6 rounded-[32px] text-white space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Engagement</span>
                            <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black">
                                +{(((insights?.likes || 0) + (insights?.comments || 0)) / (insights?.reach || 1) * 100).toFixed(1)}% Rate
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black">{(insights?.likes || 0) + (insights?.comments || 0)}</p>
                            <span className="text-xs font-bold mb-2 opacity-80 flex items-center gap-1">interactions <FiArrowRight /></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommentsDrawer = ({ post, onClose }) => {
    const { data: comments, isLoading } = useGetPostComments(post?._id);
    const { mutate: postReply, isLoading: isReplying } = useReplyToComment();
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    const handleReply = (e) => {
        e.preventDefault();
        const targetId = replyingTo ? replyingTo.id : post.platformMetadata.mediaId; // If not replying to specific comment, it's top level (but Meta needs comment ID for reply)
        
        if (!replyText.trim() || !replyingTo) return;

        postReply({ commentId: replyingTo.id, message: replyText }, {
            onSuccess: () => {
                toast.success("Reply posted!");
                setReplyText("");
                setReplyingTo(null);
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Failed to post reply");
            }
        });
    };

    if (!post) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-md bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 flex items-center justify-between border-b border-slate-50">
                <div>
                    <h3 className="text-xl font-black text-slate-800">Comments</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Live Feed</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all">
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : comments?.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                            <FiMessageCircle className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">No comments yet.</p>
                    </div>
                ) : (
                    comments?.map(comment => (
                        <div key={comment.id} className="space-y-3">
                            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 space-y-3 group hover:border-indigo-200 transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-800">@{comment.username}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(comment.timestamp), 'MMM dd')}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                                <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                                        <FiHeart className="w-3.5 h-3.5 fill-rose-400" /> {comment.like_count || 0}
                                    </div>
                                    <button 
                                        onClick={() => setReplyingTo(comment)}
                                        className={`text-[10px] font-black uppercase tracking-widest hover:underline ${replyingTo?.id === comment.id ? 'text-indigo-600' : 'text-slate-400'}`}
                                    >
                                        {replyingTo?.id === comment.id ? 'Replying...' : 'Reply'}
                                    </button>
                                </div>
                            </div>

                            {/* Render Replies */}
                            {comment.replies?.data?.length > 0 && (
                                <div className="ml-8 space-y-3 border-l-2 border-slate-100 pl-4">
                                    {comment.replies.data.map(reply => (
                                        <div key={reply.id} className="bg-slate-50/50 p-4 rounded-[20px] border border-slate-100/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-700">@{reply.username}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(reply.timestamp), 'MMM dd')}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">{reply.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 bg-white border-t border-slate-50 space-y-4">
                {replyingTo && (
                    <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 rounded-xl">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Replying to @{replyingTo.username}</span>
                        <button onClick={() => setReplyingTo(null)} className="text-indigo-600"><FiX className="w-3 h-3" /></button>
                    </div>
                )}
                <form onSubmit={handleReply} className={`bg-slate-50 rounded-2xl p-4 flex items-center gap-4 group transition-all border border-transparent ${isReplying ? 'opacity-70 pointer-events-none' : 'focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500'}`}>
                    <input 
                        type="text" 
                        placeholder={isReplying ? "Posting your reply..." : (replyingTo ? "Write your reply..." : "Select a comment to reply")}
                        readOnly={!replyingTo || isReplying}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-semibold disabled:opacity-50" 
                    />
                    <button 
                        type="submit"
                        disabled={!replyingTo || !replyText.trim() || isReplying}
                        className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:shadow-none"
                    >
                        {isReplying ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FiSend className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const SchedulePublish = () => {
    const [caption, setCaption] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    const [projectSearch, setProjectSearch] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeInsightsPost, setActiveInsightsPost] = useState(null);
    const [activeCommentsPost, setActiveCommentsPost] = useState(null);
    const fileInputRef = useRef(null);

    const { data: posts, isLoading: postsLoading, refetch } = useGetScheduledPosts();
    const { mutate: deletePost } = useDeleteScheduledPost();
    const { data: projects } = useCompanyActiveProjects();

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
                project: selectedProject || undefined
            });

            toast.success("Post scheduled successfully!");
            setCaption("");
            setMediaUrl("");
            setScheduledDate("");
            setScheduledTime("");
            setSelectedProject("");
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule post");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to cancel this scheduled post?")) {
            deletePost(id, {
                onSuccess: () => toast.success("Scheduled post cancelled"),
                onError: () => toast.error("Failed to cancel post")
            });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'SCHEDULED': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'PUBLISHING': 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse',
            'PUBLISHED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'FAILED': 'bg-rose-50 text-rose-600 border-rose-100',
        };
        return (
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${styles[status] || styles['SCHEDULED']}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#F4F9FD]/50 p-6 overflow-y-auto relative">
            <div className="max-w-4xl mx-auto w-full space-y-12">
                {/* Header Area */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Instagram Scheduler</h1>
                        <p className="text-slate-500 text-sm font-medium">Create and manage your social presence</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600">Sync Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Composer Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSchedule} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Content Media</label>
                                    <div className="flex gap-4">
                                        <div className="relative group flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                <FiImage className="w-5 h-5" />
                                            </div>
                                            <input 
                                                type="url" 
                                                placeholder="Paste a public image URL..."
                                                value={mediaUrl}
                                                onChange={(e) => setMediaUrl(e.target.value)}
                                                className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                                        >
                                            {isUploading ? (
                                                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <FiUploadCloud className="w-4 h-4" />
                                            )}
                                            {isUploading ? "Uploading" : "Upload"}
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Assign to Project (Optional)</label>
                                    <div className="relative group" id="project-selector">
                                        <div className="absolute left-4 top-[18px] w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10">
                                            <FiLayout className="w-5 h-5" />
                                        </div>
                                        
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                placeholder={selectedProject ? projects?.find(p => p._id === selectedProject)?.name : "Search & select a project..."}
                                                className="w-full pl-16 pr-10 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                                                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                                onChange={(e) => {
                                                    setProjectSearch(e.target.value);
                                                    setIsProjectDropdownOpen(true);
                                                }}
                                                value={projectSearch}
                                            />
                                            {isProjectDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden p-2 space-y-1">
                                                    {projects?.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 ? (
                                                        <div className="p-4 text-center text-xs text-slate-400 font-bold">No projects found</div>
                                                    ) : (
                                                        projects?.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase())).map(project => (
                                                            <div 
                                                                key={project._id}
                                                                onClick={() => {
                                                                    setSelectedProject(project._id);
                                                                    setProjectSearch("");
                                                                    setIsProjectDropdownOpen(false);
                                                                }}
                                                                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group/opt ${selectedProject === project._id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                                                            >
                                                                <span className="text-xs font-bold">{project.name}</span>
                                                                {selectedProject === project._id && <FiCheckCircle className="w-4 h-4" />}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Post Caption</label>
                                    <textarea 
                                        rows="4"
                                        placeholder="What's on your mind? #hashtags"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className="w-full p-6 bg-slate-50 border border-transparent rounded-3xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Publish Date</label>
                                        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Publish Time</label>
                                        <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-black shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Scheduling..." : "Schedule Publication"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-6 space-y-6">
                            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 max-w-[320px] mx-auto">
                                <div className="p-4 flex items-center gap-3 border-b border-slate-50">
                                    <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-[2px]">
                                        <div className="w-full h-full bg-white rounded-full p-[1px]">
                                            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-bold">IG</div>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-800">Preview Mode</span>
                                </div>
                                <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {mediaUrl ? (
                                        <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/600x600/f8fafc/cbd5e1?text=Media+Preview'} />
                                    ) : (
                                        <FiInstagram className="w-12 h-12 text-slate-200" />
                                    )}
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-4 text-slate-700">
                                        <FiInstagram className="w-5 h-5" />
                                        <FiSend className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-slate-800">1,234 likes</p>
                                        <p className="text-[11px] text-slate-600 line-clamp-3">
                                            <span className="font-black text-slate-800 mr-2">your_brand</span>
                                            {caption || "Your caption will appear here..."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden max-w-[320px] mx-auto">
                                <div className="relative z-10 space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Pro Tip</h4>
                                    <p className="text-xs font-medium leading-relaxed">
                                        Optimal Instagram image size is 1080x1080px. Make sure your account is linked in Social Settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduled Posts List */}
                <div className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-800">Queue & History</h2>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <FiClock /> {posts?.length || 0} Posts total
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pb-20">
                        {postsLoading ? (
                            <div className="bg-white p-12 rounded-[32px] flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : posts?.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">No posts scheduled yet.</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post._id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-indigo-200 transition-all">
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            {getStatusBadge(post.status)}
                                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                                <FiCalendar /> {format(new Date(post.scheduledAt), 'MMM dd, yyyy • HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600 truncate pr-4">
                                            {post.caption}
                                        </p>
                                        {post.project && (
                                            <div className="mt-2 flex items-center gap-1 text-indigo-500">
                                                <FiLayout className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{post.project.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 pr-2">
                                        {post.status === 'PUBLISHED' && (
                                            <>
                                                <button 
                                                    onClick={() => setActiveInsightsPost(post)}
                                                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                                    title="View Insights"
                                                >
                                                    <FiBarChart2 className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => setActiveCommentsPost(post)}
                                                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                    title="View Comments"
                                                >
                                                    <FiMessageCircle className="w-5 h-5" />
                                                </button>
                                                {post.platformMetadata?.mediaId && (
                                                    <a 
                                                        href={`https://www.instagram.com/p/${post.platformMetadata.mediaId}/`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                    >
                                                        <FiExternalLink className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </>
                                        )}
                                        {post.status === 'FAILED' && (
                                            <div className="group/err relative">
                                                <FiInfo className="text-rose-400 w-5 h-5 cursor-help" />
                                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 invisible group-hover/err:opacity-100 group-hover/err:visible transition-all z-50">
                                                    {post.platformMetadata?.error || "Unknown publishing error"}
                                                </div>
                                            </div>
                                        )}
                                        {(post.status === 'SCHEDULED' || post.status === 'FAILED') && (
                                            <button 
                                                onClick={() => handleDelete(post._id)}
                                                className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all"
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modals & Drawers */}
            {activeInsightsPost && (
                <InsightsModal 
                    post={activeInsightsPost} 
                    onClose={() => setActiveInsightsPost(null)} 
                />
            )}
            {activeCommentsPost && (
                <CommentsDrawer 
                    post={activeCommentsPost} 
                    onClose={() => setActiveCommentsPost(null)} 
                />
            )}
        </div>
    );
};

export default SchedulePublish;
