import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Medal, Star, TrendingUp, Calendar,
  Filter, Users, Award, ArrowRight, Activity,
  Zap, AlertCircle, Clock, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { getLeaderboard, getPerformanceTrend } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [type, setType] = useState("weekly");
  const [data, setData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, trendRes] = await Promise.all([
        getLeaderboard(type),
        getPerformanceTrend(type)
      ]);

      if (leaderboardRes.success) setData(leaderboardRes.leaderboard);
      if (trendRes.success) setTrendData(trendRes.trend);
    } catch (err) {
      console.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    switch (index) {
      case 0: return { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200", icon: <Star className="w-4 h-4 fill-yellow-500" /> };
      case 1: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: <Medal className="w-4 h-4 text-slate-500" /> };
      case 2: return { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", icon: <Award className="w-4 h-4 text-orange-500" /> };
      default: return null;
    }
  };

  const handleRowClick = (userId) => {
    navigate(`/employees/${userId}?tab=Performance`);
  };

  return (
    <div className="min-h-screen bg-[#F4F9FD] ">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header & Toggle */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#0A1629]">Team Leaderboard</h1>
          </div>

          <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-xl border border-gray-200/50">
            {["weekly", "monthly"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${type === t ? "bg-[#3F8CFF] text-white shadow-md" : "text-[#7D8592] hover:bg-gray-100"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left Column: Line Chart & Top 3 Summary */}
            <div className="lg:col-span-4 space-y-3">
              {/* Performance Trend Graph */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-5 border border-gray-100 "
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#0A1629]">Team Excellence</h3>
                    <p className="text-[10px] text-[#7D8592] font-medium uppercase tracking-tight">Average Score Trend</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-[#3F8CFF]" />
                  </div>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3F8CFF" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#3F8CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="period"
                        hide
                      />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        labelStyle={{ fontSize: '10px', color: '#7D8592' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="average"
                        stroke="#3F8CFF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAvg)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Compact Podium */}
              <div className="grid grid-cols-1 gap-3">
                {data.slice(0, 3).map((item, index) => {
                  const badge = getRankBadge(index);
                  return (
                    <motion.div
                      key={item._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleRowClick(item.user?._id)}
                      className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer flex items-center gap-4 group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${badge.bg} ${badge.text}`}>
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                        <img src={item.user?.profileImage || "/default-avatar.png"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#0A1629] truncate group-hover:text-[#3F8CFF] transition-colors">
                          {item.user?.firstName}
                        </h4>
                        <p className="text-[10px] text-[#7D8592]">{item.user?.position}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#0A1629]">{item.totalScore}</span>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mt-1">
                          <div className={`h-full rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-[#3F8CFF]'}`} style={{ width: `${item.totalScore}%` }} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Table */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-gray-100  overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 text-[10px] uppercase font-black text-[#7D8592] tracking-widest border-b border-gray-100">
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Activity</th>
                        <th className="px-6 py-4">Issues</th>
                        <th className="px-6 py-4">Attendance</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(data.length > 0 ? data : []).map((item, index) => (
                        <tr
                          key={item._id}
                          onClick={() => handleRowClick(item.user?._id)}
                          className="hover:bg-[#F4F9FD] group transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-black text-gray-300 group-hover:text-[#3F8CFF] transition-colors italic">
                              #{index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-white">
                                <img src={item.user?.profileImage || "/default-avatar.png"} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-[#0A1629] truncate">{item.user?.firstName} {item.user?.lastName}</h4>
                                <p className="text-[10px] text-[#7D8592]">{item.user?.position}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              </div>
                              <span className="text-xs font-bold text-gray-700">{item.meta?.totalTasks || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className={`w-3.5 h-3.5 ${item.meta?.lateTasks > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
                                <span className="text-xs font-bold text-gray-600">{item.meta?.lateTasks || 0}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Activity className={`w-3.5 h-3.5 ${item.meta?.reworkCount > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                                <span className="text-xs font-bold text-gray-600">{item.meta?.reworkCount || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-700">{item.meta?.attendanceDays || 0}d</span>
                              {item.meta?.lateArrivals > 0 && (
                                <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                  {item.meta?.lateArrivals} LATE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[#0A1629]">{item.totalScore}</span>
                              <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#3F8CFF] group-hover:text-white transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
