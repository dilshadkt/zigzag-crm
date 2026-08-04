import React, { useMemo, useState } from "react";
import { useGetProjectBranchReport } from "../../../features/leads/api";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export const ReportsTab = ({ currentProject, onBranchClick, onCategoryClick }) => {
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const dateParams = useMemo(() => {
    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (dateFilterType) {
      case "today":
        startDate = startOfDay(now).toISOString();
        endDate = endOfDay(now).toISOString();
        break;
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
        endDate = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
        break;
      case "month":
        startDate = startOfMonth(now).toISOString();
        endDate = endOfMonth(now).toISOString();
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = startOfDay(new Date(customStartDate)).toISOString();
          endDate = endOfDay(new Date(customEndDate)).toISOString();
        }
        break;
      default:
        break;
    }

    return (startDate && endDate) ? { startDate, endDate } : {};
  }, [dateFilterType, customStartDate, customEndDate]);

  const { data: reportData, isLoading } = useGetProjectBranchReport(currentProject?._id, dateParams);

  const branches = reportData?.data || [];

  const totals = useMemo(() => {
    return branches.reduce(
      (acc, curr) => ({
        totalLeads: acc.totalLeads + (curr.totalLeads || 0),
        call1: acc.call1 + (curr.call1 || 0),
        call2: acc.call2 + (curr.call2 || 0),
        call3: acc.call3 + (curr.call3 || 0),
        call4: acc.call4 + (curr.call4 || 0),
        contacted: acc.contacted + (curr.contacted || 0),
        qualified: acc.qualified + (curr.qualified || 0),
        hot: acc.hot + (curr.hot || 0),
        warm: acc.warm + (curr.warm || 0),
        cold: acc.cold + (curr.cold || 0),
        won: acc.won + (curr.won || 0),
        lost: acc.lost + (curr.lost || 0),
      }),
      {
        totalLeads: 0,
        call1: 0,
        call2: 0,
        call3: 0,
        call4: 0,
        contacted: 0,
        qualified: 0,
        hot: 0,
        warm: 0,
        cold: 0,
        won: 0,
        lost: 0,
      }
    );
  }, [branches]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">LEADS OVERVIEW</h3>
          <p className="text-xs text-slate-500">Branch-wise lead performance and conversion matrix</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {dateFilterType === "custom" && (
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input 
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}
          
          <select 
            value={dateFilterType}
            onChange={(e) => setDateFilterType(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer font-medium shadow-sm min-w-[140px]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 min-w-[140px]">Branches</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center">Total Leads</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center">1st Call Done</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center">2nd Call Done</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center">3rd Call Done</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center">4th Call Done</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center text-blue-600">Contacted</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center text-purple-600">Qualified</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center text-orange-500">Hot</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center text-amber-500">Warm</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center text-sky-500">Cold</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-r border-slate-200 bg-slate-50 text-center text-emerald-600">Won</th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-center text-rose-600">Lost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {branches.map((branch, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3 px-4 text-xs font-bold text-slate-800 border-r border-slate-100 bg-white sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-0 group-hover:bg-slate-50/80 transition-colors">
                  <button 
                    onClick={() => onBranchClick && onBranchClick(branch._id)}
                    className="hover:text-[#3f8cff] hover:underline transition-colors text-left"
                  >
                    {branch._id}
                  </button>
                </td>
                <td className="py-3 px-4 text-xs font-semibold text-slate-600 text-center border-r border-slate-100">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id)} className="hover:text-blue-600 hover:underline">{branch.totalLeads}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-slate-600 text-center border-r border-slate-100">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'followUpCount', 1)} className="hover:text-blue-600 hover:underline">{branch.call1}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-slate-600 text-center border-r border-slate-100">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'followUpCount', 2)} className="hover:text-blue-600 hover:underline">{branch.call2}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-slate-600 text-center border-r border-slate-100">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'followUpCount', 3)} className="hover:text-blue-600 hover:underline">{branch.call3}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-slate-600 text-center border-r border-slate-100">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'followUpCount', 4)} className="hover:text-blue-600 hover:underline">{branch.call4}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-blue-600 text-center border-r border-slate-100 bg-blue-50/30">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'statusCategory', 'Contacted')} className="hover:underline">{branch.contacted}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-purple-600 text-center border-r border-slate-100 bg-purple-50/30">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'statusCategory', 'Qualified')} className="hover:underline">{branch.qualified}</button>
                </td>
                <td className="py-3 px-4 text-xs font-bold text-orange-600 text-center border-r border-slate-100 bg-orange-50/30">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'scoreCategory', 'hot')} className="hover:underline">{branch.hot}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-amber-600 text-center border-r border-slate-100 bg-amber-50/30">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'scoreCategory', 'warm')} className="hover:underline">{branch.warm}</button>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-sky-600 text-center border-r border-slate-100 bg-sky-50/30">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'scoreCategory', 'cold')} className="hover:underline">{branch.cold}</button>
                </td>
                <td className="py-3 px-4 text-xs font-black text-emerald-600 text-center border-r border-slate-100 bg-emerald-50/30">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'statusCategory', 'Won')} className="hover:underline">{branch.won}</button>
                </td>
                <td className="py-3 px-4 text-xs font-black text-rose-600 text-center bg-rose-50/30">
                  <button onClick={() => onCategoryClick && onCategoryClick(branch._id, 'statusCategory', 'Lost')} className="hover:underline">{branch.lost}</button>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr>
                <td colSpan="13" className="py-8 text-center text-slate-400 text-sm font-medium">No branch data available for this project.</td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-100 font-bold sticky bottom-0 z-10 shadow-[0_-2px_5px_-2px_rgba(0,0,0,0.05)]">
            <tr>
              <td className="py-4 px-4 text-[13px] text-slate-800 border-r border-slate-200">TOTAL</td>
              <td className="py-4 px-4 text-[13px] text-slate-800 text-center border-r border-slate-200">{totals.totalLeads}</td>
              <td className="py-4 px-4 text-[13px] text-slate-700 text-center border-r border-slate-200">{totals.call1}</td>
              <td className="py-4 px-4 text-[13px] text-slate-700 text-center border-r border-slate-200">{totals.call2}</td>
              <td className="py-4 px-4 text-[13px] text-slate-700 text-center border-r border-slate-200">{totals.call3}</td>
              <td className="py-4 px-4 text-[13px] text-slate-700 text-center border-r border-slate-200">{totals.call4}</td>
              <td className="py-4 px-4 text-[13px] text-blue-700 text-center border-r border-slate-200">{totals.contacted}</td>
              <td className="py-4 px-4 text-[13px] text-purple-700 text-center border-r border-slate-200">{totals.qualified}</td>
              <td className="py-4 px-4 text-[13px] text-orange-700 text-center border-r border-slate-200">{totals.hot}</td>
              <td className="py-4 px-4 text-[13px] text-amber-700 text-center border-r border-slate-200">{totals.warm}</td>
              <td className="py-4 px-4 text-[13px] text-sky-700 text-center border-r border-slate-200">{totals.cold}</td>
              <td className="py-4 px-4 text-[13px] text-emerald-700 text-center border-r border-slate-200">{totals.won}</td>
              <td className="py-4 px-4 text-[13px] text-rose-700 text-center">{totals.lost}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
