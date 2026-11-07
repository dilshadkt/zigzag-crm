const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-[#3f8cff] focus:ring-4 focus:ring-[#3f8cff]/10";

export const LOST_REASONS = [
  "Price too high",
  "Chose a competitor",
  "Not interested",
  "No budget",
  "Wrong number / not reachable",
  "Timing not right",
  "Other",
];

export const isWonStatus = (status) =>
  status?.category === "Won" || status?.name?.toLowerCase() === "won";
export const isLostStatus = (status) => status?.category === "Lost";

// Extra inputs shown when the selected status closes the lead.
const ClosingFields = ({ kind, values, onChange, errors = {} }) => {
  const set = (key, value) => onChange({ ...values, [key]: value });

  if (kind === "won") {
    return (
      <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
        <p className="text-sm font-bold text-emerald-700">Deal won</p>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Deal value (optional)</label>
          <input
            type="number"
            min="0"
            value={values.dealValue || ""}
            onChange={(event) => set("dealValue", event.target.value)}
            placeholder="e.g. 50000"
            className={inputClass}
          />
          {errors.dealValue && <p className="mt-1 text-xs text-red-500">{errors.dealValue}</p>}
        </div>
      </div>
    );
  }

  if (kind === "lost") {
    return (
      <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
        <p className="text-sm font-bold text-rose-700">Why was this lead lost?</p>
        <div className="flex flex-wrap gap-2">
          {LOST_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => set("lostReason", reason)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                values.lostReason === reason
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>
        {errors.lostReason && <p className="text-xs text-red-500">{errors.lostReason}</p>}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            Re-engage on (optional, brings the lead back to your calls)
          </label>
          <input
            type="datetime-local"
            value={values.reengageOn || ""}
            onChange={(event) => set("reengageOn", event.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default ClosingFields;
