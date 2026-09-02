import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Clock,
  History,
  Lightbulb,
  Plus,
  RotateCcw,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMyPerformance, getEmployeePerformance } from "../../api/service";
import { usePermissions } from "../../hooks/usePermissions";
import { useResetEmployeePerformance, useUpdatePerformanceLedgerEntry, useDeletePerformanceLedgerEntry } from "../../api/hooks";
import CEOBonusModal from "../performance/CEOBonusModal";
import PointsLedgerList from "../performance/PointsLedgerList";
import ScoringGuideDrawer from "../performance/ScoringGuideDrawer";
import EditLedgerEntryModal from "../performance/EditLedgerEntryModal";
import Modal from "../shared/modal";
import Progress from "../shared/progress";
import socketService from "../../services/socketService";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "earned", label: "Earned" },
  { key: "lost", label: "Lost" },
];

const getMonthLabel = (selectedMonth) => {
  if (!selectedMonth) return format(new Date(), "MMMM yyyy");
  const [year, month] = selectedMonth.split("-");
  if (!year || !month) return selectedMonth;
  return format(new Date(Number(year), Number(month) - 1, 1), "MMMM yyyy");
};

const getStatus = (normalized) => {
  if (normalized >= 100) {
    return {
      label: "Target reached",
      tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
      message: "This month's target is met. Consistent, on-time work is paying off.",
    };
  }
  if (normalized >= 75) {
    return {
      label: "On track",
      tone: "text-[#3F8CFF] bg-blue-50 border-blue-100",
      message: "Strong progress toward the monthly target. Keep finishing work on time.",
    };
  }
  if (normalized >= 40) {
    return {
      label: "Building up",
      tone: "text-amber-600 bg-amber-50 border-amber-100",
      message: "Solid start. Closing tasks on time and staying punctual will lift this score.",
    };
  }
  return {
    label: "Needs attention",
    tone: "text-rose-500 bg-rose-50 border-rose-100",
    message: "Score is still low for this month. Review late tasks, rework, and attendance.",
  };
};

const Performance = ({ employeeId, selectedMonth }) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsLedger, setPointsLedger] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [removingEntry, setRemovingEntry] = useState(null);
  const { isAdmin } = usePermissions();
  const resetEmployeeScores = useResetEmployeePerformance();
  const updateLedgerEntry = useUpdatePerformanceLedgerEntry();
  const deleteLedgerEntry = useDeletePerformanceLedgerEntry();
  const canManageLedger = Boolean(isAdmin() && employeeId);

  const ledgerPayload = (entry, extra = {}) => ({
    periodKey: selectedMonth,
    ledgerKey: entry.id,
    category: entry.category,
    source: entry.source,
    bonusHistoryId: entry.bonusHistoryId,
    originalPoints: entry.points,
    ...extra,
  });

  const handleResetScores = () => {
    resetEmployeeScores.mutate(employeeId, {
      onSuccess: (res) => {
        toast.success(res?.message || "Employee scores reset");
        setShowResetModal(false);
        fetchPerformance();
      },
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Failed to reset scores"),
    });
  };

  const handleSaveLedgerEntry = ({ points, reason }) => {
    if (!editingEntry) return;
    updateLedgerEntry.mutate(
      {
        employeeId,
        payload: ledgerPayload(editingEntry, { points, reason }),
      },
      {
        onSuccess: () => {
          toast.success("Score updated");
          setEditingEntry(null);
          fetchPerformance();
        },
        onError: (err) =>
          toast.error(err?.response?.data?.message || "Failed to update score"),
      }
    );
  };

  const handleConfirmRemoveLedgerEntry = () => {
    if (!removingEntry) return;
    deleteLedgerEntry.mutate(
      {
        employeeId,
        payload: ledgerPayload(removingEntry),
      },
      {
        onSuccess: () => {
          toast.success("Score removed");
          setRemovingEntry(null);
          fetchPerformance();
        },
        onError: (err) =>
          toast.error(err?.response?.data?.message || "Failed to remove score"),
      }
    );
  };

  useEffect(() => {
    fetchPerformance();
  }, [employeeId, selectedMonth]);

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
  }, [employeeId, selectedMonth]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = employeeId
        ? await getEmployeePerformance(employeeId, "monthly", selectedMonth)
        : await getMyPerformance("monthly");

      if (res.success) {
        setPerformance(res.performance);
        setPointsLedger(res.pointsLedger || []);
      }
    } catch (err) {
      console.error("Error fetching performance:", err);
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

  const totalScore = performance?.totalScore || 0;
  const targetScore = performance?.targetScore || 1000;
  const normalizedScore = Math.round(
    Math.max(0, performance?.normalizedScore || 0)
  );
  const status = getStatus(normalizedScore);
  const monthLabel = getMonthLabel(selectedMonth);

  const scoreCards = [
    {
      label: "Activity",
      value: performance?.activityScore || 0,
      icon: Target,
      tone: "text-[#3F8CFF] bg-blue-50 border-blue-100",
      hint: "Tasks completed",
    },
    {
      label: "Attendance",
      value: performance?.attendanceScore || 0,
      icon: Clock,
      tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
      hint: "On-time presence",
    },
    {
      label: "Penalties",
      value: performance?.penaltyScore || 0,
      prefix: "-",
      icon: AlertCircle,
      tone: "text-rose-500 bg-rose-50 border-rose-100",
      hint: "Late work & delays",
    },
    {
      label: "Bonus",
      value: performance?.bonusScore || 0,
      icon: Zap,
      tone: "text-violet-600 bg-violet-50 border-violet-100",
      hint: "Admin recognition",
    },
  ];

  const workStats = [
    {
      label: "Completed tasks",
      value: performance?.meta?.totalTasks || 0,
      icon: TrendingUp,
      tone: "text-[#3F8CFF] bg-blue-50",
    },
    {
      label: "Late tasks",
      value: performance?.meta?.lateTasks || 0,
      icon: AlertCircle,
      tone: "text-rose-500 bg-rose-50",
    },
    {
      label: "Rework",
      value: performance?.meta?.reworkCount || 0,
      icon: RotateCcw,
      tone: "text-violet-600 bg-violet-50",
    },
    {
      label: "Late arrivals",
      value: performance?.meta?.lateArrivals || 0,
      icon: Clock,
      tone: "text-amber-600 bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[280px]">
        <div className="w-8 h-8 border-4 border-[#E6EBF5] border-t-[#3F8CFF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h4 className="font-semibold text-lg text-[#0A1629]">Performance</h4>
          <p className="text-[11px] text-[#7D8592] font-medium mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {monthLabel}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-100 rounded-full text-[11px] font-bold text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            How it works
          </button>

          {isAdmin() && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3F8CFF] text-white rounded-full text-[11px] font-bold hover:bg-[#3F8CFF]/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Give bonus
            </button>
          )}

          {isAdmin() && employeeId && (
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-100 text-red-600 rounded-full text-[11px] font-bold hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset scores
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-5 flex flex-col md:flex-row md:items-center gap-5">
        <div className="relative w-fit shrink-0">
          <Progress
            size={88}
            currentValue={normalizedScore}
            target={100}
            strokeWidth={5}
            DefaultPathColor="#3F8CFF"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#0A1629] leading-none">
              {normalizedScore}%
            </span>
            <span className="text-[9px] font-bold text-[#7D8592] uppercase tracking-wide mt-1">
              of target
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-[#0A1629]">Monthly score</h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.tone}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-xs text-[#7D8592] leading-relaxed max-w-xl">
            {status.message}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
              <span className="text-[#7D8592]">
                {totalScore} of {targetScore} pts
              </span>
              <span className="inline-flex items-center gap-2 text-[#7D8592]">
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  +{earnedTotal}
                </span>
                <span className="w-px h-3 bg-gray-200" />
                <span className="inline-flex items-center gap-1 text-rose-500">
                  <TrendingDown className="w-3 h-3" />
                  -{lostTotal}
                </span>
              </span>
            </div>
            <div className="w-full bg-[#F4F9FD] rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-[#3F8CFF] transition-all duration-500"
                style={{ width: `${Math.min(100, normalizedScore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {scoreCards.map((stat) => {
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
                <p className="text-sm font-bold text-[#0A1629] leading-tight">
                  {stat.prefix || ""}
                  {stat.value}
                  <span className="ml-1 text-[10px] font-bold text-[#7D8592]">
                    pts
                  </span>
                </p>
                <p className="text-[10px] text-[#7D8592] truncate">{stat.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {workStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2.5"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.tone}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A1629] leading-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold text-[#7D8592] uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-3 md:p-4">
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
                ? "Completed tasks, attendance, and bonuses for this month will show up here."
                : "Try another filter to see the rest of this month's history."}
            </p>
          </div>
        ) : (
          <PointsLedgerList
            entries={filteredLedger}
            layout="list"
            emptyMessage="No points activity yet"
            canManage={canManageLedger}
            onEdit={setEditingEntry}
            onRemove={setRemovingEntry}
          />
        )}
      </div>

      <CEOBonusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeId={employeeId}
        onBonusAdded={fetchPerformance}
      />

      <EditLedgerEntryModal
        isOpen={Boolean(editingEntry)}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveLedgerEntry}
        saving={updateLedgerEntry.isPending}
      />

      <Modal
        isOpen={Boolean(removingEntry)}
        onClose={() => setRemovingEntry(null)}
        title="Remove this score"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Remove{" "}
            <span className="font-semibold">{removingEntry?.title}</span>
            {typeof removingEntry?.points === "number"
              ? ` (${removingEntry.points > 0 ? "+" : ""}${removingEntry.points} pts)`
              : ""}
            . The monthly total will update immediately.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRemovingEntry(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemoveLedgerEntry}
              disabled={deleteLedgerEntry.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl disabled:opacity-50"
            >
              {deleteLedgerEntry.isPending ? "Removing..." : "Remove score"}
            </button>
          </div>
        </div>
      </Modal>

      <ScoringGuideDrawer
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        performance={performance}
      />

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset This Employee's Scores"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50/60 rounded-xl border border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-red-700">This cannot be undone.</p>
              <p className="mt-1">
                Every scoring period for this employee is deleted and they start
                from zero. Work and attendance recorded before now stops
                counting, so the score will not build back up on its own. Bonus
                history is lost permanently.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Other employees are not affected.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetScores}
              disabled={resetEmployeeScores.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {resetEmployeeScores.isPending ? "Resetting..." : "Reset Scores"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Performance;
