import React from "react";
import {
  Lightbulb,
  X,
  Target,
  Clock,
  AlertCircle,
  Zap,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  ClipboardCheck,
  Shield,
  UserCheck,
  Megaphone,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useGetCompany } from "../../api/hooks";
import { splitPerformanceBuckets } from "../../utils/splitPerformanceBuckets";

const DEFAULTS = {
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
  internalReviewRejectionPenalty: 10,
  clientRejectionPenalty: 15,
  campaignKpiBonusEnabled: false,
  campaignCtrTarget: 1,
  campaignCprMax: 0,
  campaignBudgetTolerance: 0.1,
  campaignCtrBonusPoints: 5,
  campaignCprBonusPoints: 5,
  campaignBudgetBonusPoints: 5,
  campaignKpiBonusCapPerWeek: 20,
  meetingAttendancePoints: 10,
};

const PointsBadge = ({ value, loss = false }) => (
  <span
    className={`shrink-0 text-[11px] font-black px-2 py-0.5 rounded-full ${
      loss
        ? "bg-rose-50 text-rose-600 border border-rose-100"
        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
    }`}
  >
    {loss ? `−${Math.abs(value)}` : `+${value}`} pts
  </span>
);

const RuleRow = ({ title, detail, value, loss }) => (
  <div className="flex items-start justify-between gap-3 py-2.5">
    <div className="min-w-0">
      <p className="text-xs font-bold text-[#0A1629]">{title}</p>
      {detail && (
        <p className="text-[11px] text-[#7D8592] mt-0.5 leading-relaxed">{detail}</p>
      )}
    </div>
    <PointsBadge value={value} loss={loss} />
  </div>
);

const Section = ({ icon: Icon, tone, title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${tone}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h3 className="text-xs font-bold text-[#0A1629]">{title}</h3>
    </div>
    <div className="px-3.5 divide-y divide-gray-50">{children}</div>
  </div>
);

const ScoringGuideDrawer = ({ isOpen, onClose, performance }) => {
  const { companyId } = useAuth();
  const { data } = useGetCompany(isOpen ? companyId : null);
  const settings = {
    ...DEFAULTS,
    ...(data?.company?.gamificationSettings || {}),
  };

  if (!isOpen) return null;

  const buckets = splitPerformanceBuckets(performance);
  const activity = buckets.activity;
  const attendance = buckets.attendance;
  const bonus = buckets.bonus;
  const penalty = buckets.penalties;
  const total = performance?.totalScore ?? activity + attendance + bonus - penalty;
  const target = performance?.targetScore || settings.baseTargetScore;
  const normalized = performance?.normalizedScore;
  const showPersonalTotals = Boolean(performance);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[70]"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#F4F9FD] shadow-2xl z-[80] flex flex-col animate-slide-in-right border-l border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                How scoring works
              </h2>
              <p className="text-xs text-slate-500">
                Rules and points for this company
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {showPersonalTotals && (
          <div className="bg-white rounded-xl border border-gray-100 p-3.5">
            <p className="text-[10px] font-bold text-[#7D8592] uppercase tracking-wide mb-2">
              Your total this month
            </p>
            <p className="text-[11px] text-[#7D8592] leading-relaxed mb-3">
              Activity + Attendance + Bonus − Penalties. Rework, review delay, checklist, and leave deductions are included in Penalties.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Activity", value: `+${activity}`, icon: Target, tone: "text-[#3F8CFF] bg-blue-50" },
                { label: "Attendance", value: `+${attendance}`, icon: Clock, tone: "text-emerald-600 bg-emerald-50" },
                { label: "Bonus", value: `+${bonus}`, icon: Zap, tone: "text-violet-600 bg-violet-50" },
                { label: "Penalties", value: `−${penalty}`, icon: AlertCircle, tone: "text-rose-500 bg-rose-50" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-gray-100 px-2.5 py-2 flex items-center gap-2"
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.tone}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#7D8592] font-semibold">{item.label}</p>
                      <p className="text-xs font-black text-[#0A1629]">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#0A1629]">Total score</span>
              <span className="text-sm font-black text-[#3F8CFF]">{total} pts</span>
            </div>
            <p className="text-[11px] text-[#7D8592] mt-1 px-1">
              Target is {target} pts
              {typeof normalized === "number"
                ? ` · you are at ${Math.round(normalized)}% of target`
                : ""}
              . Leaderboard ranking uses this percentage.
            </p>
          </div>
          )}

          <Section
            icon={TrendingUp}
            tone="text-emerald-600 bg-emerald-50 border-emerald-100"
            title="How you earn points"
          >
            <RuleRow
              title="Submit a subtask for review"
              detail="Once per subtask, when it first goes on review. Category points replace this fallback. A rework round does not pay again."
              value={settings.taskCompletePoints}
            />
            <RuleRow
              title="Clock in for the day"
              detail="Counted once per calendar day, even if you clock in more than once."
              value={settings.attendanceDayPoints}
            />
            <RuleRow
              title="Complete the daily checklist"
              detail="Finish every checklist item on every assigned project that day."
              value={settings.dailyChecklistPoints}
            />
            <RuleRow
              title="Request leave early"
              detail="Ask 7 or more days before the leave date. 1–6 days of notice is neither a bonus nor a penalty."
              value={settings.earlyLeaveRequestPoints}
            />
            <RuleRow
              title="Attend a meeting"
              detail="Marked present in the attendance report after a scheduled meeting."
              value={settings.meetingAttendancePoints}
            />
          </Section>

          <Section
            icon={TrendingDown}
            tone="text-rose-500 bg-rose-50 border-rose-100"
            title="How you lose points"
          >
            <RuleRow
              title="Miss a deadline"
              detail="The subtask was first submitted after its due date. After 10 late subtasks in the period, further late ones cost double."
              value={settings.taskPenaltyPoints}
              loss
            />
            <RuleRow
              title="Arrive late"
              detail={`Clock-in after your shift start, plus a ${settings.lateArrivalGraceMinutes}-minute grace.`}
              value={settings.lateArrivalPenaltyPoints}
              loss
            />
            <RuleRow
              title="Skip the daily checklist"
              detail="Any assigned project checklist is still open at the end of the day."
              value={settings.dailyChecklistPenaltyPoints}
              loss
            />
            <RuleRow
              title="Request leave late"
              detail="Leave asked on the same day or after it has already started. 1–6 days of notice is neutral."
              value={settings.lateLeaveRequestPenaltyPoints}
              loss
            />
            <RuleRow
              title="Rework attributed to you"
              detail="Internal review sent the work back and named you as the cause."
              value={settings.internalReviewRejectionPenalty}
              loss
            />
            <RuleRow
              title="Client rejection attributed to you"
              detail="The client sent work back and you were named as the cause. Downstream subtasks that also have to change are not charged extra."
              value={settings.clientRejectionPenalty}
              loss
            />
          </Section>

          <Section
            icon={Shield}
            tone="text-indigo-600 bg-indigo-50 border-indigo-100"
            title="If you review other people's work"
          >
            <RuleRow
              title="Review on time"
              detail={`Finish the first review within ${settings.coordinatorReviewTimeLimit} hours. Later re-reviews do not pay this again.`}
              value={settings.coordinatorReviewBonusPoints}
            />
            <RuleRow
              title="Review is delayed"
              detail="These points come off the reviewer, not the person who did the task. A slow re-review can still be charged."
              value={settings.coordinatorPenaltyPoints}
              loss
            />
            <RuleRow
              title="Admin has to review instead"
              detail="Each responsible reviewer (manager, reporters, and task creator) is charged. The admin earns nothing."
              value={settings.adminInterventionPenaltyPoints}
              loss
            />
          </Section>

          {settings.campaignKpiBonusEnabled && (
            <Section
              icon={Megaphone}
              tone="text-indigo-600 bg-indigo-50 border-indigo-100"
              title="Campaign report bonuses"
            >
              <RuleRow
                title={`CTR at or above ${settings.campaignCtrTarget}%`}
                detail="Awarded when you submit a campaign report that hits the CTR target."
                value={settings.campaignCtrBonusPoints}
              />
              {settings.campaignCprMax > 0 && (
                <RuleRow
                  title={`CPR at or under ${settings.campaignCprMax}`}
                  value={settings.campaignCprBonusPoints}
                />
              )}
              <RuleRow
                title="Stay within budget"
                detail={`Spend may go ${Math.round((settings.campaignBudgetTolerance || 0) * 100)}% over budget.`}
                value={settings.campaignBudgetBonusPoints}
              />
              {settings.campaignKpiBonusCapPerWeek > 0 && (
                <p className="text-[11px] text-[#7D8592] py-2.5">
                  Cap: {settings.campaignKpiBonusCapPerWeek} pts per campaign each week.
                </p>
              )}
            </Section>
          )}

          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-[#0A1629]">Quick tips</h3>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#7D8592] leading-relaxed">
              <li className="flex gap-2">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                Clock in on time every working day to stack attendance points.
              </li>
              <li className="flex gap-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                Close checklist items before the workday ends.
              </li>
              <li className="flex gap-2">
                <UserCheck className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                Submit work before the deadline so review bonuses can still apply.
              </li>
              <li className="flex gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                Bonus also includes checklist, leave, meetings, campaign reports, and on-time reviews. Admins can add extra recognition.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};

export default ScoringGuideDrawer;
