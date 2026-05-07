import React, { useState } from "react";
import { FiClock, FiInstagram, FiImage, FiBarChart2, FiMessageCircle, FiHeart, FiX, FiUsers, FiTrash2, FiSend, FiBookmark, FiMapPin, FiPieChart, FiActivity, FiMousePointer, FiPhone, FiMail, FiMap, FiAtSign, FiExternalLink, FiSearch, FiHash } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useGetScheduledPosts, useDeleteScheduledPost, useGetPostInsights, useGetPostComments, useReplyToComment, useLikeComment, useGetAudienceDemographics, useGetProfileInteractions, useGetActiveStories, useGetMentionsAndTags, useSearchHashtag } from "../../../api/hooks";
import { format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";

const PostDetailsModal = ({ post, currentProject, onClose }) => {
    const { data: insights, isLoading: isInsightsLoading } = useGetPostInsights(post?._id);
    const { data: comments, isLoading: isCommentsLoading } = useGetPostComments(post?._id);
    const { mutate: postReply, isLoading: isReplying } = useReplyToComment();
    const { mutate: likeComment } = useLikeComment();
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    const handleReply = (e) => {
        e.preventDefault();
        const isTopLevel = !replyingTo;
        const targetId = replyingTo ? replyingTo.id : post.platformMetadata?.mediaId;

        if (!replyText.trim() || !targetId) return;

        postReply({ commentId: targetId, message: replyText, isTopLevel }, {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors z-20">
                <FiX className="w-8 h-8 stroke-[1.5]" />
            </button>

            <div className="bg-white w-full max-w-6xl h-[90vh] max-h-[850px] rounded-r-md flex overflow-hidden relative animate-in zoom-in-95 duration-200">

                {/* Left Side: Full Media */}
                <div className="w-[60%] bg-black flex items-center justify-center relative">
                    <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-contain" />
                </div>

                {/* Right Side: Header, Comments, Actions */}
                <div className="w-[40%] flex flex-col bg-white border-l border-slate-200">

                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full p-[2px]">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                <FiInstagram className="w-4 h-4 text-slate-800" />
                            </div>
                        </div>
                        <span className="font-bold text-sm text-slate-900">{currentProject.name}</span>
                    </div>

                    {/* Comments & Caption List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar">
                        {/* Caption (styled like a comment) */}
                        {post.caption && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-full shrink-0 flex items-center justify-center">
                                    <FiInstagram className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-900">
                                        <span className="font-bold mr-2">{currentProject.name}</span>
                                        {post.caption}
                                    </p>
                                    <div className="text-xs text-slate-500 mt-2">
                                        {format(new Date(post.scheduledAt), "w 'w'")}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isCommentsLoading ? (
                            <div className="py-10 flex justify-center">
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                            </div>
                        ) : comments?.map(comment => (
                            <div key={comment.id} className="group flex gap-3">
                                <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0 flex items-center justify-center text-slate-600 font-bold text-xs">
                                    {comment.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-900">
                                        <span className="font-bold mr-2">{comment.username}</span>
                                        {comment.text}
                                    </p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {format(new Date(comment.timestamp), "MMM d")}
                                        </span>
                                        <button
                                            onClick={() => setReplyingTo({ id: comment.id, username: comment.username })}
                                            className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                                        >
                                            Reply
                                        </button>
                                        <button
                                            onClick={() => likeComment(comment.id)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors ml-auto group-hover:opacity-100 opacity-0"
                                        >
                                            <FiHeart className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Replies */}
                                    {comment.replies?.data?.map(reply => (
                                        <div key={reply.id} className="flex gap-3 mt-4 relative">
                                            <div className="w-6 h-6 bg-slate-100 rounded-full shrink-0 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                                {reply.username?.charAt(0).toUpperCase() || 'R'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[11px] text-slate-800">
                                                    <span className="font-black mr-2">{reply.username || 'Replied'}</span>
                                                    <span className="font-medium text-slate-600">{reply.text}</span>
                                                </p>
                                                <button
                                                    onClick={() => likeComment(reply.id)}
                                                    className="absolute right-0 top-0 text-slate-300 hover:text-rose-500 transition-colors group-hover:opacity-100 opacity-0"
                                                >
                                                    <FiHeart className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Bar (Footer) */}
                    <div className="border-t border-slate-200 flex flex-col">
                        <div className="px-4 pt-3 pb-2">
                            {/* Icons Row */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4 text-slate-900">
                                    <FiHeart className="w-6 h-6 stroke-[1.5] cursor-pointer hover:text-slate-500 transition-colors" />
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-500 transition-colors">
                                        <FiMessageCircle className="w-6 h-6 stroke-[1.5]" />
                                        {insights?.comments > 0 && (
                                            <span className="text-sm font-bold">{insights.comments}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-500 transition-colors">
                                        <FiSend className="w-6 h-6 stroke-[1.5]" />
                                        {insights?.shares > 0 && (
                                            <span className="text-sm font-bold">{insights.shares}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-900 cursor-pointer hover:text-slate-500 transition-colors">
                                    {insights?.saved > 0 && (
                                        <span className="text-sm font-bold">{insights.saved}</span>
                                    )}
                                    <FiBookmark className="w-6 h-6 stroke-[1.5]" />
                                </div>
                            </div>

                            {/* Likes & Stats */}
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900">
                                    {isInsightsLoading ? "..." : (insights?.likes || 0)} likes
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                                    <span>{insights?.reach || 0} Reach</span>
                                    <span>•</span>
                                    <span>{insights?.impressions || 0} Impressions</span>
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-1">
                                    {format(new Date(post.scheduledAt), "d MMMM")}
                                </p>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="px-4 py-3 border-t border-slate-200">
                            {replyingTo && (
                                <div className="mb-2 flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded text-xs">
                                    <span className="text-slate-600">Replying to <span className="font-bold">@{replyingTo.username}</span></span>
                                    <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-800"><FiX className="w-3 h-3" /></button>
                                </div>
                            )}
                            <form onSubmit={handleReply} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
                                    disabled={isReplying}
                                    className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-slate-500 text-slate-900 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim() || isReplying}
                                    className="text-sm font-bold text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:text-blue-300 flex items-center justify-center min-w-[36px] h-6"
                                >
                                    {isReplying ? (
                                        <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                    ) : (
                                        "Post"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AudienceDashboard = ({ currentProject }) => {
    const { data, isLoading } = useGetAudienceDemographics(currentProject?.instagramBusinessId);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data?.insights || data.insights.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <FiUsers className="w-5 h-5 opacity-50" />
                </div>
                <p className="text-xs font-bold text-center">
                    Audience Demographics Unavailable<br />
                    <span className="text-[10px] font-normal">Meta requires at least 100 followers to display this data.</span>
                </p>
            </div>
        );
    }

    // Parse Data safely based on new Meta v22.0 structure
    const getMetricNode = (name) => data.insights.find(m => m.name === name || m.customName === name);

    // 1. Parse Gender/Age
    const genderAgeNode = getMetricNode('audience_gender_age');
    let chartData = [];
    if (genderAgeNode?.total_value?.breakdowns?.[0]?.results) {
        const results = genderAgeNode.total_value.breakdowns[0].results;
        const ageGroups = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
        chartData = ageGroups.map(age => {
            const femaleVal = results.find(r => r.dimension_values[0] === age && r.dimension_values[1] === 'F')?.value || 0;
            const maleVal = results.find(r => r.dimension_values[0] === age && r.dimension_values[1] === 'M')?.value || 0;
            return { age, Female: femaleVal, Male: maleVal };
        }).filter(d => d.Female > 0 || d.Male > 0);
    }

    // 2. Parse Top Cities
    const cityNode = getMetricNode('audience_city');
    let topCities = [];
    if (cityNode?.total_value?.breakdowns?.[0]?.results) {
        const results = cityNode.total_value.breakdowns[0].results;
        topCities = results
            .map(r => [r.dimension_values[0], r.value])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    // 3. Online Followers
    const onlineNode = getMetricNode('online_followers');
    let onlineChartData = [];
    const lastValidOnlineData = onlineNode?.values?.find(v => v.value && Object.keys(v.value).length > 0)?.value;
    
    if (lastValidOnlineData) {
        onlineChartData = Object.entries(lastValidOnlineData).map(([hour, count]) => ({
            hour: `${hour}:00`,
            active: count
        }));
    }

    return (
        <div className="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar pb-6">
            {/* Header Stat */}
            <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <img src={data?.profile?.profile_picture_url || ""} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="Profile" />
                <div>
                    <h3 className="text-lg font-black text-slate-900">{data?.profile?.followers_count?.toLocaleString() || 0} Followers</h3>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Current Audience Size</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Age & Gender Chart */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <FiPieChart className="text-indigo-500" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Age & Gender</h4>
                    </div>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                <Bar dataKey="Female" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Male" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Locations */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <FiMapPin className="text-indigo-500" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Top Cities</h4>
                    </div>
                    <div className="space-y-4">
                        {topCities.map(([city, count], idx) => {
                            // Find max for percentage bar
                            const max = topCities[0][1];
                            const percentage = (count / max) * 100;
                            return (
                                <div key={city}>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                        <span className="truncate pr-2">{city}</span>
                                        <span>{count.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Online Activity */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <FiClock className="text-indigo-500" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Follower Activity (Best Time to Post)</h4>
                    </div>
                    <div className="h-40">
                        {onlineChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={onlineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748b' }} interval={2} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="active" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <FiClock className="w-6 h-6 mb-2 opacity-50" />
                                <span className="text-xs font-bold text-slate-500">No Activity Data Available</span>
                                <span className="text-[10px] text-slate-400">Meta hasn't provided online hours for this account recently.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InteractionsDashboard = ({ currentProject }) => {
    const { data, isLoading } = useGetProfileInteractions(currentProject?.instagramBusinessId);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data?.interactions || data.interactions.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <FiActivity className="w-5 h-5 opacity-50" />
                </div>
                <p className="text-xs font-bold text-center">
                    Profile Interactions Unavailable<br/>
                    <span className="text-[10px] font-normal">Not enough recent profile activity to report.</span>
                </p>
            </div>
        );
    }

    // Helper to get total value from array or total_value object
    const getTotal = (name) => {
        const metric = data.interactions.find(m => m.name === name);
        if (!metric) return 0;
        if (metric.total_value) return metric.total_value.value || 0;
        if (metric.values) return metric.values.reduce((sum, v) => sum + (v.value || 0), 0);
        return 0;
    };

    // Prepare chart data combining profile_views and website_clicks over time
    const viewsData = data.interactions.find(m => m.name === 'profile_views')?.values || [];
    const clicksData = data.interactions.find(m => m.name === 'website_clicks')?.values || [];
    
    const chartData = viewsData.map((v, i) => ({
        date: v.end_time ? format(parseISO(v.end_time), 'MMM d') : '',
        'Profile Views': v.value || 0,
        'Website Clicks': clicksData[i]?.value || 0
    })).filter(d => d.date !== '');

    return (
        <div className="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar pb-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-indigo-500">
                        <FiUsers className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile Views</span>
                    </div>
                    <span className="text-2xl font-black text-slate-800">{getTotal('profile_views').toLocaleString()}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-pink-500">
                        <FiMousePointer className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Website Clicks</span>
                    </div>
                    <span className="text-2xl font-black text-slate-800">{getTotal('website_clicks').toLocaleString()}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                        <FiActivity className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Link Taps</span>
                    </div>
                    <span className="text-2xl font-black text-slate-800">{getTotal('profile_links_taps').toLocaleString()}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <FiPhone className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone & Email</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-1">Merged into Link Taps</span>
                </div>
            </div>

            {/* Warning if fallback */}
            {data.warning && (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium px-4 py-3 rounded-xl flex gap-2 items-center">
                    <FiActivity className="w-4 h-4 shrink-0" />
                    <span>{data.warning} Some specific action button data could not be fetched.</span>
                </div>
            )}

            {/* Area Chart */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex-1 min-h-[300px] flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <FiActivity className="text-indigo-500" />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">30-Day Interaction Trend</h4>
                </div>
                <div className="flex-1">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} minTickGap={20} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="Profile Views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="Website Clicks" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <FiBarChart2 className="w-8 h-8 mb-2 opacity-50 text-indigo-400" />
                            <span className="text-xs font-bold text-slate-500">Trend Graph Unavailable</span>
                            <span className="text-[10px] text-slate-400">Meta API is only providing a single 30-day sum, not daily breakdown data.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StoriesDashboard = ({ currentProject }) => {
    const { data, isLoading } = useGetActiveStories(currentProject?.instagramBusinessId);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data?.stories || data.stories.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <FiImage className="w-5 h-5 opacity-50" />
                </div>
                <p className="text-xs font-bold text-center">
                    No Active Stories<br/>
                    <span className="text-[10px] font-normal">Stories expire and lose tracking after 24 hours.</span>
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
            {data.stories.map(story => (
                <div key={story.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-all flex flex-col shadow-sm">
                    <div className="relative h-48 bg-slate-100 shrink-0">
                        {story.media_type === 'VIDEO' ? (
                            <video src={story.media_url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                            <img src={story.media_url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                            <FiClock className="w-3 h-3" />
                            {format(new Date(story.timestamp), 'MMM d, h:mm a')}
                        </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-2 bg-slate-50">
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
                                <span className="block text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Reach</span>
                                <span className="text-base font-black text-slate-800">{story.insights?.reach || 0}</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
                                <span className="block text-[9px] font-black text-pink-500 uppercase tracking-widest mb-0.5">Replies</span>
                                <span className="text-base font-black text-slate-800">{story.insights?.replies || 0}</span>
                            </div>
                        </div>
                        <div className="flex justify-center items-center text-[10px] font-bold text-slate-500 mt-1 px-1">
                            <span className="flex items-center gap-1"><FiActivity className="text-slate-400" /> {story.insights?.navigation || 0} Navigation Actions</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MentionsDashboard = ({ currentProject }) => {
    const { data, isLoading } = useGetMentionsAndTags(currentProject?.instagramBusinessId);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data?.mentions || data.mentions.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <FiAtSign className="w-5 h-5 opacity-50" />
                </div>
                <p className="text-xs font-bold text-center">
                    No Mentions Found<br/>
                    <span className="text-[10px] font-normal">There are no external posts tagging this account.</span>
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
            {data.mentions.map(post => (
                <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-all flex flex-col shadow-sm">
                    <div className="relative h-48 bg-slate-100 shrink-0">
                        {post.media_type === 'VIDEO' ? (
                            <video src={post.media_url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                            <img src={post.media_url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                            <FiAtSign className="w-3 h-3 text-indigo-400" />
                            {post.username || 'Unknown User'}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiExternalLink className="w-3 h-3" />
                        </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-2 bg-slate-50">
                        <p className="text-[10px] text-slate-600 line-clamp-3 leading-relaxed flex-1">
                            {post.caption || <span className="italic opacity-50">No caption</span>}
                        </p>
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200">
                            <span>{format(new Date(post.timestamp), 'MMM d, yyyy')}</span>
                            <span>{post.media_type}</span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

const HashtagsDashboard = ({ currentProject }) => {
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [permissionError, setPermissionError] = useState(null);
    const { mutate: search, isLoading } = useSearchHashtag();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setPermissionError(null);

        search(
            { instagramId: currentProject?.instagramBusinessId, keyword: keyword.trim() },
            {
                onSuccess: (data) => setSearchResults(data),
                onError: (err) => {
                    const errorCode = err.response?.data?.error;
                    if (errorCode === 'APP_REVIEW_REQUIRED') {
                        setPermissionError(err.response.data.message);
                    } else {
                        toast.error("Failed to search hashtag. It might not exist or Meta restricted it.");
                    }
                }
            }
        );
    };

    return (
        <div className="flex flex-col h-full overflow-hidden pb-6">
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search hashtag (e.g., #marketing)"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !keyword.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Search"}
                </button>
            </form>

            {permissionError && (
                <div className="flex-1 flex flex-col items-center justify-center text-rose-500 bg-rose-50/50 rounded-xl p-6 border border-rose-100">
                    <FiSearch className="w-8 h-8 mb-3 opacity-50" />
                    <p className="text-sm font-black text-center mb-1">App Review Required</p>
                    <p className="text-[10px] font-bold text-center max-w-sm leading-relaxed opacity-80">
                        {permissionError}
                    </p>
                    <a href="https://developers.facebook.com/docs/apps/review" target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-1.5 bg-rose-500 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors flex items-center gap-1.5">
                        <FiExternalLink className="w-3 h-3" /> Meta Documentation
                    </a>
                </div>
            )}

            {!searchResults && !isLoading && !permissionError && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <FiHash className="w-5 h-5 opacity-50" />
                    </div>
                    <p className="text-xs font-bold text-center">
                        Hashtag Research Tool<br/>
                        <span className="text-[10px] font-normal">Search to discover the top-performing media for a hashtag before scheduling posts.</span>
                    </p>
                </div>
            )}

            {searchResults && searchResults.media?.length === 0 && !permissionError && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <FiHash className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-xs font-bold">No media found for #{searchResults.keyword}</p>
                </div>
            )}

            {searchResults && searchResults.media?.length > 0 && !permissionError && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    {searchResults.media.map(post => (
                        <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-all flex flex-col shadow-sm">
                            <div className="relative h-48 bg-slate-100 shrink-0">
                                {post.media_type === 'VIDEO' ? (
                                    <video src={post.media_url} className="w-full h-full object-cover" muted playsInline />
                                ) : (
                                    <img src={post.media_url} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                            <div className="p-3 flex-1 flex flex-col gap-2 bg-slate-50">
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-white border border-slate-200 rounded p-1.5 shadow-sm">
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest"><FiHeart className="inline w-3 h-3 text-rose-500 mb-0.5" /> Likes</span>
                                        <span className="text-sm font-black text-slate-800">{post.like_count?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded p-1.5 shadow-sm">
                                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest"><FiMessageCircle className="inline w-3 h-3 text-sky-500 mb-0.5" /> Comments</span>
                                        <span className="text-sm font-black text-slate-800">{post.comments_count?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed flex-1 mt-1">
                                    {post.caption || <span className="italic opacity-50">No caption</span>}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export const InsightsTab = ({ currentProject }) => {
    const [activePost, setActivePost] = useState(null);

    const { data: posts, isLoading: postsLoading } = useGetScheduledPosts({ project: currentProject._id });
    const { mutate: deletePost } = useDeleteScheduledPost();

    const handleDelete = (e, id) => {
        e.stopPropagation();
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
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles[status] || styles['SCHEDULED']}`}>
                {status}
            </span>
        );
    };

    const [view, setView] = useState("posts"); // 'posts' | 'audience'

    return (
        <div className="h-full mt-4 flex flex-col overflow-hidden">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col min-h-0">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-black text-slate-800">Insights & Analytics</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">For {currentProject.name}</p>
                    </div>

                    <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl shrink-0 gap-1">
                        <button
                            onClick={() => setView('posts')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'posts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Recent Posts
                        </button>
                        <button
                            onClick={() => setView('audience')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'audience' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Audience
                        </button>
                        <button
                            onClick={() => setView('interactions')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'interactions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Interactions
                        </button>
                        <button
                            onClick={() => setView('stories')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Stories
                        </button>
                        <button
                            onClick={() => setView('mentions')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'mentions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Mentions
                        </button>
                        <button
                            onClick={() => setView('hashtags')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'hashtags' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Hashtags
                        </button>
                    </div>
                </div>

                {view === 'audience' ? (
                    <AudienceDashboard currentProject={currentProject} />
                ) : view === 'interactions' ? (
                    <InteractionsDashboard currentProject={currentProject} />
                ) : view === 'stories' ? (
                    <StoriesDashboard currentProject={currentProject} />
                ) : view === 'mentions' ? (
                    <MentionsDashboard currentProject={currentProject} />
                ) : view === 'hashtags' ? (
                    <HashtagsDashboard currentProject={currentProject} />
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {postsLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-6 h-6 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                            </div>
                        ) : posts?.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                    <FiImage className="w-5 h-5 opacity-50" />
                                </div>
                                <p className="text-xs font-bold">No posts scheduled yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {posts?.map(post => (
                                    <div
                                        key={post._id}
                                        onClick={() => post.status === 'PUBLISHED' && setActivePost(post)}
                                        className={`group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col ${post.status === 'PUBLISHED' ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <div className="relative h-36 bg-slate-50 shrink-0">
                                            <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute top-2 left-2">
                                                {getStatusBadge(post.status)}
                                            </div>
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                                                <FiInstagram className="w-3 h-3 text-pink-600" />
                                            </div>
                                            {post.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={(e) => handleDelete(e, post._id)}
                                                    className="absolute bottom-2 right-2 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                                                >
                                                    <FiTrash2 className="w-3 h-3" />
                                                </button>
                                            )}

                                            {/* Overlay instruction for published posts */}
                                            {post.status === 'PUBLISHED' && (
                                                <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <span className="bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                                        View Details
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col flex-1">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                <FiClock className="w-2.5 h-2.5" />
                                                {format(new Date(post.scheduledAt), "MMM d, h:mm a")}
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2 font-medium mb-1 flex-1">
                                                {post.caption || <span className="italic opacity-50">No caption</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {activePost && (
                <PostDetailsModal
                    post={activePost}
                    currentProject={currentProject}
                    onClose={() => setActivePost(null)}
                />
            )}
        </div>
    );
};

export default InsightsTab;

