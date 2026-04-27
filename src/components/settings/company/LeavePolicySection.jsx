import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiActivity,
  FiAlertCircle,
  FiSave,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiInfo,
} from "react-icons/fi";

const DEFAULT_LEAVE_TYPES = [
  {
    id: "casual",
    name: "Casual Leave",
    yearlyQuota: 12,
    distribution: "monthly", // 1 per month
    description: "Standard casual leave for personal reasons",
    icon: "📅",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    id: "sick",
    name: "Sick Leave",
    yearlyQuota: 8,
    distribution: "quarterly", // 2 every 3 months
    description: "Leave for medical and health purposes",
    icon: "🏥",
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    id: "unpaid",
    name: "Unpaid Leave",
    yearlyQuota: 0,
    distribution: "none",
    description: "Leave without pay when quotas are exhausted",
    icon: "💸",
    color: "bg-gray-50 text-gray-600 border-gray-100",
  },
];

const LeavePolicySection = ({ policy, isLoading, error, onSave, isSaving }) => {
  const [localPolicy, setLocalPolicy] = useState(DEFAULT_LEAVE_TYPES);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (policy && policy.length > 0) {
      setLocalPolicy(policy);
    }
  }, [policy]);

  const handleUpdateQuota = (id, quota) => {
    setLocalPolicy((prev) =>
      prev.map((type) =>
        type.id === id ? { ...type, yearlyQuota: Number(quota) } : type
      )
    );
    setIsDirty(true);
  };

  const handleUpdateDistribution = (id, dist) => {
    setLocalPolicy((prev) =>
      prev.map((type) => (type.id === id ? { ...type, distribution: dist } : type))
    );
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(localPolicy);
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-40 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="mt-3 text-[13px] font-medium text-gray-400">Loading leave policies…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Leave Policy Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {localPolicy.map((type) => (
          <div
            key={type.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-4 flex items-center gap-3 border-b border-gray-50 bg-gray-50/30">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px] shadow-sm border ${type.color}`}>
                {type.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-[14px] font-bold text-gray-800">{type.name}</h4>
                <p className="text-[10px] text-gray-400 leading-tight">{type.description}</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Yearly Quota */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Annual Quota (Days)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={type.yearlyQuota}
                    onChange={(e) => handleUpdateQuota(type.id, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">
                    Days/Year
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Accrual / Distribution
                </label>
                <select
                  value={type.distribution}
                  onChange={(e) => handleUpdateDistribution(type.id, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[12px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="none">Fixed (All at once)</option>
                  <option value="monthly">Monthly Accrual</option>
                  <option value="quarterly">Quarterly Accrual</option>
                  <option value="half-yearly">Half-Yearly Accrual</option>
                </select>
              </div>

              {/* Info Tip */}
              <div className="flex items-start gap-2 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                <FiInfo className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-indigo-600/80 leading-relaxed font-medium">
                  {type.distribution === "monthly" 
                    ? `Employees will earn ${Math.round((type.yearlyQuota / 12) * 100) / 100} days at the start of each month.` 
                    : type.distribution === "quarterly"
                    ? `Employees will earn ${Math.round((type.yearlyQuota / 4) * 100) / 100} days every 3 months.`
                    : "The full quota will be available at the start of the year."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Summary + Save ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <FiActivity className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <h5 className="text-[13px] font-bold text-gray-800">Policy Summary</h5>
            <p className="text-[11px] text-gray-400">Total yearly leave allowance: {localPolicy.reduce((acc, curr) => acc + (curr.yearlyQuota || 0), 0)} days</p>
          </div>
          {isDirty && (
            <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-tight">
              Unsaved changes
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <FiLoader className="w-3.5 h-3.5 animate-spin" />
              Saving Policy…
            </>
          ) : (
            <>
              <FiSave className="w-3.5 h-3.5" />
              Save Leave Policy
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LeavePolicySection;
