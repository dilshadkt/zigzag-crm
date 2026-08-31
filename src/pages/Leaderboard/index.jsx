import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Medal, Star, TrendingUp, Calendar,
  Filter, Users, Award, ArrowRight, Activity,
  Zap, AlertCircle, Clock, CheckCircle2, Settings, X, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, subMonths, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { getLeaderboard, getPerformanceTrend, getNudges, addBonusPoints } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

const getPeriodKeyForDate = (date, type) =>
  format(date, type === "weekly" ? "yyyy-'W'II" : "yyyy-MM");

const buildPeriodOptions = (type, count = 12) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = type === "weekly" ? subWeeks(now, index) : subMonths(now, index);
    const key = getPeriodKeyForDate(date, type);

    if (type === "weekly") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return {
        key,
        label:
          index === 0
            ? `This week (${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")})`
            : `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`,
        isCurrent: index === 0,
      };
    }

    return {
      key,
      label: index === 0 ? `This month (${format(date, "MMMM yyyy")})` : format(date, "MMMM yyyy"),
      isCurrent: index === 0,
    };
  });
};

const formatPeriodLabel = (periodKey, type) => {
  if (!periodKey) return "";
  if (type === "monthly") {
    const [year, month] = periodKey.split("-");
    if (!year || !month) return periodKey;
    return format(new Date(Number(year), Number(month) - 1, 1), "MMMM yyyy");
  }
  return periodKey.replace("W", " Week ");
};

const Leaderboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState("monthly");
  const [periodKey, setPeriodKey] = useState("");
  const [activePeriodKey, setActivePeriodKey] = useState("");
  const [data, setData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const periodOptions = useMemo(() => buildPeriodOptions(type), [type]);
  const selectedPeriodKey = periodKey || periodOptions[0]?.key || "";
  const isCurrentPeriod = selectedPeriodKey === periodOptions[0]?.key;
  const selectedPeriodLabel =
    periodOptions.find((option) => option.key === selectedPeriodKey)?.label ||
    formatPeriodLabel(activePeriodKey, type);
  
  // Admin Score Modal
  const [scoreModal, setScoreModal] = useState({ isOpen: false, user: null, item: null });
  const [scoreForm, setScoreForm] = useState({ points: "", targetScore: "", reason: "" });

  useEffect(() => {
    setPeriodKey("");
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [type, periodKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const effectivePeriodKey = periodKey || undefined;
      const [leaderboardRes, trendRes] = await Promise.all([
        getLeaderboard(type, effectivePeriodKey),
        getPerformanceTrend(type)
      ]);

      if (leaderboardRes.success) {
        setData(leaderboardRes.leaderboard);
        setActivePeriodKey(leaderboardRes.periodKey || "");
      }
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

  const handleAdminScoreSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: scoreModal.user._id,
        periodType: type,
        reason: scoreForm.reason || "Admin Adjustment",
      };
      if (scoreForm.points) payload.points = Number(scoreForm.points);
      if (scoreForm.targetScore) payload.targetScore = Number(scoreForm.targetScore);

      await addBonusPoints(payload);
      setScoreModal({ isOpen: false, user: null, item: null });
      setScoreForm({ points: "", targetScore: "", reason: "" });
      fetchData(); // refresh data
    } catch (err) {
      console.error("Failed to update score", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9FD] ">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header & Toggle */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#0A1629]">Team Leaderboard</h1>
              <p className="text-[11px] text-[#7D8592] font-medium mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {selectedPeriodLabel}
                {!isCurrentPeriod && (
                  <span className="text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase">
                    Past {type === "weekly" ? "week" : "month"}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedPeriodKey}
                onChange={(e) => setPeriodKey(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-9 py-2 text-xs font-bold text-[#0A1629] focus:outline-none focus:ring-2 focus:ring-[#3F8CFF]/30 min-w-[190px]"
              >
                {periodOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#7D8592] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <LoadingSpinner />
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#0A1629]">No leaderboard data</h3>
            <p className="text-xs text-[#7D8592] mt-1">
              No performance records found for {selectedPeriodLabel}.
            </p>
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
                        <div className="flex items-end flex-col">
                          <span className="text-sm font-black text-[#0A1629]">{Math.round(item.normalizedScore || 0)}%</span>
                          <span className="text-[9px] text-[#7D8592]">Pts: {item.totalScore}</span>
                        </div>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mt-1">
                          <div className={`h-full rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-[#3F8CFF]'}`} style={{ width: `${Math.min(100, Math.round(item.normalizedScore || 0))}%` }} />
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
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-50 rounded-lg">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{item.meta?.totalTasks || 0} Tasks</span>
                              </div>
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-9">+{item.activityScore || 0} pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3.5 h-3.5 ${item.meta?.lateTasks > 0 ? 'text-amber-500' : 'text-gray-300'}`} />
                                  <span className="text-xs font-bold text-gray-600">{item.meta?.lateTasks || 0} Delays</span>
                                </div>
                                {item.meta?.lateTasks === 0 && item.meta?.totalTasks > 0 && (
                                  <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200 inline-block w-max">Punctual</span>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <AlertCircle className={`w-3.5 h-3.5 ${item.meta?.reworkCount > 0 ? 'text-rose-500' : 'text-gray-300'}`} />
                                  <span className="text-xs font-bold text-gray-600">{item.meta?.reworkCount || 0} Mistakes</span>
                                </div>
                                {item.meta?.reworkCount > 10 && (
                                  <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-200 inline-block w-max">Critical</span>
                                )}
                              </div>
                            </div>
                            {(item.penaltyScore > 0) && (
                              <div className="mt-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                <span>-{item.penaltyScore} pts</span>
                                <span className="text-[8px] text-rose-300 font-medium normal-case tracking-normal">(Deductions)</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-700">{item.meta?.attendanceDays || 0} Days</span>
                                {item.meta?.lateArrivals > 0 && (
                                  <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                                    {item.meta?.lateArrivals} LATE
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-black text-[#3F8CFF] uppercase tracking-widest">+{item.attendanceScore || 0} pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-[#0A1629]">{Math.round(item.normalizedScore || 0)}%</span>
                                <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                              </div>
                              <span className="text-[10px] text-[#7D8592] font-semibold">{item.totalScore} Total Pts</span>
                              {item.bonusScore > 0 && (
                                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mt-0.5">
                                  +{item.bonusScore} Bonus
                                </span>
                              )}
                              {item.bonusScore < 0 && (
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-0.5">
                                  {item.bonusScore} Penalty
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {currentUser?.role === "company-admin" && isCurrentPeriod && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScoreForm({ points: 0, targetScore: item.targetScore || 1000, reason: "" });
                                    setScoreModal({ isOpen: true, user: item.user, item });
                                  }}
                                  className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#3F8CFF] group-hover:text-white transition-all"
                                  title="Adjust Score (Admin)"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#3F8CFF] group-hover:text-white transition-all">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
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

      {/* Admin Score Adjustment Modal */}
      <AnimatePresence>
        {scoreModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#0A1629]">Adjust Score: {scoreModal.user?.firstName}</h3>
                <button onClick={() => setScoreModal({ isOpen: false, user: null, item: null })} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAdminScoreSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Score</label>
                  <input
                    type="number"
                    value={scoreForm.targetScore}
                    onChange={(e) => setScoreForm({ ...scoreForm, targetScore: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8CFF]/50"
                    placeholder="e.g. 1000"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Updates the baseline target for this employee's percentage calculation.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bonus / Penalty Points</label>
                  <input
                    type="number"
                    value={scoreForm.points}
                    onChange={(e) => setScoreForm({ ...scoreForm, points: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8CFF]/50"
                    placeholder="e.g. 50 or -20"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Will be added (or subtracted) from their current bonus score.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={scoreForm.reason}
                    onChange={(e) => setScoreForm({ ...scoreForm, reason: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8CFF]/50"
                    placeholder="e.g. Excellent SEO performance"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setScoreModal({ isOpen: false, user: null, item: null })}
                    className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-bold text-white bg-[#3F8CFF] hover:bg-blue-600 rounded-xl shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;
