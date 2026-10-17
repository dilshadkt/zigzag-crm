import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  useAssetBank,
  useAddAssetBankItems,
  useRemoveAssetBankItem,
  useReleaseAssetBankItem,
} from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

const WORK_TYPE_LABELS = { reels: "Reel", poster: "Poster", motionPoster: "Motion poster" };

const monthLabel = (monthKey) => {
  if (!monthKey) return "";
  const date = new Date(`${monthKey}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return monthKey;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const AddToBankForm = ({ projectId, selectedMonth, onDone }) => {
  const [quantity, setQuantity] = useState("1");
  const [topics, setTopics] = useState("");
  const [footageLink, setFootageLink] = useState("");
  const addMutation = useAddAssetBankItems(projectId);

  const topicList = topics
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      workType: "reels",
      footageLink: footageLink.trim(),
      sourceMonth: selectedMonth || undefined,
    };
    if (topicList.length) payload.topics = topicList;
    else payload.quantity = Number(quantity);

    try {
      const result = await addMutation.mutateAsync(payload);
      toast.success(`${result?.items?.length || 0} reel(s) added to the bank`);
      onDone();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to add to the bank"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-[#F8FAFC] p-4 md:grid-cols-2"
    >
      <label className="text-xs font-semibold text-gray-600">
        Extra reels from this shoot
        <input
          type="number"
          min="1"
          max="50"
          value={topicList.length ? topicList.length : quantity}
          disabled={topicList.length > 0}
          onChange={(e) => setQuantity(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal focus:border-blue-400 focus:outline-none disabled:bg-gray-100"
        />
      </label>
      <label className="text-xs font-semibold text-gray-600">
        Footage link (Drive folder)
        <input
          type="url"
          value={footageLink}
          onChange={(e) => setFootageLink(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal focus:border-blue-400 focus:outline-none"
        />
      </label>
      <label className="text-xs font-semibold text-gray-600 md:col-span-2">
        Topics (optional, one per line — the count follows the lines)
        <textarea
          rows={3}
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal focus:border-blue-400 focus:outline-none"
        />
      </label>
      <div className="flex justify-end gap-2 md:col-span-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {addMutation.isPending ? "Adding..." : "Add to bank"}
        </button>
      </div>
    </form>
  );
};

const AssetBankCard = ({ projectId, selectedMonth }) => {
  const { isCompany } = useAuth();
  const [view, setView] = useState("available");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useAssetBank(projectId, { status: view });
  const removeMutation = useRemoveAssetBankItem(projectId);
  const releaseMutation = useReleaseAssetBankItem(projectId);

  const items = data?.items || [];
  const summary = data?.summary || { available: 0, used: 0 };

  const handleRemove = async (itemId) => {
    if (!window.confirm("Remove this item from the bank?")) return;
    try {
      await removeMutation.mutateAsync(itemId);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to remove item"));
    }
  };

  const handleRelease = async (itemId) => {
    if (!window.confirm("Return this item to the bank? The task keeps its copy of the link.")) return;
    try {
      await releaseMutation.mutateAsync(itemId);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to release item"));
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Client asset bank
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-gray-900">
            {summary.available} reel{summary.available === 1 ? "" : "s"} ready to use
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Footage shot beyond a month's package. Pick it when creating a reel task in any
            later month.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {showForm ? "Close" : "Add to bank"}
        </button>
      </div>

      {showForm && (
        <AddToBankForm
          projectId={projectId}
          selectedMonth={selectedMonth}
          onDone={() => setShowForm(false)}
        />
      )}

      <div className="mt-4 flex gap-2">
        {[
          { id: "available", label: `Available (${summary.available})` },
          { id: "used", label: `Used (${summary.used})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              view === tab.id
                ? "bg-blue-50 text-blue-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {isLoading && <p className="text-sm text-gray-400">Loading...</p>}
        {!isLoading && items.length === 0 && (
          <p className="rounded-xl bg-[#F8FAFC] px-3 py-4 text-center text-sm text-gray-400">
            {view === "available" ? "Nothing banked yet." : "No banked footage has been used yet."}
          </p>
        )}
        {items.map((item) => (
          <div
            key={item._id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-[#F8FAFC] px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {item.topic || `Untitled ${WORK_TYPE_LABELS[item.workType] || item.workType}`}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {item.sourceMonth ? `Shot ${monthLabel(item.sourceMonth)}` : "Shoot month not set"}
                {item.sourceTask?.title ? ` · ${item.sourceTask.title}` : ""}
                {item.footageLink && (
                  <>
                    {" · "}
                    <a
                      href={item.footageLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Footage
                    </a>
                  </>
                )}
              </p>
              {item.status === "used" && item.usedByTask && (
                <p className="mt-0.5 text-xs text-gray-500">
                  Used in {monthLabel(item.usedMonth)} ·{" "}
                  <Link
                    to={`/projects/${projectId}/${item.usedByTask._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.usedByTask.title}
                  </Link>
                </p>
              )}
            </div>
            {item.status === "available" && (
              <button
                type="button"
                onClick={() => handleRemove(item._id)}
                className="text-xs font-semibold text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            )}
            {item.status === "used" && isCompany && (
              <button
                type="button"
                onClick={() => handleRelease(item._id)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Return to bank
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AssetBankCard;
