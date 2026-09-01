import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Award, History } from "lucide-react";
import { getMyPerformance } from "../../api/service";
import LoadingSpinner from "../../components/LoadingSpinner";
import PointsLedgerList from "../../components/performance/PointsLedgerList";
import socketService from "../../services/socketService";

const MyPoints = () => {
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
              Complete tasks on time or clock in on schedule to start earning gamification points.
            </p>
          </div>
        ) : (
          <PointsLedgerList
            entries={pointsLedger}
            layout="grid"
            emptyMessage="No points activity yet"
          />
        )}
      </div>
    </div>
  );
};

export default MyPoints;
