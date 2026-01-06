import React from 'react';
import {
    Users,
    TrendingUp,
    Clock,
    Calendar,
    Layers
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend, isLoading, isActive, onClick }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-2.5 border border-slate-100 animate-pulse flex items-center gap-2.5 min-w-[140px]">
                <div className="w-9 h-9 rounded-lg bg-slate-100" />
                <div className="space-y-1">
                    <div className="h-2.5 w-12 bg-slate-100 rounded" />
                    <div className="h-4 w-8 bg-slate-100 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-2.5 border transition-all duration-300 flex items-center gap-2.5 min-w-[140px] group cursor-pointer
        ${isActive ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-sm' : 'border-slate-100 hover:shadow-sm'}`}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105`} style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon className="w-4.5 h-4.5" />
            </div>
            <div>
                <p className="text-[10px] font-medium text-slate-500 mb-0">{title}</p>
                <div className="flex items-center gap-1">
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{value}</h3>
                    {trend && (
                        <span className="text-[9px] font-semibold text-emerald-500 flex items-center bg-emerald-50 px-1 py-0.2 rounded-full">
                            <TrendingUp className="w-2 h-2 mr-0.5" />
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusCard = ({ name, count, color, isLoading, isActive, onClick }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-2.5 border border-slate-100 animate-pulse flex flex-col gap-1 min-w-[90px]">
                <div className="h-2 w-10 bg-slate-100 rounded" />
                <div className="h-5 w-6 bg-slate-100 rounded" />
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-2 border transition-all duration-300 flex flex-col min-w-[100px] relative overflow-hidden group cursor-pointer
        ${isActive ? 'ring-2 shadow-md z-10' : 'border-slate-100 hover:shadow-sm'}`}
            style={isActive ? { borderColor: color, boxShadow: `0 4px 6px -1px ${color}15` } : {}}
        >
            <div className="absolute top-0 left-0 w-1 h-full opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate pr-1 pl-1">{name}</p>
            <div className="mt-0.5 flex items-center justify-between pl-1">
                <h3 className="text-lg font-extrabold text-slate-800 leading-none">{count}</h3>
                <div className="w-5 h-5 rounded flex items-center justify-center opacity-30 group-hover:opacity-100 transition-all duration-300" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Layers className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};

const LeadsDashboard = ({ stats, isLoading, activeStatusId, onStatusClick }) => {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {/* Primary Stats - Click to clear filters */}
            <StatCard
                title="Total Leads"
                value={stats?.totalLeads || 0}
                icon={Users}
                color="#6366f1"
                isLoading={isLoading}
                isActive={!activeStatusId}
                onClick={() => onStatusClick(null)}
            />

            <div className="w-px h-6 bg-slate-200/60 mx-0.5 flex-shrink-0" />

            {/* Status Breakdown */}
            <div className="flex items-center gap-2">
                {isLoading ? (
                    [1, 2, 3].map(i => <StatusCard key={i} isLoading={true} />)
                ) : (
                    stats?.statusStats?.map((status) => (
                        <StatusCard
                            key={status._id}
                            name={status.name}
                            count={status.count}
                            color={status.color}
                            isActive={activeStatusId === status._id}
                            onClick={() => onStatusClick(status._id)}
                        />
                    ))
                )}
            </div>

            <div className="w-px h-6 bg-slate-200/60 mx-0.5 flex-shrink-0" />

            {/* Time Based Stats */}
            <StatCard
                title="New Today"
                value={stats?.newLeadsToday || 0}
                icon={Clock}
                color="#f59e0b"
                isLoading={isLoading}
            />
            <StatCard
                title="Last 7 Days"
                value={stats?.newLeadsThisWeek || 0}
                icon={Calendar}
                color="#10b981"
                isLoading={isLoading}
            />
        </div>
    );
};

export default LeadsDashboard;
