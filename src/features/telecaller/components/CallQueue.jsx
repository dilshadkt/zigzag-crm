import { useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronRight, FiX } from "react-icons/fi";

// Steps through a frozen snapshot of leads one at a time so a telecaller can work a list without hunting.
const CallQueue = ({ leads, title, renderLead, onExit }) => {
  const [index, setIndex] = useState(0);
  const total = leads.length;
  const done = index >= total;
  const current = leads[index];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-400">
            {done ? "Queue finished" : `Lead ${index + 1} of ${total}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit queue"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-[#3F8CFF] transition-all"
          style={{ width: `${total ? Math.min(index / total, 1) * 100 : 0}%` }}
        />
      </div>

      <div className="mx-auto w-full max-w-xl flex-1 overflow-y-auto p-4">
        {done ? (
          <div className="rounded-xl border border-slate-200/60 bg-white px-4 py-10 text-center">
            <p className="text-base font-bold text-slate-800">All done 🎉</p>
            <p className="mt-1 text-sm text-slate-500">You worked through {total} lead{total === 1 ? "" : "s"}.</p>
            <button
              type="button"
              onClick={onExit}
              className="mt-4 rounded-lg bg-[#3F8CFF] px-4 py-2 text-sm font-semibold text-white"
            >
              Back to My Calls
            </button>
          </div>
        ) : (
          renderLead(current)
        )}
      </div>

      {!done && (
        <div className="border-t border-slate-200 bg-white p-3">
          <button
            type="button"
            onClick={() => setIndex((value) => value + 1)}
            className="mx-auto flex w-full max-w-xl items-center justify-center gap-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {index + 1 >= total ? "Finish" : "Next lead"}
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
};

export default CallQueue;
