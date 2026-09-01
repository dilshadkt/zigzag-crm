import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Calendar,
  Award,
  ArrowRight,
  Settings,
  X,
  ChevronDown,
  Lightbulb,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, subMonths, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { getLeaderboard, getPerformanceTrend, addBonusPoints } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";
import ScoringGuideDrawer from "../../components/performance/ScoringGuideDrawer";
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

const formatTrendLabel = (period, type) => {
  if (!period) return "";
  if (type === "monthly" && /^\d{4}-\d{2}$/.test(period)) {
    return format(new Date(`${period}-01`), "MMM");
  }
  const week = String(period).match(/W(\d+)/i);
  return week ? `W${week[1]}` : period;
};

const getDisplayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Team member";

const getInitials = (user) =>
  `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "?";

const isSameUser = (entryUser, currentUser) =>
  Boolean(
    entryUser?._id &&
      currentUser &&
      (String(entryUser._id) === String(currentUser._id) ||
        String(entryUser._id) === String(currentUser.id))
  );

const Avatar = ({ user, size = "w-9 h-9" }) => {
  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={getDisplayName(user)}
        className={`${size} rounded-xl object-cover border border-white shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-xl bg-blue-50 text-[#3F8CFF] text-[11px] font-black flex items-center justify-center border border-blue-100`}
    >
      {getInitials(user)}
    </div>
  );
};

const RANK_STYLES = [
  {
    card: "bg-amber-50/70 border-amber-100",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-400",
    icon: Star,
  },
  {
    card: "bg-slate-50 border-slate-100",
    badge: "bg-slate-200 text-slate-700",
    bar: "bg-slate-400",
    icon: Medal,
  },
  {
    card: "bg-orange-50/70 border-orange-100",
    badge: "bg-orange-100 text-orange-700",
    bar: "bg-orange-400",
    icon: Award,
  },
];

const Leaderboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState("monthly");
  const [periodKey, setPeriodKey] = useState("");
  const [activePeriodKey, setActivePeriodKey] = useState("");
  const [data, setData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [scoreModal, setScoreModal] = useState({ isOpen: false, user: null, item: null });
  const [scoreForm, setScoreForm] = useState({ points: "", targetScore: "", reason: "" });

  const periodOptions = useMemo(() => buildPeriodOptions(type), [type]);
  const selectedPeriodKey = periodKey || periodOptions[0]?.key || "";
  const isCurrentPeriod = selectedPeriodKey === periodOptions[0]?.key;
  const selectedPeriodLabel =
    periodOptions.find((option) => option.key === selectedPeriodKey)?.label ||
    formatPeriodLabel(activePeriodKey, type);

  useEffect(() => {
    setPeriodKey("");
    setSearch("");
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
        getPerformanceTrend(type),
      ]);

      if (leaderboardRes.success) {
        setData((leaderboardRes.leaderboard || []).filter((item) => item.user));
        setActivePeriodKey(leaderboardRes.periodKey || "");
      }
      if (trendRes.success) setTrendData(trendRes.trend || []);
    } catch (err) {
      console.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const myIndex = useMemo(
    () => data.findIndex((item) => isSameUser(item.user, currentUser)),
    [data, currentUser]
  );
  const myEntry = myIndex >= 0 ? data[myIndex] : null;
  const ahead = myIndex > 0 ? data[myIndex - 1] : null;

  const summary = useMemo(() => {
    if (!data.length) {
      return { avg: 0, topScore: 0, people: 0 };
    }
    const avg =
      data.reduce((sum, item) => sum + (item.normalizedScore || 0), 0) / data.length;
    const topScore = Math.max(...data.map((item) => item.totalScore || 0));
    return { avg: Math.round(avg), topScore, people: data.length };
  }, [data]);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((item) => {
      const name = getDisplayName(item.user).toLowerCase();
      const position = (item.user?.position || "").toLowerCase();
      return name.includes(query) || position.includes(query);
    });
  }, [data, search]);

  const chartData = useMemo(
    () =>
      (trendData || []).map((point) => ({
        ...point,
        label: formatTrendLabel(point.period, type),
      })),
    [trendData, type]
  );

  const handleRowClick = (userId) => {
    if (!userId) return;
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
      fetchData();
    } catch (err) {
      console.error("Failed to update score", err);
    }
  };

  const ptsBehind = ahead
    ? Math.max(0, (ahead.totalScore || 0) - (myEntry?.totalScore || 0))
    : 0;

  return (
    <section className="flex flex-col h-full overflow-y-auto gap-y-3">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#0A1629]">Leaderboard</h1>
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-100 rounded-full text-[11px] font-bold text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            How it works
          </button>

          <div className="relative">
            <select
              value={selectedPeriodKey}
              onChange={(e) => setPeriodKey(e.target.value)}
              className="appearance-none bg-white border border-gray-100 rounded-full pl-3 pr-8 py-1.5 text-[11px] font-bold text-[#0A1629] focus:outline-none focus:ring-2 focus:ring-[#3F8CFF]/30 min-w-[170px]"
            >
              {periodOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#7D8592] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex bg-white p-1 rounded-full border border-gray-100">
            {["weekly", "monthly"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                  type === t
                    ? "bg-[#3F8CFF] text-white shadow-sm"
                    : "text-[#7D8592] hover:bg-[#F4F9FD]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center flex-1 min-h-[40vh]">
          <LoadingSpinner />
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#0A1629]">No rankings yet</h3>
          <p className="text-xs text-[#7D8592] mt-1">
            No performance records found for {selectedPeriodLabel}.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] font-bold text-[#7D8592] uppercase tracking-wide">Your rank</p>
              <p className="text-sm font-black text-[#0A1629] mt-0.5">
                {myEntry ? `#${myIndex + 1}` : "—"}
                <span className="ml-1 text-[10px] font-bold text-[#7D8592]">
                  of {summary.people}
                </span>
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] font-bold text-[#7D8592] uppercase tracking-wide">Team average</p>
              <p className="text-sm font-black text-[#0A1629] mt-0.5">
                {summary.avg}%
                <span className="ml-1 text-[10px] font-bold text-[#7D8592]">of target</span>
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] font-bold text-[#7D8592] uppercase tracking-wide">Top score</p>
              <p className="text-sm font-black text-[#0A1629] mt-0.5">
                {summary.topScore}
                <span className="ml-1 text-[10px] font-bold text-[#7D8592]">pts</span>
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] font-bold text-[#7D8592] uppercase tracking-wide">Ranked</p>
              <p className="text-sm font-black text-[#0A1629] mt-0.5 inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#3F8CFF]" />
                {summary.people}
              </p>
            </div>
          </div>

          {myEntry && (
            <div className="bg-white rounded-xl border border-blue-100 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar user={myEntry.user} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0A1629]">
                    You are #{myIndex + 1} this {type === "weekly" ? "week" : "month"}
                  </p>
                  <p className="text-[11px] text-[#7D8592]">
                    {myEntry.totalScore || 0} pts · {Math.round(myEntry.normalizedScore || 0)}% of
                    target
                    {ahead
                      ? ` · ${ptsBehind} pts behind ${getDisplayName(ahead.user)}`
                      : " · you’re in first place"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/my-points")}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3F8CFF] hover:underline shrink-0"
              >
                View my points
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {data.slice(0, 3).map((item, index) => {
              const style = RANK_STYLES[index];
              const Icon = style.icon;
              const mine = isSameUser(item.user, currentUser);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleRowClick(item.user?._id)}
                  className={`text-left rounded-xl border p-3 flex items-center gap-3 hover:border-blue-200 transition-colors ${style.card} ${
                    mine ? "ring-1 ring-[#3F8CFF]/30" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${style.badge}`}
                  >
                    {index + 1}
                  </div>
                  <Avatar user={item.user} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#0A1629] truncate">
                      {getDisplayName(item.user)}
                      {mine && (
                        <span className="ml-1 text-[9px] font-black text-[#3F8CFF] uppercase">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-[#7D8592] truncate">{item.user?.position}</p>
                    <div className="mt-1 h-1 bg-white/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar}`}
                        style={{
                          width: `${Math.min(100, Math.round(item.normalizedScore || 0))}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#7D8592] ml-auto mb-1" />
                    <p className="text-xs font-black text-[#0A1629]">
                      {Math.round(item.normalizedScore || 0)}%
                    </p>
                    <p className="text-[10px] font-bold text-[#7D8592]">{item.totalScore} pts</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex-1">
            <div className="xl:col-span-8 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-3.5 py-2.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#7D8592]" />
                  <h2 className="text-sm font-bold text-[#0A1629]">Full ranking</h2>
                  <span className="text-[11px] font-medium text-[#7D8592]">
                    {filteredData.length} {filteredData.length === 1 ? "person" : "people"}
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#7D8592] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or role..."
                    className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs bg-[#F4F9FD] border border-gray-100 rounded-full outline-none focus:ring-2 focus:ring-[#3F8CFF]/20 focus:border-blue-200"
                  />
                </div>
              </div>

              {filteredData.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#7D8592]">
                  No one matches “{search}”.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[640px]">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold text-[#7D8592] tracking-wide border-b border-gray-100">
                        <th className="px-3.5 py-2.5 w-12">Rank</th>
                        <th className="px-3.5 py-2.5">Person</th>
                        <th className="px-3.5 py-2.5">Activity</th>
                        <th className="px-3.5 py-2.5">Attendance</th>
                        <th className="px-3.5 py-2.5">Penalties</th>
                        <th className="px-3.5 py-2.5">Score</th>
                        <th className="px-3.5 py-2.5 w-12" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item) => {
                        const index = data.findIndex((row) => row._id === item._id);
                        const mine = isSameUser(item.user, currentUser);
                        return (
                          <tr
                            key={item._id}
                            onClick={() => handleRowClick(item.user?._id)}
                            className={`border-b border-gray-50 last:border-0 cursor-pointer hover:bg-[#F4F9FD] transition-colors ${
                              mine ? "bg-blue-50/60" : ""
                            }`}
                          >
                            <td className="px-3.5 py-2.5">
                              <span
                                className={`text-xs font-black ${
                                  index < 3 ? "text-[#0A1629]" : "text-[#7D8592]"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar user={item.user} size="w-8 h-8" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-[#0A1629] truncate">
                                    {getDisplayName(item.user)}
                                    {mine && (
                                      <span className="ml-1.5 text-[9px] font-black uppercase tracking-wide text-[#3F8CFF] bg-blue-100/80 px-1.5 py-0.5 rounded-full">
                                        You
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-[#7D8592] truncate">
                                    {item.user?.position || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <p className="text-xs font-bold text-emerald-600">
                                +{item.activityScore || 0}
                              </p>
                              <p className="text-[10px] text-[#7D8592]">
                                {item.meta?.totalTasks || 0} tasks
                              </p>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <p className="text-xs font-bold text-[#3F8CFF]">
                                +{item.attendanceScore || 0}
                              </p>
                              <p className="text-[10px] text-[#7D8592]">
                                {item.meta?.attendanceDays || 0} days
                                {item.meta?.lateArrivals > 0
                                  ? ` · ${item.meta.lateArrivals} late`
                                  : ""}
                              </p>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <p
                                className={`text-xs font-bold ${
                                  item.penaltyScore > 0 ? "text-rose-500" : "text-[#7D8592]"
                                }`}
                              >
                                {item.penaltyScore > 0 ? `−${item.penaltyScore}` : "0"}
                              </p>
                              <p className="text-[10px] text-[#7D8592]">
                                {item.meta?.lateTasks || 0} late · {item.meta?.reworkCount || 0}{" "}
                                rework
                              </p>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-[#0A1629]">
                                  {Math.round(item.normalizedScore || 0)}%
                                </span>
                                {item.bonusScore ? (
                                  <span
                                    className={`text-[9px] font-bold ${
                                      item.bonusScore > 0 ? "text-amber-600" : "text-rose-500"
                                    }`}
                                  >
                                    {item.bonusScore > 0 ? "+" : ""}
                                    {item.bonusScore} bonus
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-1 h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#3F8CFF]"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(item.normalizedScore || 0)
                                    )}%`,
                                  }}
                                />
                              </div>
                              <p className="text-[10px] text-[#7D8592] mt-0.5">
                                {item.totalScore || 0} pts
                              </p>
                            </td>
                            <td className="px-3.5 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {currentUser?.role === "company-admin" && isCurrentPeriod && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setScoreForm({
                                        points: "",
                                        targetScore: item.targetScore || 1000,
                                        reason: "",
                                      });
                                      setScoreModal({
                                        isOpen: true,
                                        user: item.user,
                                        item,
                                      });
                                    }}
                                    className="p-1.5 rounded-lg text-[#7D8592] hover:bg-blue-50 hover:text-[#3F8CFF]"
                                    title="Adjust score"
                                  >
                                    <Settings className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="xl:col-span-4 bg-white rounded-xl border border-gray-100 p-3.5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0A1629]">Team trend</h3>
                  <p className="text-[10px] text-[#7D8592] font-medium">
                    Average % of target
                  </p>
                </div>
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5 text-[#3F8CFF]" />
                </div>
              </div>
              {chartData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-[#7D8592]">
                  No trend data yet
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3F8CFF" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#3F8CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#7D8592" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Average"]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="average"
                        stroke="#3F8CFF"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorAvg)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="text-[11px] text-[#7D8592] mt-3 leading-relaxed">
                Rank is based on % of each person’s target, not raw points, so different roles stay
                comparable.
              </p>
            </div>
          </div>
        </>
      )}

      <ScoringGuideDrawer isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <AnimatePresence>
        {scoreModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-base font-bold text-[#0A1629]">
                  Adjust score · {scoreModal.user?.firstName}
                </h3>
                <button
                  type="button"
                  onClick={() => setScoreModal({ isOpen: false, user: null, item: null })}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAdminScoreSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target score</label>
                  <input
                    type="number"
                    value={scoreForm.targetScore}
                    onChange={(e) => setScoreForm({ ...scoreForm, targetScore: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8CFF]/50"
                    placeholder="e.g. 1000"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Used to calculate this person’s percentage on the board.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bonus / penalty points
                  </label>
                  <input
                    type="number"
                    value={scoreForm.points}
                    onChange={(e) => setScoreForm({ ...scoreForm, points: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8CFF]/50"
                    placeholder="e.g. 50 or -20"
                  />
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
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setScoreModal({ isOpen: false, user: null, item: null })}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-[#3F8CFF] hover:bg-blue-600 rounded-xl"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Leaderboard;
