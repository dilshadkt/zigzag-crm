import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSave, FiAlertCircle, FiStar, FiClock, FiTarget, FiCheckCircle, FiUserCheck, FiXCircle, FiShield } from "react-icons/fi";
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
    baseTargetScore: 1000,
    // Two-Tier Review Scoring
    internalReviewApprovalPoints: 25,
    internalReviewRejectionPenalty: 10,
    clientApprovalPoints: 30,
    clientRejectionPenalty: 15,
  });

  useEffect(() => {
    if (data?.company?.gamificationSettings) {
      setSettings(prev => ({ ...prev, ...data.company.gamificationSettings }));
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

        {/* Coordinator Review Settings */}
        <div className="border-t border-gray-200 pt-5 mt-1">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-indigo-600 w-5 h-5" />
            <h3 className="text-sm font-bold text-gray-800">Coordinator Review Timeliness</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Reviewer Penalties</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Points awarded/deducted from the <strong>reviewer or coordinator</strong> based on how quickly they action a task in review.
            This is separate from employee rejection penalties below — it measures review speed, not task quality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FiClock className="text-indigo-500" /> Review Time Limit (Hours)
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Maximum hours a coordinator has to review a task before a delay penalty applies.
              </p>
              <input
                type="number"
                name="coordinatorReviewTimeLimit"
                value={settings.coordinatorReviewTimeLimit}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FiAlertCircle className="text-amber-500" /> Coordinator Review Delay Penalty
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Points deducted from the <strong>reviewer</strong> when they exceed the time limit above.
                Does not affect the assigned employee.
              </p>
              <input
                type="number"
                name="coordinatorPenaltyPoints"
                value={settings.coordinatorPenaltyPoints}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm w-full transition-all"
              />
            </div>
          </div>
        </div>

        {/* Two-Tier Review Scoring Section */}
        <div className="border-t border-gray-200 pt-5 mt-1">
          <div className="flex items-center gap-2 mb-4">
            <FiUserCheck className="text-violet-600 w-5 h-5" />
            <h3 className="text-sm font-bold text-gray-800">Two-Tier Review Scoring</h3>
            <span className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Employee Rewards</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Points awarded/deducted from the <strong>assigned employee</strong> when their task passes or fails
            internal review and client review stages. These are quality-based penalties — not related to coordinator review speed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Internal Review Approval */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FiCheckCircle className="text-emerald-500" /> Internal Review — Approval Bonus
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Points awarded when a task passes internal review (on-review → approved).
              </p>
              <input
                type="number"
                name="internalReviewApprovalPoints"
                value={settings.internalReviewApprovalPoints !== undefined ? settings.internalReviewApprovalPoints : 25}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm w-full transition-all"
              />
            </div>

            {/* Internal Review Rejection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FiXCircle className="text-orange-500" /> Internal Review — Rejection Penalty
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Points deducted when a task is sent back for rework after internal review.
              </p>
              <input
                type="number"
                name="internalReviewRejectionPenalty"
                value={settings.internalReviewRejectionPenalty !== undefined ? settings.internalReviewRejectionPenalty : 10}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm w-full transition-all"
              />
            </div>

            {/* Client Approval */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FiCheckCircle className="text-blue-500" /> Client Review — Approval Bonus
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Points awarded when a client approves the task (approved → client-approved).
              </p>
              <input
                type="number"
                name="clientApprovalPoints"
                value={settings.clientApprovalPoints !== undefined ? settings.clientApprovalPoints : 30}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full transition-all"
              />
            </div>

            {/* Client Rejection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FiXCircle className="text-red-500" /> Client Review — Rejection Penalty
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Points deducted when a client rejects the task and sends it back for rework.
              </p>
              <input
                type="number"
                name="clientRejectionPenalty"
                value={settings.clientRejectionPenalty !== undefined ? settings.clientRejectionPenalty : 15}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm w-full transition-all"
              />
            </div>
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
