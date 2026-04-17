import React, { useState, useEffect } from "react";
import {
  FiSun,
  FiMoon,
  FiCheck,
  FiZap,
  FiInfo,
  FiSave,
  FiLoader,
} from "react-icons/fi";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { day: 0, label: "Sunday",    short: "Sun", weekend: true  },
  { day: 1, label: "Monday",    short: "Mon", weekend: false },
  { day: 2, label: "Tuesday",   short: "Tue", weekend: false },
  { day: 3, label: "Wednesday", short: "Wed", weekend: false },
  { day: 4, label: "Thursday",  short: "Thu", weekend: false },
  { day: 5, label: "Friday",    short: "Fri", weekend: false },
  { day: 6, label: "Saturday",  short: "Sat", weekend: true  },
];

const OCCURRENCES = [
  { value: "all",    label: "All"   },
  { value: "first",  label: "1st"  },
  { value: "second", label: "2nd"  },
  { value: "third",  label: "3rd"  },
  { value: "fourth", label: "4th"  },
  { value: "last",   label: "Last" },
];

const PRESETS = [
  {
    id: "5day",
    label: "5-Day Week",
    description: "All Sat & Sun off",
    icon: "⚡",
    rules: [
      { day: 0, occurrence: "all" },
      { day: 6, occurrence: "all" },
    ],
  },
  {
    id: "6day_sun",
    label: "6-Day Week",
    description: "Only Sundays off",
    icon: "☀️",
    rules: [{ day: 0, occurrence: "all" }],
  },
  {
    id: "2nd4th_sat",
    label: "2nd & 4th Sat",
    description: "All Sun + 2nd & 4th Sat off",
    icon: "🇮🇳",
    rules: [
      { day: 0, occurrence: "all"    },
      { day: 6, occurrence: "second" },
      { day: 6, occurrence: "fourth" },
    ],
  },
  {
    id: "2nd_sat",
    label: "2nd Saturday",
    description: "All Sun + 2nd Sat off",
    icon: "📅",
    rules: [
      { day: 0, occurrence: "all"    },
      { day: 6, occurrence: "second" },
    ],
  },
  {
    id: "no_off",
    label: "No Weekly Off",
    description: "All 7 days working",
    icon: "💼",
    rules: [],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a nested structure { [day]: Set<occurrence> } from a flat rules array */
const rulesToMap = (rules = []) => {
  const map = {};
  DAYS.forEach(({ day }) => { map[day] = new Set(); });
  rules.forEach(({ day, occurrence }) => {
    if (map[day]) map[day].add(occurrence);
  });
  return map;
};

/** Flatten the map back to a rules array */
const mapToRules = (map) => {
  const rules = [];
  Object.entries(map).forEach(([day, set]) => {
    set.forEach((occurrence) => {
      rules.push({ day: Number(day), occurrence });
    });
  });
  return rules;
};

/** Check whether two rule-arrays are equal */
const rulesEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  const sig = (arr) =>
    arr
      .map((r) => `${r.day}-${r.occurrence}`)
      .sort()
      .join("|");
  return sig(a) === sig(b);
};

/** Detect which preset (if any) matches current rules */
const detectPreset = (rules) => {
  for (const p of PRESETS) {
    if (rulesEqual(p.rules, rules)) return p.id;
  }
  return "custom";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Chip button used for occurrence selection */
const OccurrenceChip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
      active
        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

/** Single day row */
const DayRow = ({ dayMeta, occurrences, onChange }) => {
  const isOff = occurrences.size > 0;

  // For weekend days show granular occurrence chips; for weekdays just a toggle
  const showChips = dayMeta.weekend;

  const toggleAll = () => {
    if (isOff) {
      onChange(new Set());
    } else {
      onChange(new Set(["all"]));
    }
  };

  const toggleOccurrence = (occ) => {
    const next = new Set(occurrences);
    if (next.has("all") && occ !== "all") {
      // switching from "all" to specific
      next.delete("all");
      next.add(occ);
    } else if (next.has(occ)) {
      next.delete(occ);
    } else {
      next.add(occ);
    }
    onChange(next);
  };

  // Determine display label for the occurrence set
  const displayLabel = () => {
    if (!isOff) return "Working day";
    if (occurrences.has("all")) return "All " + dayMeta.label + "s off";
    const labels = OCCURRENCES.filter((o) => occurrences.has(o.value)).map(
      (o) => o.label
    );
    return labels.join(", ") + " " + dayMeta.short + " off";
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
        isOff
          ? "bg-red-50/30 border-red-100"
          : "bg-white border-gray-100 hover:bg-gray-50/60"
      }`}
    >
      {/* Day name */}
      <div className="flex items-center gap-3 w-36 flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[12px] transition-colors ${
            isOff
              ? "bg-red-100 text-red-500"
              : dayMeta.weekend
              ? "bg-amber-50 text-amber-500 border border-amber-100"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {dayMeta.short}
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-800">{dayMeta.label}</p>
          <p className="text-[10px] text-gray-400">{displayLabel()}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {showChips ? (
          <>
            {/* Specific occurrence chips for weekend days */}
            {OCCURRENCES.map((occ) => (
              <OccurrenceChip
                key={occ.value}
                label={occ.label}
                active={
                  occ.value === "all"
                    ? occurrences.has("all")
                    : occurrences.has(occ.value) && !occurrences.has("all")
                }
                onClick={() => toggleOccurrence(occ.value)}
              />
            ))}
            {/* None / clear chip */}
            <OccurrenceChip
              label="None"
              active={!isOff}
              onClick={() => onChange(new Set())}
            />
          </>
        ) : (
          /* Simple working / off toggle for weekdays */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(new Set())}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                !isOff
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Working
            </button>
            <button
              type="button"
              onClick={toggleAll}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                isOff
                  ? "bg-red-100 text-red-600 border-red-200"
                  : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
              }`}
            >
              Day Off
            </button>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0 hidden sm:block">
        {isOff ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight bg-red-100 text-red-500 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Day Off
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight bg-green-50 text-green-600 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Working
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WorkScheduleSection = ({
  schedule,
  isLoading,
  error,
  onSave,
  isSaving,
}) => {
  // Local state — a map { [day 0-6]: Set<occurrence> }
  const [ruleMap, setRuleMap] = useState(() => rulesToMap([]));
  const [isDirty, setIsDirty] = useState(false);

  // Sync from server data
  useEffect(() => {
    if (schedule) {
      setRuleMap(rulesToMap(schedule.weeklyOffs || []));
      setIsDirty(false);
    }
  }, [schedule]);

  const currentRules = mapToRules(ruleMap);
  const activePresetId = detectPreset(currentRules);

  const applyPreset = (preset) => {
    setRuleMap(rulesToMap(preset.rules));
    setIsDirty(true);
  };

  const updateDay = (day, set) => {
    setRuleMap((prev) => ({ ...prev, [day]: set }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave({ weeklyOffs: currentRules });
  };

  // Summary counts
  const offDays = DAYS.filter(({ day }) => ruleMap[day]?.size > 0);

  // ── Loading / Error states ──
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-40 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="mt-3 text-[13px] font-medium text-gray-400">
          Loading schedule…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 text-center">
        <p className="text-[14px] font-bold text-red-800 mb-1">
          Failed to load work schedule
        </p>
        <p className="text-[12px] text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Quick Presets ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <FiZap className="w-3.5 h-3.5 text-amber-500" />
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Quick Presets
            </h4>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`relative flex flex-col items-start gap-1 px-3 py-3 rounded-xl border text-left transition-all group ${
                  isActive
                    ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                    <FiCheck className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <span className="text-[18px] leading-none">{preset.icon}</span>
                <span
                  className={`text-[12px] font-bold leading-tight ${
                    isActive ? "text-indigo-700" : "text-gray-700"
                  }`}
                >
                  {preset.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">
                  {preset.description}
                </span>
              </button>
            );
          })}

          {/* Custom indicator (appears when nothing matches) */}
          {activePresetId === "custom" && (
            <div className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl border bg-purple-50 border-purple-200 ring-2 ring-purple-200">
              <span className="text-[18px] leading-none">✏️</span>
              <span className="text-[12px] font-bold text-purple-700 leading-tight">
                Custom
              </span>
              <span className="text-[10px] text-purple-400 leading-tight">
                Your own rules
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Day-by-Day Config ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiSun className="w-3.5 h-3.5 text-orange-400" />
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Configure Each Day
            </h4>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <FiInfo className="w-3 h-3" />
            <span>For weekends, pick which occurrences are off each month</span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {DAYS.map((dayMeta) => (
            <DayRow
              key={dayMeta.day}
              dayMeta={dayMeta}
              occurrences={ruleMap[dayMeta.day] || new Set()}
              onChange={(set) => updateDay(dayMeta.day, set)}
            />
          ))}
        </div>
      </div>

      {/* ── Summary + Save ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Summary */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <FiMoon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[12px] font-bold text-gray-600">
              {offDays.length === 0
                ? "No weekly days off configured"
                : `${offDays.map((d) => d.label).join(", ")} configured as off`}
            </span>
          </div>
          {isDirty && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-tight">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isSaving ? (
            <>
              <FiLoader className="w-3.5 h-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <FiSave className="w-3.5 h-3.5" />
              Save Schedule
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkScheduleSection;
