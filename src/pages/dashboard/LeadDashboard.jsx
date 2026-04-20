import React, { useState } from "react";
import {
    useGetLeadStats,
    useGetLeadStatuses,
    useUpdateLead
} from "../../features/leads/api";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    Flame,
    TrendingDown,
    CalendarCheck,
    Users,
    Trophy,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Mail,
    Phone
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const LeadDashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'company-admin';
    const [selectedDays, setSelectedDays] = useState(7);
    const { data: statsData, isLoading: statsLoading } = useGetLeadStats({ days: selectedDays });
    const { data: statusData } = useGetLeadStatuses();

    const stats = statsData?.data;

    const onLeadClick = (leadId) => {
        navigate(`/leads/${leadId}`);
    };

    const handleCall = (e, phone) => {
        e.stopPropagation();
        if (phone) window.location.href = `tel:${phone}`;
        else toast.error("Phone number not available");
    };

    const handleEmail = (e, email) => {
        e.stopPropagation();
        if (email) window.location.href = `mailto:${email}`;
        else toast.error("Email address not available");
    };

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3f8cff]"></div>
            </div>
        );
    }

    const COLORS = ['#3f8cff', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-2 p-1 bg-slate-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-[#0A1629]">Lead Dashboard</h1>
                    <p className="text-xs text-slate-500">Welcome back! Here's what's happening with your leads today.</p>
                </div>
                <button
                    onClick={() => navigate('/leads')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#3f8cff] text-white rounded-[10px] hover:bg-[#337ae6] transition-colors text-xs font-semibold"
                >
                    <Search className="w-3.5 h-3.5" />
                    Browse All Leads
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <StatCard
                    title="Total Leads"
                    value={stats?.totalLeads}
                    icon={Users}
                    color="blue"
                    trend={`${stats?.trends?.totalLeadsTrend >= 0 ? '+' : ''}${stats?.trends?.totalLeadsTrend || 0}%`}
                    trendUp={stats?.trends?.totalLeadsTrend >= 0}
                    onClick={() => navigate('/leads')}
                />
                <StatCard
                    title="New Today"
                    value={stats?.newLeadsToday}
                    icon={Target}
                    color="amber"
                    trend={`${stats?.trends?.newTodayTrend >= 0 ? '+' : ''}${stats?.trends?.newTodayTrend || 0}%`}
                    trendUp={stats?.trends?.newTodayTrend >= 0}
                    onClick={() => navigate('/leads')}
                />
                <StatCard
                    title="Hot Leads"
                    value={stats?.hotLeads?.count}
                    icon={Flame}
                    color="orange"
                    onClick={() => navigate(`/leads?minScore=${stats?.hotLeadThreshold || 70}`)}
                />
                <StatCard
                    title="Today's Follow-ups"
                    value={stats?.todayFollowUps?.count}
                    icon={CalendarCheck}
                    color="emerald"
                    onClick={() => navigate('/leads?scheduled=today')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Left Column - Performance & Trends */}
                <div className="lg:col-span-2 space-y-2">
                    {/* Performance Chart */}
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#3f8cff]" />
                                Sales Performance
                            </h3>
                            <select
                                value={selectedDays}
                                onChange={(e) => setSelectedDays(Number(e.target.value))}
                                className="bg-slate-50 border-none text-[10px] font-bold text-slate-500 rounded-lg px-2 py-1 focus:ring-0 cursor-pointer"
                            >
                                <option value={7}>Last 7 Days</option>
                                <option value={30}>Last 30 Days</option>
                                <option value={90}>Last 90 Days</option>
                            </select>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.trends?.daily}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3f8cff" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3f8cff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fill: '#94a3b8' }}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'none', fontSize: '10px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3f8cff"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Distribution */}
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col h-[320px]">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">Status Distribution</h3>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.statusStats}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="count"
                                        >
                                            {stats?.statusStats?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 overflow-y-auto max-h-[60px] scrollbar-hide">
                                {stats?.statusStats?.map((status, i) => (
                                    <div key={status._id} className="flex items-center justify-between gap-1.5 border-b border-slate-50 pb-1">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: status.color || COLORS[i % COLORS.length] }}></div>
                                            <span className="text-[10px] font-bold text-slate-600 truncate">{status.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-[#3f8cff] bg-blue-50 px-1 rounded-[4px]">{status.count || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overall Progress */}
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col h-[320px]">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">Overall Growth</h3>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.trends?.monthly}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="_id"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fill: '#94a3b8' }}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'none', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="count" fill="#3f8cff" radius={[4, 4, 0, 0]} barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Custom Dynamic Widgets */}
                    {stats?.customWidgets && stats.customWidgets.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.customWidgets.map((widget) => (
                                <div key={widget.widgetId} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col h-[320px]">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4">{widget.title}</h3>
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {widget.type === 'bar' ? (
                                                <BarChart data={widget.data}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                                    <YAxis hide />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'none', fontSize: '10px' }} />
                                                    <Bar dataKey="count" fill="#3f8cff" radius={[4, 4, 0, 0]} barSize={16} />
                                                </BarChart>
                                            ) : widget.type === 'pie' ? (
                                                <PieChart>
                                                    <Pie data={widget.data} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="count" nameKey="_id">
                                                        {widget.data.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            ) : (
                                                <AreaChart data={widget.data}>
                                                    <defs>
                                                        <linearGradient id={`color-${widget.widgetId}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3f8cff" stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor="#3f8cff" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                                    <YAxis hide />
                                                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: 'none', fontSize: '10px' }} />
                                                    <Area type="monotone" dataKey="count" stroke="#3f8cff" strokeWidth={2} fillOpacity={1} fill={`url(#color-${widget.widgetId})`} />
                                                </AreaChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                    {widget.type === 'pie' ? (
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 overflow-y-auto max-h-[80px] scrollbar-hide px-1">
                                            {widget.data.map((entry, index) => (
                                                <div key={index} className="flex items-center justify-between gap-1.5 border-b border-slate-50 pb-1">
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}></div>
                                                        <span className="text-[10px] font-bold text-slate-600 truncate">{entry._id || 'N/A'}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-[#3f8cff] bg-blue-50 px-1 rounded-[4px]">{entry.count || 0}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide px-1">
                                            {widget.data.slice(0, 5).map((entry, index) => (
                                                <div key={index} className="flex items-center justify-between gap-1.5 border-b border-slate-50 pb-1">
                                                    <span className="text-[10px] font-bold text-slate-600 truncate">{entry._id || 'N/A'}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1 bg-blue-100 rounded-full w-12 overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#3f8cff]"
                                                                style={{ width: `${Math.min(100, (entry.count / (widget.data[0]?.count || 1)) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-[#3f8cff] min-w-[20px] text-right">{entry.count || 0}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Employee Leaderboard - Admins Only */}
                    {isAdmin && (
                        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col h-[380px]">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#3f8cff]" />
                                    Team Lead Distribution
                                </h3>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top 10 Employees</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto scrollbar-hide pr-1">
                                {stats?.employeeLeads?.map((emp, i) => (
                                    <div
                                        key={emp._id}
                                        onClick={() => navigate(`/leads?owner=${emp._id}`)}
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-[#3f8cff]/20 transition-all h-fit cursor-pointer group/emp"
                                    >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <div className="relative">
                                                {emp.profileImage ? (
                                                    <img src={emp.profileImage} alt={emp.firstName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold uppercase">
                                                        {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[11px] font-bold text-slate-800 truncate">{emp.firstName} {emp.lastName}</p>
                                                <p className="text-[9px] text-slate-400 font-medium capitalize">{emp.role || 'Employee'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[13px] font-black text-[#3f8cff] leading-none">{emp.count}</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Leads</p>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.employeeLeads || stats?.employeeLeads.length === 0) && (
                                    <div className="col-span-full py-8 text-center text-slate-400 text-xs">No assignments found</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Actionable Lists */}
                <div className="space-y-2">
                    {/* Hot Leads */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                        <div className="p-3.5 border-b border-slate-50 flex items-center justify-between bg-orange-50/20">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Flame className="w-3.5 h-3.5 text-orange-500" />
                                Hot Leads
                            </h3>
                            <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md">
                                {stats?.hotLeads?.count} Total
                            </span>
                        </div>
                        <div className="divide-y divide-slate-50 h-[380px] overflow-y-auto scrollbar-hide">
                            {stats?.hotLeads?.leads?.length > 0 ? (
                                stats?.hotLeads?.leads.map(lead => (
                                    <LeadListItem
                                        key={lead._id}
                                        lead={lead}
                                        onClick={() => onLeadClick(lead._id)}
                                        onCall={(e) => handleCall(e, lead.contact?.phone)}
                                        onMail={(e) => handleEmail(e, lead.contact?.email)}
                                        tag="Hot"
                                        tagColor="bg-orange-50 text-orange-600"
                                    />
                                ))
                            ) : (
                                <div className="p-6 text-center text-slate-400 text-xs">No hot leads found</div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate(`/leads?minScore=${stats?.hotLeadThreshold || 70}`)}
                            className="w-full py-2.5 text-[11px] font-bold text-[#3f8cff] hover:bg-slate-50 transition-colors border-t border-slate-50"
                        >
                            View All High Score Leads
                        </button>
                    </div>

                    {/* Today's Follow-ups */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                        <div className="p-3.5 border-b border-slate-50 flex items-center justify-between bg-emerald-50/20">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Today's Follow-ups
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50 h-[380px] overflow-y-auto scrollbar-hide">
                            {stats?.todayFollowUps?.leads?.length > 0 ? (
                                stats?.todayFollowUps?.leads.map(lead => (
                                    <LeadListItem
                                        key={lead._id}
                                        lead={lead}
                                        onClick={() => onLeadClick(lead._id)}
                                        onCall={(e) => handleCall(e, lead.contact?.phone)}
                                        onMail={(e) => handleEmail(e, lead.contact?.email)}
                                        time={new Date(lead.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    />
                                ))
                            ) : (
                                <div className="p-6 text-center text-slate-400 text-xs">No follow-ups for today</div>
                            )}
                        </div>
                    </div>

                    {/* Weak Leads / Re-engage */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                        <div className="p-3.5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                                Weak Leads (Re-engage)
                            </h3>
                            <button
                                onClick={() => navigate('/leads')}
                                className="text-[10px] text-[#3f8cff] font-bold hover:underline"
                            >
                                Bulk Follow-up
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50 h-[380px] overflow-y-auto scrollbar-hide">
                            {stats?.weakLeads?.leads?.length > 0 ? (
                                stats?.weakLeads?.leads.map(lead => (
                                    <LeadListItem
                                        key={lead._id}
                                        lead={lead}
                                        onClick={() => onLeadClick(lead._id)}
                                        onCall={(e) => handleCall(e, lead.contact?.phone)}
                                        onMail={(e) => handleEmail(e, lead.contact?.email)}
                                        tag="Cold"
                                        tagColor="bg-slate-50 text-slate-500"
                                    />
                                ))
                            ) : (
                                <div className="p-6 text-center text-slate-400 text-xs">Great job! No weak leads.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp, onClick }) => {
    const colors = {
        blue: 'bg-blue-50 text-[#3f8cff]',
        amber: 'bg-amber-50 text-amber-600',
        orange: 'bg-orange-50 text-orange-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div
            onClick={onClick}
            className="bg-white p-4 rounded-[2rem] border border-slate-100 group transition-all cursor-pointer"
        >
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colors[color] || 'bg-slate-50 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-0.5 text-[9px] font-black ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
                <h3 className="text-xl font-black text-[#0A1629]">{value || 0}</h3>
            </div>
        </div>
    );
};

const LeadListItem = ({ lead, onClick, onCall, onMail, tag, tagColor, time }) => {
    return (
        <div
            onClick={onClick}
            className="p-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 text-[#3f8cff] font-bold text-[10px] uppercase border border-slate-100">
                        {lead.name?.charAt(0) || 'L'}
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="text-[12px] font-bold text-[#0A1629] truncate group-hover:text-[#3f8cff] transition-colors">
                            {lead.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-slate-400 font-bold truncate">
                                {lead.status?.name || 'New'}
                            </span>
                            {lead.owner && (
                                <span className="text-[9px] text-slate-500 font-medium truncate flex items-center gap-1">
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                    {lead.owner.firstName} {lead.owner.lastName}
                                </span>
                            )}
                            {time && (
                                <span className="text-[9px] text-[#3f8cff] font-black flex items-center gap-1 ml-auto">
                                    <CalendarCheck className="w-2.5 h-2.5" />
                                    {time}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {tag && (
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${tagColor}`}>
                            {tag}
                        </span>
                    )}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onCall}
                            className="p-1 px-1.5 rounded-md bg-slate-50 text-slate-400 hover:bg-[#3f8cff]/10 hover:text-[#3f8cff] transition-all"
                        >
                            <Phone className="w-3 h-3" />
                        </button>
                        <button
                            onClick={onMail}
                            className="p-1 px-1.5 rounded-md bg-slate-50 text-slate-400 hover:bg-[#3f8cff]/10 hover:text-[#3f8cff] transition-all"
                        >
                            <Mail className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDashboardPage;

