import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Zap,
  History,
  Calendar,
  Target,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
} from "lucide-react";
import { getMyPerformance } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";
import PointsLedgerList from "../../components/performance/PointsLedgerList";
import ScoringGuideDrawer from "../../components/performance/ScoringGuideDrawer";
import socketService from "../../services/socketService";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "earned", label: "Earned" },
  { key: "lost", label: "Lost" },
];

const MyPoints = () => {
  const [performance, setPerformance] = useState(null);
  const [pointsLedger, setPointsLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    fetchPerformance();
  }, []);

  useEffect(() => {
    const handlePointsAwarded = () => {
      setTimeout(() => {
        fetchPerformance();
      }, 500);
    };

    socketService.onPointsAwarded(handlePointsAwarded);

    return () => {
      socketService.offPointsAwarded(handlePointsAwarded);
    };
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await getMyPerformance("monthly");
      if (res.success) {
        setPerformance(res.performance);
        setPointsLedger(res.pointsLedger || []);
      }
    } catch (err) {
      console.error("Error fetching performance points:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLedger = useMemo(() => {
    if (filter === "earned") {
      return pointsLedger.filter((entry) => entry.type === "earned");
    }
    if (filter === "lost") {
      return pointsLedger.filter((entry) => entry.type !== "earned");
    }
    return pointsLedger;
  }, [pointsLedger, filter]);

  const earnedTotal = useMemo(
    () =>
      pointsLedger
        .filter((entry) => entry.type === "earned")
        .reduce((sum, entry) => sum + Math.abs(entry.points || 0), 0),
    [pointsLedger]
  );

  const lostTotal = useMemo(
    () =>
      pointsLedger
        .filter((entry) => entry.type !== "earned")
        .reduce((sum, entry) => sum + Math.abs(entry.points || 0), 0),
    [pointsLedger]
  );

  const stats = [
    {
      label: "Activity",
      value: performance?.activityScore || 0,
      icon: Target,
      tone: "text-[#3F8CFF] bg-blue-50 border-blue-100",
    },
    {
      label: "Attendance",
      value: performance?.attendanceScore || 0,
      icon: Clock,
      tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Penalties",
      value: performance?.penaltyScore || 0,
      prefix: "-",
      icon: AlertCircle,
      tone: "text-rose-500 bg-rose-50 border-rose-100",
    },
    {
      label: "Bonus",
      value: performance?.bonusScore || 0,
      icon: Zap,
      tone: "text-violet-600 bg-violet-50 border-violet-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full overflow-y-auto gap-y-3">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#0A1629]">My Points</h1>
          <p className="text-[11px] text-[#7D8592] font-medium mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(), "MMMM yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-100 rounded-full text-[11px] font-bold text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            How it works
          </button>
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[11px] font-semibold text-[#7D8592]">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              +{earnedTotal}
            </span>
            <span className="w-px h-3 bg-gray-200" />
            <span className="inline-flex items-center gap-1 text-rose-500">
              <TrendingDown className="w-3 h-3" />
              -{lostTotal}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-100 rounded-full">
            <Zap className="w-3.5 h-3.5 text-[#3F8CFF] fill-[#3F8CFF]" />
            <span className="text-sm font-black text-[#0A1629]">
              {performance?.totalScore || 0}
            </span>
            <span className="text-[10px] font-bold text-[#7D8592] uppercase">
              Pts
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2.5"
            >
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${stat.tone}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#7D8592] uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-sm font-black text-[#0A1629] leading-tight">
                  {stat.prefix || ""}
                  {stat.value}
                  <span className="ml-1 text-[10px] font-bold text-[#7D8592]">
                    pts
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#7D8592]" />
            <h2 className="text-sm font-bold text-[#0A1629]">Points history</h2>
            <span className="text-[11px] font-medium text-[#7D8592]">
              {filteredLedger.length}{" "}
              {filteredLedger.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="flex bg-[#F4F9FD] p-1 rounded-xl border border-gray-100 w-fit">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filter === item.key
                    ? "bg-[#3F8CFF] text-white shadow-sm"
                    : "text-[#7D8592] hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLedger.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 bg-[#F4F9FD] rounded-full flex items-center justify-center mb-3 border border-gray-100">
              <Zap className="w-4 h-4 text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-[#0A1629]">
              {pointsLedger.length === 0
                ? "No points activity yet"
                : `No ${filter} points this month`}
            </h3>
            <p className="text-xs text-[#7D8592] mt-1 max-w-sm">
              {pointsLedger.length === 0
                ? "Complete tasks on time or clock in on schedule to start earning points."
                : "Try another filter to see the rest of your history."}
            </p>
          </div>
        ) : (
          <PointsLedgerList
            entries={filteredLedger}
            layout="grid"
            emptyMessage="No points activity yet"
          />
        )}
      </div>

      <ScoringGuideDrawer
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        performance={performance}
      />
    </section>
  );
};

export default MyPoints;
