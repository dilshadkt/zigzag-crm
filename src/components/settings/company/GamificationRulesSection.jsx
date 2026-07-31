import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSave, FiAlertCircle, FiStar, FiClock, FiTarget } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { useGetCompany, useUpdateCompany } from "../../../api/hooks";

const GamificationRulesSection = () => {
  const { companyId } = useAuth();
  
  const { data, isLoading } = useGetCompany(companyId);
  const updateCompany = useUpdateCompany();
  
  const [settings, setSettings] = useState({
    taskCompletePoints: 10,
    taskPenaltyPoints: 10,
    coordinatorPenaltyPoints: 15,
    dailyChecklistPoints: 5,
    dailyChecklistPenaltyPoints: 5,
    earlyLeaveRequestPoints: 10,
    lateLeaveRequestPenaltyPoints: 10,
    coordinatorReviewTimeLimit: 4,
    baseTargetScore: 1000
  });

  useEffect(() => {
    if (data?.company?.gamificationSettings) {
      setSettings(data.company.gamificationSettings);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = () => {
    updateCompany.mutate(
      { companyId, data: { gamificationSettings: settings } },
      {
        onSuccess: () => {
          toast.success("Gamification settings saved successfully");
        },
        onError: () => {
          toast.error("Failed to save gamification settings");
        }
      }
    );
  };

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading settings...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Target Score */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiTarget className="text-blue-500" /> Default Target Score
            </label>
            <p className="text-xs text-gray-500 mb-1">
              The base target score expected per employee per period.
            </p>
            <input
              type="number"
              name="baseTargetScore"
              value={settings.baseTargetScore}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Task Completion Points */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiStar className="text-green-500" /> Task Completion Bonus
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points awarded for completing a task on time (multipled by weight).
            </p>
            <input
              type="number"
              name="taskCompletePoints"
              value={settings.taskCompletePoints}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Task Overdue Penalty */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiClock className="text-red-500" /> Task Overdue Penalty
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points deducted when an employee misses a deadline.
            </p>
            <input
              type="number"
              name="taskPenaltyPoints"
              value={settings.taskPenaltyPoints}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Coordinator Penalty */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiAlertCircle className="text-amber-500" /> Review Delay Penalty
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points deducted for Coordinators who fail to review tasks within the time limit.
            </p>
            <input
              type="number"
              name="coordinatorPenaltyPoints"
              value={settings.coordinatorPenaltyPoints}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Coordinator Time Limit */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiClock className="text-indigo-500" /> Review Time Limit (Hours)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Maximum hours allowed for a Coordinator to review a task.
            </p>
            <input
              type="number"
              name="coordinatorReviewTimeLimit"
              value={settings.coordinatorReviewTimeLimit}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Daily Checklist Points */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiStar className="text-purple-500" /> Daily Checklist Bonus
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points awarded when a user completes all daily checklist items.
            </p>
            <input
              type="number"
              name="dailyChecklistPoints"
              value={settings.dailyChecklistPoints !== undefined ? settings.dailyChecklistPoints : 5}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Daily Checklist Penalty */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiAlertCircle className="text-red-500" /> Daily Checklist Penalty
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points deducted if a user fails to complete their daily checklist before the end of the day.
            </p>
            <input
              type="number"
              name="dailyChecklistPenaltyPoints"
              value={settings.dailyChecklistPenaltyPoints !== undefined ? settings.dailyChecklistPenaltyPoints : 5}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Early Leave Request Bonus */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiStar className="text-teal-500" /> Early Leave Bonus
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points awarded when an employee requests leave 7 or more days in advance.
            </p>
            <input
              type="number"
              name="earlyLeaveRequestPoints"
              value={settings.earlyLeaveRequestPoints !== undefined ? settings.earlyLeaveRequestPoints : 10}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>

          {/* Late Leave Request Penalty */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiAlertCircle className="text-rose-500" /> Late Leave Penalty
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points deducted when an employee requests leave on the same day or retrospectively (not in advance).
            </p>
            <input
              type="number"
              name="lateLeaveRequestPenaltyPoints"
              value={settings.lateLeaveRequestPenaltyPoints !== undefined ? settings.lateLeaveRequestPenaltyPoints : 10}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={updateCompany.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {updateCompany.isPending ? "Saving..." : "Save Gamification Rules"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamificationRulesSection;
