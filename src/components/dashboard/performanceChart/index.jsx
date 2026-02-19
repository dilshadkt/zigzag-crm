import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useGetCompletionTrend } from "../../../api/hooks/dashboard";
import { FiActivity, FiChevronDown, FiZap, FiTarget } from "react-icons/fi";

const CompletionTrendChart = ({ userId = null }) => {
    const [range, setRange] = useState(14);
    const { data, isLoading } = useGetCompletionTrend(userId, range);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 h-96 flex items-center justify-center animate-pulse border border-gray-100">
                        <div className="text-gray-400 font-medium">Preparing insights {i}...</div>
                    </div>
                ))}
            </div>
        );
    }

    const chartData = data?.data || [];

    const RangeSelector = () => (
        <div className="relative">
            <select
                value={range}
                onChange={(e) => setRange(Number(e.target.value))}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer hover:bg-white"
            >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <FiChevronDown className="w-3 h-3" />
            </div>
        </div>
    );

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const successRate = data.dailyTarget > 0
                ? Math.round((data.dailyActual / data.dailyTarget) * 100)
                : data.dailyActual > 0 ? 100 : 0;

            return (
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl  border border-gray-100 min-w-[160px]">
                    <p className="text-[11px] font-black text-gray-900 mb-3 border-b border-gray-50 pb-2">
                        {new Date(data.date).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Target</span>
                            <span className="text-xs font-bold text-indigo-600">{data.dailyTarget}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Completed</span>
                            <span className="text-xs font-bold text-emerald-600">{data.dailyActual}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-900 uppercase">Efficiency</span>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${successRate >= 100 ? 'bg-emerald-50 text-emerald-600' :
                                successRate >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {successRate}%
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const totalTarget = chartData.reduce((acc, curr) => acc + curr.dailyTarget, 0);
    const totalActual = chartData.reduce((acc, curr) => acc + curr.dailyActual, 0);
    const overallEfficiency = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full  relative">
            {/* CHART 1: PRODUCTIVITY PULSE (Daily Target vs. Actual) */}
            <div className="bg-white rounded-3xl p-6  border border-gray-100 flex flex-col min-h-[440px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-2xl">
                            <FiZap className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800 tracking-tight">Productivity Pulse</h3>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Target vs. Actual Completion</p>
                        </div>
                    </div>
                    <RangeSelector />
                </div>

                <div className="w-full flex-1 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={range > 14 ? 2 : 4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB', radius: 8 }} />
                            <Bar
                                dataKey="dailyTarget"
                                name="Daily Target"
                                fill="#E0E7FF"
                                radius={[4, 4, 0, 0]}
                                barSize={range > 14 ? 12 : 18}
                            />
                            <Bar
                                dataKey="dailyActual"
                                name="Completed"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                                barSize={range > 14 ? 12 : 18}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-around bg-gray-50/30 rounded-2xl p-3">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Total Target</span>
                        <span className="text-sm font-black text-indigo-600">{totalTarget}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md mb-1">Efficiency</span>
                        <span className="text-lg font-black text-blue-700">{overallEfficiency}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Total Done</span>
                        <span className="text-sm font-black text-emerald-600">{totalActual}</span>
                    </div>
                </div>
            </div>

            {/* CHART 2: QUALITY AUDIT (Rework Pulse) */}
            <div className="bg-white rounded-3xl p-6  border border-gray-100 flex flex-col min-h-[440px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-2xl">
                            <FiActivity className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800 tracking-tight">Quality Audit</h3>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Rework Distribution Pulse</p>
                        </div>
                    </div>
                    <RangeSelector />
                </div>

                <div className="w-full flex-1 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                                width={40}
                            />
                            <Tooltip
                                cursor={{ fill: '#FFF1F2', radius: 8 }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    padding: '12px',
                                    backgroundColor: '#111827',
                                }}
                                itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}
                                labelStyle={{ color: '#9CA3AF', fontSize: '10px', marginBottom: '4px' }}
                                labelFormatter={(val, payload) => {
                                    if (payload && payload[0]?.payload?.date) {
                                        return new Date(payload[0].payload.date).toLocaleDateString("en-US", {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        });
                                    }
                                    return val;
                                }}
                            />
                            <Bar dataKey="dailyRework" name="Rework Events" radius={[6, 6, 0, 0]} barSize={range > 14 ? 16 : 28}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.dailyRework > 2 ? '#EF4444' : entry.dailyRework > 0 ? '#FB7185' : '#F1F5F9'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between px-4 bg-gray-50/30 rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Critical Days: {chartData.filter(d => d.dailyRework > 2).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1 px-2 bg-indigo-100 rounded text-[9px] font-black text-indigo-700">TOTAL: {chartData.reduce((acc, curr) => acc + curr.dailyRework, 0)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Clean Days: {chartData.filter(d => d.dailyRework === 0).length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletionTrendChart;
