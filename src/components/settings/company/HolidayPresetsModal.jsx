import React, { useState, useMemo } from "react";
import { X, Search, CheckSquare, Square, Sparkles, ChevronDown, ChevronRight } from "lucide-react";

// ─── Preset Data ──────────────────────────────────────────────────────────────
// Dates are stored as {month (1-based), day}. For floating holidays (Diwali, Holi
// etc.) approximate dates are provided — admins can fine-tune via edit.

const PRESET_CATEGORIES = [
  {
    id: "national_india",
    label: "🇮🇳 Indian National Holidays",
    type: "national",
    holidays: [
      { name: "New Year's Day",        month: 1,  day: 1,  description: "Start of the new calendar year" },
      { name: "Republic Day",          month: 1,  day: 26, description: "Celebrates the Constitution of India coming into effect (1950)" },
      { name: "Holi",                  month: 3,  day: 14, description: "Festival of colours — dates vary, adjust as needed", isRecurring: true },
      { name: "Good Friday",           month: 4,  day: 18, description: "Commemorates the crucifixion of Jesus Christ" },
      { name: "Eid ul-Fitr",           month: 3,  day: 31, description: "End of Ramadan — dates vary by moon sighting, adjust as needed" },
      { name: "Ram Navami",            month: 4,  day: 6,  description: "Birthday of Lord Rama", isRecurring: true },
      { name: "Ambedkar Jayanti",      month: 4,  day: 14, description: "Birth anniversary of Dr. B.R. Ambedkar" },
      { name: "Independence Day",      month: 8,  day: 15, description: "India's independence from British rule (1947)", isRecurring: true },
      { name: "Janmashtami",           month: 8,  day: 26, description: "Birth of Lord Krishna — dates vary, adjust as needed", isRecurring: true },
      { name: "Gandhi Jayanti",        month: 10, day: 2,  description: "Birth anniversary of Mahatma Gandhi", isRecurring: true },
      { name: "Dussehra (Vijayadasami)", month: 10, day: 12, description: "Victory of Rama over Ravana — dates vary, adjust as needed", isRecurring: true },
      { name: "Diwali",                month: 10, day: 20, description: "Festival of lights — dates vary, adjust as needed", isRecurring: true },
      { name: "Diwali (Day 2)",        month: 10, day: 21, description: "Second day of Diwali celebrations" },
      { name: "Guru Nanak Jayanti",    month: 11, day: 5,  description: "Birth anniversary of Guru Nanak Dev Ji — dates vary", isRecurring: true },
      { name: "Christmas Day",         month: 12, day: 25, description: "Celebrates the birth of Jesus Christ", isRecurring: true },
    ],
  },
  {
    id: "regional_india",
    label: "🏙️ Regional / State Holidays",
    type: "regional",
    holidays: [
      { name: "Pongal",         month: 1,  day: 14, description: "Tamil harvest festival — mainly observed in Tamil Nadu", isRecurring: true },
      { name: "Makar Sankranti",month: 1,  day: 14, description: "Harvest festival across India", isRecurring: true },
      { name: "Ugadi",          month: 3,  day: 30, description: "New Year for Kannada & Telugu communities — dates vary", isRecurring: true },
      { name: "Gudi Padwa",     month: 3,  day: 30, description: "Maharashtrian New Year — dates vary", isRecurring: true },
      { name: "Baisakhi",       month: 4,  day: 13, description: "Harvest festival mainly in Punjab", isRecurring: true },
      { name: "Onam",           month: 8,  day: 26, description: "Harvest festival of Kerala — dates vary", isRecurring: true },
      { name: "Durga Puja (Maha Ashtami)", month: 10, day: 10, description: "Major festival in West Bengal — dates vary", isRecurring: true },
      { name: "Chhat Puja",     month: 10, day: 28, description: "Sun worship festival prominent in Bihar & UP — dates vary", isRecurring: true },
    ],
  },
  {
    id: "international",
    label: "🌍 International / Global",
    type: "national",
    holidays: [
      { name: "New Year's Eve",       month: 12, day: 31, description: "Last day of the calendar year" },
      { name: "Valentine's Day",      month: 2,  day: 14, description: "Day of love and friendship" },
      { name: "International Women's Day", month: 3, day: 8, description: "Celebrates women's social, economic, cultural and political achievements", isRecurring: true },
      { name: "Earth Day",            month: 4,  day: 22, description: "Annual event to demonstrate support for environmental protection", isRecurring: true },
      { name: "International Labour Day", month: 5, day: 1, description: "International Workers' Day", isRecurring: true },
      { name: "Halloween",            month: 10, day: 31, description: "Western holiday observed on October 31" },
      { name: "Christmas Eve",        month: 12, day: 24, description: "Evening before Christmas Day" },
    ],
  },
  {
    id: "optional_days",
    label: "⭐ Optional / Fun Days",
    type: "optional",
    holidays: [
      { name: "Company Foundation Day", month: 1, day: 1, description: "Day your company was founded — update the date", isRecurring: true },
      { name: "Employee Appreciation Day", month: 3, day: 7, description: "First Friday in March — celebrate your team", isRecurring: true },
      { name: "Team Building Day",     month: 6, day: 15, description: "Half-day or full-day for team activities — adjust date" },
      { name: "Annual Offsite",        month: 9, day: 20, description: "Company offsite or annual retreat — adjust date" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const monthNames = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const toDateString = (year, month, day) => {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};

// Build a unique id for each preset holiday
const presetId = (catId, name) => `${catId}::${name}`;

// ─── Component ────────────────────────────────────────────────────────────────

const HolidayPresetsModal = ({ isOpen, onClose, onAdd, year, isSaving }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [collapsed, setCollapsed] = useState({});

  const toggleCollapse = (id) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleItem = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleCategory = (cat) => {
    const ids = cat.holidays.map((h) => presetId(cat.id, h.name));
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set();
    PRESET_CATEGORIES.forEach((cat) =>
      cat.holidays.forEach((h) => all.add(presetId(cat.id, h.name)))
    );
    setSelected(all);
  };

  const clearAll = () => setSelected(new Set());

  // Filtered view
  const filtered = useMemo(() => {
    if (!search.trim()) return PRESET_CATEGORIES;
    const q = search.toLowerCase();
    return PRESET_CATEGORIES.map((cat) => ({
      ...cat,
      holidays: cat.holidays.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.description || "").toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.holidays.length > 0);
  }, [search]);

  const handleConfirm = () => {
    const toAdd = [];
    PRESET_CATEGORIES.forEach((cat) => {
      cat.holidays.forEach((h) => {
        const id = presetId(cat.id, h.name);
        if (selected.has(id)) {
          toAdd.push({
            name: h.name,
            date: toDateString(year, h.month, h.day),
            description: h.description || "",
            type: cat.type,
            isRecurring: h.isRecurring || false,
          });
        }
      });
    });
    if (toAdd.length > 0) onAdd(toAdd);
  };

  if (!isOpen) return null;

  const totalPresets = PRESET_CATEGORIES.reduce(
    (acc, cat) => acc + cat.holidays.length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
           style={{ maxHeight: "90vh" }}>
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-800">
                Common Holidays
              </h2>
              <p className="text-[11px] text-gray-400">
                Pick holidays to add for {year} — you can edit dates after
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Search + bulk actions ── */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0 space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search holidays…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Bulk actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Select all ({totalPresets})
              </button>
              <span className="text-gray-300">·</span>
              <button
                onClick={clearAll}
                className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              {selected.size} selected
            </span>
          </div>
        </div>

        {/* ── Scrollable list ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="w-8 h-8 text-gray-200 mb-3" />
              <p className="text-[13px] font-medium text-gray-400">
                No holidays match "{search}"
              </p>
            </div>
          )}

          {filtered.map((cat) => {
            const catIds = cat.holidays.map((h) => presetId(cat.id, h.name));
            const allCatSelected = catIds.every((id) => selected.has(id));
            const someCatSelected = catIds.some((id) => selected.has(id));
            const isOpen = !collapsed[cat.id];

            return (
              <div
                key={cat.id}
                className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden"
              >
                {/* Category header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100">
                  {/* Collapse toggle */}
                  <button
                    onClick={() => toggleCollapse(cat.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Category select toggle */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {allCatSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    ) : someCatSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className="text-[12px] font-bold text-gray-700">
                      {cat.label}
                    </span>
                  </button>

                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                    {cat.holidays.length}
                  </span>
                </div>

                {/* Holiday rows */}
                {isOpen && (
                  <div className="divide-y divide-gray-100/70">
                    {cat.holidays.map((h) => {
                      const id = presetId(cat.id, h.name);
                      const isChecked = selected.has(id);

                      return (
                        <button
                          key={id}
                          onClick={() => toggleItem(id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                            isChecked
                              ? "bg-indigo-50/60"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Checkbox */}
                          <div className="flex-shrink-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-500" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </div>

                          {/* Date mini badge */}
                          <div className="flex-shrink-0 w-9 h-9 bg-white border border-gray-100 rounded-lg flex flex-col items-center justify-center shadow-sm">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase leading-none">
                              {monthNames[h.month]}
                            </span>
                            <span className="text-[13px] font-black text-gray-700 leading-tight">
                              {h.day}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[12px] font-bold truncate ${isChecked ? "text-indigo-700" : "text-gray-700"}`}>
                                {h.name}
                              </span>
                              {h.isRecurring && (
                                <span className="text-[8px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-1 py-0.5 rounded uppercase tracking-tight flex-shrink-0">
                                  Recurring
                                </span>
                              )}
                            </div>
                            {h.description && (
                              <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-tight">
                                {h.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            Floating-date holidays use <span className="font-bold">approximate dates</span> — edit afterwards to adjust.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0 || isSaving}
              className="px-5 py-2 text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Add {selected.size || ""} Holiday{selected.size !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayPresetsModal;
