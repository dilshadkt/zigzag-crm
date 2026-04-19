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
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { getMyPerformance, getEmployeePerformance } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";
import { usePermissions } from "../../hooks/usePermissions";
import CEOBonusModal from "../performance/CEOBonusModal";

const Performance = ({ employeeId, selectedMonth }) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = usePermissions();

  useEffect(() => {
    fetchPerformance();
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
      label: "Task Execution", 
      score: performance?.executionScore || 0, 
      max: 40, 
      icon: <Target className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-500",
      description: "Timeliness of subtasks" 
    },
    { 
      label: "Quality", 
      score: performance?.qualityScore || 0, 
      max: 30, 
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-500",
      description: "Error-free completion" 
    },
    { 
      label: "Attendance", 
      score: performance?.attendanceScore || 0, 
      max: 20, 
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      color: "bg-orange-500",
      description: "Punctuality & Discipline" 
    },
    { 
      label: "CEO/Creativity Bonus", 
      score: performance?.bonusScore || 0, 
      max: 10, 
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-500",
      description: "Special recognition" 
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
              animate={{ strokeDashoffset: 440 - (440 * (performance?.totalScore || 0)) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-gray-800">{performance?.totalScore || 0}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Pts</span>
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
                <span className="text-xl font-black text-gray-800">{item.score}</span>
                <span className="text-xs text-gray-400 font-bold">/{item.max}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <motion.div 
                  className={`h-full ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / item.max) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                <span>Effort</span>
                <span>{Math.round((item.score / item.max) * 100)}%</span>
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
    </div>
  );
};

export default Performance;
