import React, { useState, useRef, useEffect } from "react";
import { FiFilter, FiColumns, FiCheck } from "react-icons/fi";
import CampaignRow from "./CampaignRow";
import CampaignsTableSkeleton from "./CampaignsTableSkeleton";

// All available columns with their config
const ALL_COLUMNS = [
  { key: "results", label: "Results", align: "right", defaultVisible: true },
  { key: "costPerResult", label: "Cost per result", align: "right", defaultVisible: true },
  { key: "budget", label: "Budget", align: "right", defaultVisible: true },
  { key: "amountSpent", label: "Amount spent", align: "right", defaultVisible: true },
  { key: "reach", label: "Reach", align: "right", defaultVisible: true },
  { key: "impressions", label: "Impressions", align: "right", defaultVisible: true },
  { key: "clicks", label: "Clicks", align: "right", defaultVisible: false },
  { key: "cpc", label: "CPC", align: "right", defaultVisible: false },
  { key: "ctr", label: "CTR", align: "right", defaultVisible: false },
  { key: "frequency", label: "Frequency", align: "right", defaultVisible: false },
  { key: "conversions", label: "Conversions", align: "right", defaultVisible: false },
  { key: "endDate", label: "End date", align: "right", defaultVisible: false },
];

// Load saved column prefs from localStorage
const loadColumnPrefs = () => {
  try {
    const saved = localStorage.getItem("campaign_columns");
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);
};

const CampaignsTable = ({ campaigns, isLoading, isClient }) => {
  const [visibleColumns, setVisibleColumns] = useState(loadColumnPrefs);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const pickerRef = useRef(null);

  // Save prefs to localStorage
  useEffect(() => {
    localStorage.setItem("campaign_columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowColumnPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (key) => {
    setVisibleColumns(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const selectAll = () => setVisibleColumns(ALL_COLUMNS.map(c => c.key));
  const selectDefault = () => setVisibleColumns(ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key));

  if (isLoading) {
    return <CampaignsTableSkeleton />;
  }

  const activeColumns = ALL_COLUMNS.filter(c => visibleColumns.includes(c.key));
  const totalVisibleCols = 2 + activeColumns.length + (isClient ? 0 : 1); // campaign + delivery + data cols + checkbox

  // Calculate summary values
  const summaryValues = {
    results: campaigns.reduce((s, c) => s + (c.totalResults || 0), 0),
    amountSpent: campaigns.reduce((s, c) => s + (c.amountSpent || 0), 0),
    budget: campaigns.reduce((s, c) => s + (c.budget || 0), 0),
    reach: campaigns.reduce((s, c) => s + (c.reach || 0), 0),
    impressions: campaigns.reduce((s, c) => s + (c.impressions || 0), 0),
    clicks: campaigns.reduce((s, c) => s + (c.clicks || 0), 0),
    conversions: campaigns.reduce((s, c) => s + (c.conversions || 0), 0),
  };
  summaryValues.costPerResult = summaryValues.results > 0 ? summaryValues.amountSpent / summaryValues.results : 0;

  const formatSummary = (key) => {
    switch (key) {
      case "results": return summaryValues.results.toLocaleString();
      case "costPerResult": return summaryValues.costPerResult > 0 ? `₹${summaryValues.costPerResult.toFixed(2)}` : "—";
      case "budget": return `₹${summaryValues.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case "amountSpent": return `₹${summaryValues.amountSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case "reach": return summaryValues.reach.toLocaleString();
      case "impressions": return summaryValues.impressions.toLocaleString();
      case "clicks": return summaryValues.clicks.toLocaleString();
      case "conversions": return summaryValues.conversions.toLocaleString();
      default: return "";
    }
  };

  return (
    <div className="bg-white md:border md:border-gray-200 md:rounded-3xl overflow-hidden md:shadow-sm flex flex-col h-full">
      {/* Mobile View */}
      <div className="md:hidden flex flex-col gap-3 p-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign._id || campaign.id}
              className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => window.location.pathname = `/campaigns/${campaign._id || campaign.id}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {campaign.facebookAdId && (
                      <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-blue-600" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-bold text-gray-900 truncate">{campaign.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg shrink-0">
                  <div className={`h-1.5 w-1.5 rounded-full ${campaign.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-[10px] font-bold uppercase text-gray-700">
                    {campaign.status === "active" ? "Active" : campaign.status === "paused" ? "Off" : campaign.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <div><div className="text-xs font-black text-gray-800">{campaign.totalResults ? campaign.totalResults.toLocaleString() : "—"}</div><div className="text-[9px] font-bold text-gray-400 uppercase">Results</div></div>
                <div><div className="text-xs font-black text-gray-800">{campaign.cpr ? `₹${campaign.cpr.toFixed(2)}` : "—"}</div><div className="text-[9px] font-bold text-gray-400 uppercase">CPR</div></div>
                <div><div className="text-xs font-black text-gray-800">{campaign.budget ? `₹${campaign.budget.toLocaleString()}` : "—"}</div><div className="text-[9px] font-bold text-gray-400 uppercase">Budget</div></div>
                <div><div className="text-xs font-black text-blue-600">{campaign.amountSpent ? `₹${campaign.amountSpent.toLocaleString()}` : "—"}</div><div className="text-[9px] font-bold text-gray-400 uppercase">Spent</div></div>
                <div><div className="text-xs font-black text-gray-800">{campaign.reach ? campaign.reach.toLocaleString() : "—"}</div><div className="text-[9px] font-bold text-gray-400 uppercase">Reach</div></div>
                <div><div className="text-xs font-black text-gray-800">{campaign.impressions ? campaign.impressions.toLocaleString() : "—"}</div><div className="text-[9px] font-bold text-gray-400 uppercase">Impr.</div></div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100">
            <FiFilter className="text-2xl text-gray-300 mb-2" />
            <p className="text-xs font-black text-gray-800 uppercase tracking-widest">No campaigns</p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto flex-1 custom-scrollbar">
        {/* Column Toggle Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white sticky top-0 z-20">
          <span className="text-[11px] font-semibold text-gray-400">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
          </span>
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                showColumnPicker
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <FiColumns className="w-3.5 h-3.5" />
              Columns ({visibleColumns.length})
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Toggle Columns</span>
                  <div className="flex gap-1.5">
                    <button onClick={selectAll} className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors">All</button>
                    <button onClick={selectDefault} className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-50 transition-colors">Default</button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {ALL_COLUMNS.map(col => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        visibleColumns.includes(col.key)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 bg-white"
                      }`}>
                        {visibleColumns.includes(col.key) && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[12px] font-medium ${visibleColumns.includes(col.key) ? "text-gray-800" : "text-gray-500"}`}>
                        {col.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="sticky top-[41px] z-10">
            <tr className="bg-gray-50/95 backdrop-blur-md border-b border-gray-200">
              {!isClient && (
                <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-wider w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                </th>
              )}
              <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-[240px]">Campaign</th>
              <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-28">Delivery</th>
              {activeColumns.map(col => (
                <th key={col.key} className={`py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-${col.align} whitespace-nowrap`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <CampaignRow key={campaign._id} campaign={campaign} isClient={isClient} visibleColumns={visibleColumns} />
              ))
            ) : (
              <tr>
                <td colSpan={totalVisibleCols} className="py-32">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 border border-gray-100">
                      <FiFilter className="text-3xl text-gray-300" />
                    </div>
                    <p className="text-sm font-black text-gray-800 uppercase tracking-widest">No matching campaigns</p>
                    <p className="text-xs mt-1 text-gray-500">Click "Sync Facebook" to import campaigns</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {campaigns.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50/80 border-t border-gray-200">
                {!isClient && <td className="py-3 px-4"></td>}
                <td className="py-3 px-4 text-[11px] font-bold text-gray-500">
                  Results from {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
                </td>
                <td className="py-3 px-4"></td>
                {activeColumns.map(col => (
                  <td key={col.key} className="py-3 px-4 text-right text-[12px] font-bold text-gray-800">
                    {formatSummary(col.key)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default CampaignsTable;
