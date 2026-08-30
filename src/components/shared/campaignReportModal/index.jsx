import React, { useState, useEffect } from "react";
import Modal from "../modal";
import { FiFileText } from "react-icons/fi";

const formatMetric = (value, { money = false, percent = false } = {}) => {
  if (value === undefined || value === null || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  if (money) return `₹${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (percent) return `${num.toFixed(2)}%`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const CampaignReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialReport = null,
  campaignMetrics = null,
  readOnly = false,
}) => {
  const [summary, setSummary] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [reportUrl, setReportUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSummary(initialReport?.summary || "");
      setActionsTaken(initialReport?.actionsTaken || "");
      const existingLink = initialReport?.attachments?.find((a) => a.type === "link");
      setReportUrl(existingLink?.preview || "");
    }
  }, [isOpen, initialReport]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!summary.trim()) return;
    const attachments = reportUrl.trim()
      ? [
          {
            preview: reportUrl.trim(),
            title: "Campaign report link",
            type: "link",
            dateTime: new Date().toISOString(),
          },
        ]
      : [];
    onSubmit({
      summary: summary.trim(),
      actionsTaken: actionsTaken.trim(),
      attachments,
    });
  };

  const snapshot = initialReport?.metricsSnapshot || campaignMetrics || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={readOnly ? "Campaign Report" : "Post Campaign Report"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-xs text-gray-500">
          {readOnly
            ? "Review the marketer's report and KPI snapshot, then Approve or send Rework."
            : "This report is the completion proof for campaign work. Metrics are snapshotted from the campaign at submit time — Facebook sync does not award points."}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
          {[
            ["Spend", formatMetric(snapshot.amountSpent, { money: true })],
            ["CTR", formatMetric(snapshot.ctr, { percent: true })],
            ["CPR", formatMetric(snapshot.cpr, { money: true })],
            ["Results", formatMetric(snapshot.totalResults)],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
              <div className="text-xs font-semibold text-gray-800">{value}</div>
            </div>
          ))}
        </div>

        {initialReport?.submittedAt && (
          <div className="text-[11px] text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            Last submitted {new Date(initialReport.submittedAt).toLocaleString()}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FiFileText className="w-3.5 h-3.5" />
            </span>
            Summary
          </label>
          <textarea
            required
            autoFocus
            rows={3}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="What did you do on this campaign today?"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Actions taken</label>
          <textarea
            rows={3}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="Bids, audience, creative, budget changes..."
            value={actionsTaken}
            onChange={(e) => setActionsTaken(e.target.value)}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Report link (optional)</label>
          <input
            type="url"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="https://docs.google.com/..."
            value={reportUrl}
            onChange={(e) => setReportUrl(e.target.value)}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={isLoading || !summary.trim()}
              className={`px-6 h-10 rounded-xl text-sm font-medium transition-all ${
                isLoading || !summary.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
              }`}
            >
              {isLoading ? "Submitting..." : "Submit report"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default CampaignReportModal;
