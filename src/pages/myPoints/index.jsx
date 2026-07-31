import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Clock, Award, History, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyPerformance } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";
import { format } from "date-fns";
import socketService from "../../services/socketService";

const MyPoints = () => {
  const navigate = useNavigate();
  const [performance, setPerformance] = useState(null);
  const [pointsLedger, setPointsLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  useEffect(() => {
    const handlePointsAwarded = (data) => {
      // Re-fetch performance data to update the ledger and total score instantly
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

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pt-2 pb-10 px-4 md:px-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-500" />
            My Gamification Points
          </h1>
          <p className="text-gray-500 mt-1">
            Track your performance, rewards, and penalties for the current period.
          </p>
        </div>

        {/* Current Score Pill */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm text-white"
        >
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-blue-100 uppercase tracking-widest">Total Score</p>
            <p className="text-2xl font-black leading-none">{performance?.totalScore || 0} <span className="text-xs font-bold text-blue-200">PTS</span></p>
          </div>
        </motion.div>
      </div>

      {/* Points Ledger Timeline */}
      <div className="bg-transparent p-0">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
          <History className="w-4 h-4 text-gray-400" />
          <h2 className="text-base font-bold text-gray-800">Points History Ledger</h2>
        </div>

        {pointsLedger.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <Zap className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No points activity yet</h3>
            <p className="text-gray-500 mt-2 max-w-md text-sm">
              Complete tasks on time or review tasks efficiently to start earning gamification points.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pointsLedger.map((entry, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={entry.id + idx}
                onClick={() => {
                  if (entry.projectId && entry.parentTaskId && entry.taskId) {
                    navigate(`/projects/${entry.projectId}/${entry.parentTaskId}?subTaskId=${entry.taskId}`);
                  } else if (entry.projectId && entry.taskId) {
                    // Fallback for older entries where parentTaskId wasn't recorded
                    navigate(`/projects/${entry.projectId}?subtask=${entry.taskId}`);
                  }
                }}
                className={`group flex rounded-xl border border-gray-200 bg-white transition-all duration-300 overflow-hidden ${
                  (entry.projectId && entry.taskId) ? "cursor-pointer hover:border-blue-300 hover:shadow-md" : "hover:border-gray-300"
                }`}
              >
                {/* Left Ticket Stub */}
                <div className={`flex flex-col items-center justify-center p-3 border-r-2 border-dashed ${
                  entry.type === 'earned' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : 'bg-red-50 border-red-200 text-red-600'
                } w-20 flex-shrink-0`}>
                  {entry.type === 'earned' ? <TrendingUp className="w-4 h-4 mb-1 opacity-80" /> : <TrendingDown className="w-4 h-4 mb-1 opacity-80" />}
                  <span className="text-xl font-black leading-none">
                    {entry.type === 'earned' ? '+' : ''}{entry.points}
                  </span>
                  <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">Pts</span>
                </div>

                {/* Right Ticket Body */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {entry.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {entry.reason}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded w-fit">
                    <Clock className="w-2.5 h-2.5 mr-1 text-gray-400" />
                    {format(new Date(entry.date), "MMM do yyyy, h:mm a")}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPoints;
