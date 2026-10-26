import React, { useState } from "react";
import { FiShoppingBag } from "react-icons/fi";
import Modal from "../../shared/modal";
import { useAssetBank } from "../../../api/hooks";

const WORK_TYPE_LABELS = { reels: "Reel", poster: "Poster", motionPoster: "Motion poster" };

const monthLabel = (monthKey) => {
  if (!monthKey) return "";
  const date = new Date(`${monthKey}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return monthKey;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const isLink = (value) => /^https?:\/\//i.test(String(value || ""));

const ValueRow = ({ label, value }) => (
  <div className="flex gap-2 text-xs">
    <span className="w-2/5 shrink-0 truncate text-gray-500">{label}</span>
    {isLink(value) ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 truncate font-medium text-blue-600 hover:underline"
      >
        {value}
      </a>
    ) : (
      <span className="min-w-0 truncate font-medium text-gray-800">{value}</span>
    )}
  </div>
);

/**
 * Floating bucket on a project's task page: shows how much banked footage the
 * client has left and opens the list of it.
 */
const AssetBankBucket = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useAssetBank(
    projectId,
    { status: "available" },
    { enabled: !!projectId }
  );

  const items = data?.items || [];
  if (!projectId || isLoading || items.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Asset bank"
        className="fixed bottom-28 right-4 z-[50] md:bottom-32 md:right-8 flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg transition-transform hover:scale-105"
      >
        <FiShoppingBag className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
          {items.length}
        </span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Asset bank (${items.length})`}
        maxWidth="sm:max-w-xl"
      >
        <p className="mb-3 text-xs text-gray-500">
          Footage already shot for this client. Pick it when creating a task in any month.
        </p>
        <div className="space-y-2">
          {items.map((item, index) => {
            const rows = [
              item.footageLink && { label: "Footage link", value: item.footageLink },
              ...(item.fields || []).filter((field) => field?.value),
            ].filter(Boolean);
            return (
              <div
                key={item._id}
                className="space-y-1.5 rounded-xl border border-gray-100 bg-[#F8FAFC] px-3 py-2.5"
              >
                <p className="truncate text-sm font-semibold text-gray-800">
                  {item.topic ||
                    `Untitled ${WORK_TYPE_LABELS[item.workType] || item.workType} ${index + 1}`}
                </p>
                <p className="text-xs text-gray-500">
                  {WORK_TYPE_LABELS[item.workType] || item.workType}
                  {item.sourceMonth ? ` · Shot ${monthLabel(item.sourceMonth)}` : ""}
                  {item.sourceTask?.title ? ` · ${item.sourceTask.title}` : ""}
                </p>
                {rows.map((row, rowIndex) => (
                  <ValueRow key={`${row.label}-${rowIndex}`} label={row.label} value={row.value} />
                ))}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default AssetBankBucket;
