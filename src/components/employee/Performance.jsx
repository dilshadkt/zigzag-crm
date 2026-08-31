import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  Plus, 
  TrendingUp, 
  Target, 
  Zap,
  BarChart3,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getMyPerformance, getEmployeePerformance } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";
import { usePermissions } from "../../hooks/usePermissions";
import { useResetEmployeePerformance } from "../../api/hooks";
import CEOBonusModal from "../performance/CEOBonusModal";
import Modal from "../shared/modal";
import socketService from "../../services/socketService";

const Performance = ({ employeeId, selectedMonth }) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsLedger, setPointsLedger] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const { isAdmin } = usePermissions();
  const resetEmployeeScores = useResetEmployeePerformance();

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

  useEffect(() => {
    fetchPerformance();
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    const handlePointsAwarded = (data) => {
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
      let res;
      if (employeeId) {
        // Use specifically target employee and period
        res = await getEmployeePerformance(employeeId, "monthly", selectedMonth);
      } else {
        res = await getMyPerformance("monthly");
      }

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

  if (loading) return <div className="flex justify-center p-20"><LoadingSpinner /></div>;

  const scoreItems = [
    { 
      label: "Activity Score", 
      score: performance?.activityScore || 0, 
      isPenalty: false,
      icon: <Target className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-500",
      description: "Points from completed tasks" 
    },
    { 
      label: "Attendance Score", 
      score: performance?.attendanceScore || 0, 
      isPenalty: false,
      icon: <Clock className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-500",
      description: "Points for punctuality & presence" 
    },
    { 
      label: "Penalties & Deductions", 
      score: performance?.penaltyScore || 0, 
      isPenalty: true,
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-500",
      description: "Deductions for delays and mistakes" 
    },
    { 
      label: "Bonus / Admin Points", 
      score: performance?.bonusScore || 0, 
      isPenalty: false,
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-500",
      description: "Special recognition & adjustments" 
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Summary Score Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8"
      >
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80" cy="80" r="70"
              stroke="#f3f4f6"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="80" cy="80" r="70"
              stroke="#3b82f6"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={440}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * Math.min(100, Math.max(0, performance?.normalizedScore || 0))) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-gray-800">{Math.round(performance?.normalizedScore || 0)}%</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{performance?.totalScore || 0} Pts</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800">Performance Status</h2>
          </div>
          <p className="text-gray-500">
            {performance?.totalScore >= 90 ? "Exceptional work! You're a top performer this month." : 
             performance?.totalScore >= 75 ? "Great job! Your consistency is impressive." : 
             performance?.totalScore >= 50 ? "Steady progress. Keep focusing on timeliness." : 
             "Room for improvement. Reach out to your lead for guidance."}
          </p>
          <div className="flex gap-4 pt-4">
             <div className="px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-2">
               <BarChart3 className="w-4 h-4 text-blue-600" />
               <span className="text-sm font-bold text-blue-700">Top 10%</span>
             </div>
             {isAdmin() && (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="px-4 py-2 bg-purple-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-600/20 hover:scale-105 transition-transform flex items-center gap-2"
               >
                 <Plus className="w-4 h-4" />
                 Give Bonus
               </button>
             )}
             {isAdmin() && employeeId && (
               <button
                 onClick={() => setShowResetModal(true)}
                 className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
               >
                 <RotateCcw className="w-4 h-4" />
                 Reset Scores
               </button>
             )}
          </div>
        </div>
      </motion.div>

      {/* CEO Bonus Modal */}
      <CEOBonusModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employeeId={employeeId} 
        onBonusAdded={fetchPerformance} 
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
                Every scoring period for this employee is deleted and they start from
                zero. Work and attendance recorded before now stops counting, so the
                score will not build back up on its own. Bonus history is lost
                permanently.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Other employees are not affected.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleResetScores}
              disabled={resetEmployeeScores.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {resetEmployeeScores.isPending ? "Resetting..." : "Reset Scores"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scoreItems.map((item, idx) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{item.label}</h3>
                  <p className="text-[10px] text-gray-400">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${item.isPenalty ? 'text-rose-500' : 'text-gray-800'}`}>
                  {item.isPenalty ? "-" : "+"}{item.score}
                </span>
                <span className="text-xs text-gray-400 font-bold ml-1">pts</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Meta Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Completed tasks", value: performance?.meta?.totalTasks || 0, icon: <TrendingUp className="w-4 h-4 text-blue-500" /> },
          { label: "Late Tasks", value: performance?.meta?.lateTasks || 0, icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
          { label: "Rework Count", value: performance?.meta?.reworkCount || 0, icon: <Zap className="w-4 h-4 text-purple-500" /> },
          { label: "Late Arrivals", value: performance?.meta?.lateArrivals || 0, icon: <Clock className="w-4 h-4 text-orange-500" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            {stat.icon}
            <div>
              <div className="text-sm font-bold text-gray-800">{stat.value}</div>
              <div className="text-[10px] text-gray-400 uppercase font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Points Ledger Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Points History</h2>
            <p className="text-xs text-gray-500">A detailed ledger of how points were earned and lost this period.</p>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {pointsLedger.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No point history available for this period.</div>
          ) : (
            pointsLedger.map((entry, idx) => (
              <div 
                key={entry.id || idx} 
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${entry.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {entry.type === 'earned' ? <Plus className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{entry.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{entry.reason}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(entry.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`text-lg font-black ${entry.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.points > 0 ? `+${entry.points}` : entry.points}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Performance;
