import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useLeadKpiScore } from "../../leads/api";

const sign = (points) => (points > 0 ? `+${points}` : String(points));

// Today's points: what was earned (credits) and what was taken away (debits), line by line.
const KpiScoreCard = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useLeadKpiScore({ userId });

  if (isError || data?.enabled === false) return null;
  if (isLoading || !data?.data) return <div className="mb-2 h-16 animate-pulse rounded-xl bg-white lg:mb-4" />;

  const day = data.data;
  const percent = Math.max(0, Math.min(100, Math.round((day.total / day.target) * 100)));
  const credits = day.breakdown.filter((line) => line.count > 0);
  const missing = day.breakdown.filter((line) => !line.count);

  return (
    <section className="mb-2 rounded-xl border border-slate-200/60 bg-white p-2.5 lg:mb-4 lg:p-4">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Score today</span>
            <span className="text-xl font-bold text-slate-900 lg:text-2xl">
              {day.total}
              <span className="text-sm font-medium text-slate-400"> / {day.target}</span>
            </span>
            <span className={`text-xs font-semibold ${percent >= 100 ? "text-emerald-600" : "text-slate-400"}`}>{percent}%</span>
          </span>
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
            <span className={`block h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-[#3F8CFF]"}`} style={{ width: `${percent}%` }} />
          </span>
        </span>
        <span className="hidden text-right text-[11px] sm:block">
          <span className="block font-semibold text-emerald-600">+{day.earned} earned</span>
          <span className="block font-semibold text-rose-500">{day.penaltyTotal} lost</span>
        </span>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 grid gap-4 border-t border-slate-100 pt-3 text-xs sm:grid-cols-2">
          <div>
            <p className="mb-1.5 font-bold text-emerald-700">Earned</p>
            {credits.length === 0 && <p className="text-slate-400">Nothing yet. Log a call to get started.</p>}
            {credits.map((line) => (
              <p key={line.key} className="flex justify-between gap-3 py-0.5 text-slate-700">
                <span>
                  {line.label} <span className="text-slate-400">× {line.count}</span>
                </span>
                <span className="font-semibold text-emerald-600">{sign(line.points)}</span>
              </p>
            ))}
            {missing.length > 0 && (
              <p className="mt-2 text-slate-400">
                Still available: {missing.map((line) => line.label.toLowerCase()).join(", ")}.
              </p>
            )}
          </div>
          <div>
            <p className="mb-1.5 font-bold text-rose-600">Lost</p>
            {day.penalties.length === 0 && <p className="text-slate-400">No penalties today.</p>}
            {day.penalties.map((line) => (
              <div key={line.key} className="py-0.5">
                <p className="flex justify-between gap-3 text-slate-700">
                  <span>
                    {line.label} <span className="text-slate-400">× {line.count}</span>
                  </span>
                  <span className="font-semibold text-rose-600">{sign(line.points)}</span>
                </p>
                {line.items?.length > 0 && (
                  <p className="truncate text-[11px] text-slate-400">{line.items.map((entry) => entry.name).join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default KpiScoreCard;
