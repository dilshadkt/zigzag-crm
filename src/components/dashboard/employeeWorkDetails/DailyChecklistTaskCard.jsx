import React from "react";
import { FiCheck, FiFolder } from "react-icons/fi";

// The user's checklist for today, shown like a task in the Assigned Tasks list.
// While items are open it lists them with tick boxes; once every item assigned
// to the user is done it becomes a single finished card for Completed Today.
const DailyChecklistTaskCard = ({ checklist }) => {
  const { items, total, done, allDone, toggleItem } = checklist;
  if (!total) return null;

  if (allDone) {
    return (
      <div className="flex items-stretch overflow-hidden rounded-xl border border-gray-100 bg-white opacity-80 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <span className="w-1 shrink-0 bg-emerald-400" />
        <div className="flex flex-1 items-center justify-between gap-3 px-3 py-2.5">
          <div>
            <h5 className="text-sm font-semibold text-gray-500">Daily Checklist</h5>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600">
              <FiCheck className="h-3 w-3" />
              All {total} checklist {total === 1 ? "item" : "items"} done
            </p>
          </div>
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-600">
            Completed
          </span>
        </div>
      </div>
    );
  }

  // Group by project so people can tell which client each item belongs to
  const byProject = items.reduce((groups, item) => {
    (groups[item.projectId] ||= { name: item.projectName, items: [] }).items.push(item);
    return groups;
  }, {});

  const percent = Math.round((done / total) * 100);

  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <span className="w-1 shrink-0 bg-[#3F8CFF]" />
      <div className="min-w-0 flex-1 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold text-gray-800">Daily Checklist</h5>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
              Checklist
            </span>
          </div>
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
            {done} / {total}
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#3F8CFF] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {Object.entries(byProject).map(([projectId, group]) => (
            <div key={projectId}>
              <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#3F8CFF]">
                <FiFolder className="h-3 w-3" />
                {group.name}
              </p>
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <label
                    key={item.title}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={!!item.completed}
                      onChange={() => toggleItem(item)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#3F8CFF] focus:ring-[#3F8CFF]"
                    />
                    <span className={item.completed ? "text-gray-400 line-through" : ""}>
                      {item.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyChecklistTaskCard;
