import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiSave, FiAlertCircle, FiStar, FiClock, FiTarget, FiCheckCircle, FiUserCheck, FiXCircle, FiShield, FiAlertTriangle, FiRotateCcw, FiCalendar } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { useGetCompany, useUpdateCompany, useResetCompanyPerformance } from "../../../api/hooks";
import Modal from "../../shared/modal";

const GamificationRulesSection = () => {
  const { companyId, user } = useAuth();
  const isCompanyAdmin = user?.role === "company-admin";

  const { data, isLoading } = useGetCompany(companyId);
  const updateCompany = useUpdateCompany();
  const resetPerformance = useResetCompanyPerformance();

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetPreview, setResetPreview] = useState(null);
  
  const [settings, setSettings] = useState({
    taskCompletePoints: 10,
    taskPenaltyPoints: 10,
    coordinatorPenaltyPoints: 15,
    dailyChecklistPoints: 5,
    dailyChecklistPenaltyPoints: 5,
    earlyLeaveRequestPoints: 10,
    lateLeaveRequestPenaltyPoints: 10,
    coordinatorReviewTimeLimit: 4,
    coordinatorReviewBonusPoints: 5,
    adminInterventionPenaltyPoints: 15,
    baseTargetScore: 1000,
    attendanceDayPoints: 5,
    lateArrivalPenaltyPoints: 5,
    lateArrivalGraceMinutes: 10,
    // Two-Tier Review Scoring
    internalReviewApprovalPoints: 25,
    internalReviewRejectionPenalty: 10,
    clientApprovalPoints: 30,
    clientRejectionPenalty: 15,
    campaignKpiBonusEnabled: false,
    campaignCtrTarget: 1,
    campaignCprMax: 0,
    campaignBudgetTolerance: 0.1,
    campaignCtrBonusPoints: 5,
    campaignCprBonusPoints: 5,
    campaignBudgetBonusPoints: 5,
    campaignKpiBonusCapPerWeek: 20,
  });

  useEffect(() => {
    if (data?.company?.gamificationSettings) {
      setSettings(prev => ({ ...prev, ...data.company.gamificationSettings }));
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
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

  const openResetModal = () => {
    setResetConfirmText("");
    setResetPreview(null);
    setShowResetModal(true);
    // Show the admin exactly how much is about to be deleted before they confirm.
    resetPerformance.mutate(
      { dryRun: true },
      {
        onSuccess: (res) => setResetPreview(res),
        onError: () => setResetPreview(null),
      }
    );
  };

  const handleResetScores = () => {
    resetPerformance.mutate(
      { dryRun: false },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Performance scores reset");
          setShowResetModal(false);
          setResetConfirmText("");
        },
        onError: (err) =>
          toast.error(
            err?.response?.data?.message || "Failed to reset performance scores"
          ),
      }
    );
  };

  const lastResetAt = data?.company?.performanceScoresResetAt;

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

          {/* Attendance Day Points */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiCalendar className="text-cyan-500" /> Attendance Day Points
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points awarded for each day the employee is present. Counted once per calendar day, however many times they clock in.
            </p>
            <input
              type="number"
              name="attendanceDayPoints"
              value={settings.attendanceDayPoints !== undefined ? settings.attendanceDayPoints : 5}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm w-full transition-all"
            />
          </div>

          {/* Late Arrival Penalty */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiAlertCircle className="text-amber-500" /> Late Arrival Penalty
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Points deducted for each day the employee clocks in after their scheduled start time.
            </p>
            <input
              type="number"
              name="lateArrivalPenaltyPoints"
              value={settings.lateArrivalPenaltyPoints !== undefined ? settings.lateArrivalPenaltyPoints : 5}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm w-full transition-all"
            />
          </div>

          {/* Late Arrival Grace */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
              <FiClock className="text-gray-500" /> Late Arrival Grace (mins)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              How many minutes past the shift start are forgiven before a clock-in counts as late. Shift times are set under Weekly Off Rules.
            </p>
            <input
              type="number"
              name="lateArrivalGraceMinutes"
              value={settings.lateArrivalGraceMinutes !== undefined ? settings.lateArrivalGraceMinutes : 10}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 text-sm w-full transition-all"
            />
          </div>
        </div>

        {/* Coordinator Review Settings */}
        <div className="border-t border-gray-200 pt-5 mt-1">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-indigo-600 w-5 h-5" />
            <h3 className="text-sm font-bold text-gray-800">Coordinator Review Timeliness</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Reviewer Incentives</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Points awarded/deducted from the <strong>reviewer or coordinator</strong> based on how quickly they action a task in review.
            This is separate from employee rejection penalties below — it measures review speed, not task quality.
            Admins are never scored; if an admin has to step in, the coordinator who missed the review is penalised instead.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <FiStar className="text-emerald-500" /> On-Time Review Bonus
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Points credited to the <strong>reviewer</strong> when they complete a review within the time limit above.
              </p>
              <input
                type="number"
                name="coordinatorReviewBonusPoints"
                value={settings.coordinatorReviewBonusPoints !== undefined ? settings.coordinatorReviewBonusPoints : 5}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm w-full transition-all"
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

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FiShield className="text-rose-500" /> Admin Intervention Penalty
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Points deducted from the <strong>project coordinator or reporter</strong> when an admin
                has to review a task in their place. The admin earns nothing.
              </p>
              <input
                type="number"
                name="adminInterventionPenaltyPoints"
                value={settings.adminInterventionPenaltyPoints !== undefined ? settings.adminInterventionPenaltyPoints : 15}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm w-full transition-all"
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

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiStar className="text-indigo-600 w-5 h-5" />
            <h3 className="text-sm font-bold text-gray-800">Campaign KPI Bonuses</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Phase 2</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Optional extras awarded when a <strong>campaign report is posted</strong>, comparing the snapshot against targets.
            Facebook sync never awards points. Weekly cap applies per campaign per person.
          </p>

          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              name="campaignKpiBonusEnabled"
              checked={!!settings.campaignKpiBonusEnabled}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Enable KPI bonuses on report submit</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">CTR target (%)</label>
              <p className="text-xs text-gray-500 mb-1">Bonus if snapshot CTR is at or above this value.</p>
              <input type="number" step="0.01" name="campaignCtrTarget" value={settings.campaignCtrTarget ?? 1} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">CTR bonus points</label>
              <input type="number" name="campaignCtrBonusPoints" value={settings.campaignCtrBonusPoints ?? 5} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Max CPR (0 = skip)</label>
              <p className="text-xs text-gray-500 mb-1">Bonus if snapshot CPR is above 0 and at or under this value.</p>
              <input type="number" step="0.01" name="campaignCprMax" value={settings.campaignCprMax ?? 0} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">CPR bonus points</label>
              <input type="number" name="campaignCprBonusPoints" value={settings.campaignCprBonusPoints ?? 5} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Budget tolerance</label>
              <p className="text-xs text-gray-500 mb-1">Spend may exceed budget by this fraction (0.1 = 10%).</p>
              <input type="number" step="0.01" name="campaignBudgetTolerance" value={settings.campaignBudgetTolerance ?? 0.1} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Budget bonus points</label>
              <input type="number" name="campaignBudgetBonusPoints" value={settings.campaignBudgetBonusPoints ?? 5} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Weekly bonus cap per campaign</label>
              <p className="text-xs text-gray-500 mb-1">Maximum KPI bonus points a person can earn from one campaign in a week (0 = no cap).</p>
              <input type="number" name="campaignKpiBonusCapPerWeek" value={settings.campaignKpiBonusCapPerWeek ?? 20} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm w-full" />
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

        {isCompanyAdmin && (
          <div className="pt-5 border-t border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <FiAlertTriangle className="text-red-600 w-5 h-5" />
              <h3 className="text-sm font-bold text-gray-800">Danger Zone</h3>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Reset all performance scores
                </p>
                <p className="text-xs text-gray-600 mt-1 max-w-xl">
                  Clears every employee's scores and starts everyone from zero. Tasks
                  and attendance completed before the reset stop counting, so scores
                  will not build back up on their own.
                </p>
                {lastResetAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last reset on{" "}
                    {new Date(lastResetAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={openResetModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-medium rounded-xl transition-all shrink-0 active:scale-95"
              >
                <FiRotateCcw className="w-4 h-4" />
                Reset Scores
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Performance Scores"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50/60 rounded-xl border border-red-100">
            <FiAlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-red-700">This cannot be undone.</p>
              <p className="mt-1">
                Bonus and penalty history, including review bonuses, checklist points
                and manual adjustments, is deleted permanently and cannot be
                recalculated.
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {resetPerformance.isPending && !resetPreview ? (
              <p>Checking how much data is affected...</p>
            ) : resetPreview ? (
              <p>
                This will delete{" "}
                <span className="font-semibold text-gray-900">
                  {resetPreview.scoresToDelete}
                </span>{" "}
                score {resetPreview.scoresToDelete === 1 ? "record" : "records"} and
                reset{" "}
                <span className="font-semibold text-gray-900">
                  {resetPreview.employeesToReset}
                </span>{" "}
                {resetPreview.employeesToReset === 1 ? "employee" : "employees"} to
                zero.
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Type RESET to confirm
            </label>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="RESET"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleResetScores}
              disabled={resetConfirmText !== "RESET" || resetPerformance.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPerformance.isPending ? "Resetting..." : "Reset Scores"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GamificationRulesSection;
