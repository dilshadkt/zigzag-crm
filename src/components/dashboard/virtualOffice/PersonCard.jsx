
import { IoClose } from "react-icons/io5";
import { STATE_META, ROLE_LABELS } from "./roles";

const STATUS_STYLE = {
  todo: "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  "re-work": "bg-orange-100 text-orange-700",
  "on-hold": "bg-yellow-100 text-yellow-700",
  paused: "bg-yellow-100 text-yellow-700",
  "on-review": "bg-purple-100 text-purple-700",
};
const PRIORITY_DOT = { High: "bg-red-500", Medium: "bg-amber-400", Low: "bg-gray-300" };

const ATTENDANCE_LABEL = {
  "checked-in": "Clocked in",
  break: "On break",
  overtime: "Overtime",
  "checked-out": "Clocked out",
  absent: "Marked absent",
};

const LEAVE_LABEL = { vacation: "vacation", sick_leave: "sick leave", unpaid_leave: "unpaid leave" };

const since = (date) => {
  if (!date) return "";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `since ${new Date(date).toLocaleDateString([], { day: "numeric", month: "short" })}`;
};

const headline = (p) => {
  switch (p.state) {
    case "overloaded":
      return `${p.openCount} open tasks today, limit is ${p.limit}. Needs help!`;
    case "sleeping":
      return "Nothing assigned for today. Fast asleep.";
    case "away":
      return `On approved ${LEAVE_LABEL[p.leave?.type] || "leave"} today.`;
    case "break":
      return `Coffee break · ${p.openCount + p.carriedCount} tasks waiting.`;
    default:
      return `${ROLE_LABELS[p.role] || "Working"} · ${p.openCount + p.carriedCount} tasks on today's plate.`;
  }
};

const LoadBar = ({ person }) => {
  const { openCount, completedCount, carriedCount, limit } = person;
  const total = Math.max(limit, openCount + completedCount + carriedCount, 1);
  const pct = (n) => `${(n / total) * 100}%`;
  return (
    <div>
      <div className="relative h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
        <div className="h-full bg-green-500" style={{ width: pct(completedCount) }} />
        <div className={`h-full ${openCount > limit ? "bg-red-500" : "bg-blue-500"}`} style={{ width: pct(openCount) }} />
        <div className="h-full bg-blue-300" style={{ width: pct(carriedCount) }} />
        {/* daily limit marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-800" style={{ left: `calc(${pct(limit)} - 1px)` }} />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-gray-500">
        <span><b className="text-gray-800">{openCount}</b> open</span>
        {carriedCount > 0 && <span><b className="text-gray-800">{carriedCount}</b> pulled in</span>}
        <span><b className="text-gray-800">{completedCount}</b> done</span>
        <span className="ml-auto">daily limit <b className="text-gray-800">{limit}</b></span>
      </div>
    </div>
  );
};

const TaskRow = ({ item }) => (
  <li className="flex items-start gap-2 py-1.5">
    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[item.priority] || PRIORITY_DOT.Low}`} title={`${item.priority || "Low"} priority`} />
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{item.title}</p>
      <p className="text-[11px] text-gray-500 truncate">
        {[item.project, item.parentTitle && item.parentTitle !== item.title ? item.parentTitle : null].filter(Boolean).join(" · ") || "No project"}
      </p>
    </div>
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${STATUS_STYLE[item.status] || STATUS_STYLE.todo}`}>
        {item.status?.replace("-", " ")}
      </span>
      {item.carried && <span className="text-[10px] font-semibold text-blue-500">from upcoming</span>}
    </div>
  </li>
);

const PersonCard = ({ person, pinned, onClose }) => {
  const meta = STATE_META[person.state] || STATE_META.working;
  const runningIds = new Set(person.running.map((r) => String(r._id)));
  const rest = person.items.filter((item) => !runningIds.has(String(item._id)));

  return (
    <div className="w-[320px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="p-3 flex items-center gap-3" style={{ background: meta.soft }}>
        <div className="relative shrink-0">
          <img src={person.profileImage || "/image/dummy/avatar1.svg"} alt="" className="w-11 h-11 rounded-full object-cover bg-white border-2 border-white" />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${person.isOnline ? "bg-green-500" : "bg-gray-300"}`} title={person.isOnline ? "Online" : "Offline"} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">{person.name}</p>
          <p className="text-[11px] text-gray-600 truncate">
            {person.position}
            {person.department ? ` · ${person.department}` : ""}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white shrink-0" style={{ background: meta.color }}>
          {meta.label}
        </span>
        {pinned && (
          <button type="button" onClick={onClose} className="p-1 -mr-1 rounded-full hover:bg-black/5 text-gray-600" aria-label="Close">
            <IoClose className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-3 pt-2.5 pb-3 space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-700">{headline(person)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {ATTENDANCE_LABEL[person.attendance] || "Not clocked in today"}
            {person.leave?.halfDay ? " · half-day leave" : ""}
          </p>
        </div>

        {person.state !== "away" && <LoadBar person={person} />}

        {person.running.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-2">
            <p className="text-[10px] font-black uppercase tracking-wide text-blue-600 mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Working on right now
            </p>
            <ul className="space-y-1">
              {person.running.slice(0, 3).map((item) => (
                <li key={item._id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{item.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{item.project || "No project"}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 shrink-0">{since(item.startedAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {rest.length > 0 ? (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Today&apos;s tasks</p>
            <ul className={`divide-y divide-gray-100 ${pinned ? "max-h-64" : "max-h-48"} overflow-y-auto`}>
              {rest.slice(0, pinned ? 25 : 6).map((item) => (
                <TaskRow key={`${item._id}${item.carried ? "c" : ""}`} item={item} />
              ))}
            </ul>
            {(person.moreItems > 0 || (!pinned && rest.length > 6)) && (
              <p className="text-[11px] text-gray-400 mt-1">
                +{person.moreItems + (pinned ? 0 : Math.max(0, rest.length - 6))} more{!pinned && " · click the desk to see all"}
              </p>
            )}
          </div>
        ) : (
          person.running.length === 0 &&
          person.state !== "away" && <p className="text-xs text-gray-400 italic">No tasks for today. Time to assign something? 😴</p>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
