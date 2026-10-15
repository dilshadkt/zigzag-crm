import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiAlertTriangle,
  FiClock,
  FiSend,
  FiUserCheck,
  FiRefreshCw,
  FiCalendar,
  FiRepeat,
  FiFolder,
  FiAward,
  FiRefreshCcw,
} from "react-icons/fi";
import { useGetReporterDashboard } from "../../api/hooks/dashboard";

const formatHours = (hours) => {
  const abs = Math.abs(hours || 0);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const initials = (u) =>
  `${(u?.firstName || "")[0] || ""}${(u?.lastName || "")[0] || ""}`.toUpperCase();

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-emerald-50 text-emerald-600",
};

const Card = ({ title, subtitle, right, children, className = "" }) => (
  <div className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h3 className="text-base md:text-lg font-semibold text-[#0A1629]">
          {title}
        </h3>
        {subtitle && <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const StatTile = ({ icon: Icon, value, title, subtitle, bg, text, onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl p-3 md:p-4 flex flex-col items-start text-left bg-gray-50 border border-gray-100 min-w-0 transition-colors ${
      onClick ? "cursor-pointer hover:border-gray-300 hover:bg-white" : ""
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${text}`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
    <div className="text-2xl md:text-[28px] font-bold text-[#0A1629] mt-4 leading-none">
      {value}
    </div>
    <p className="text-xs md:text-sm font-semibold text-gray-800 mt-2 leading-tight line-clamp-1 w-full">
      {title}
    </p>
    <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 leading-tight line-clamp-1 w-full">
      {subtitle}
    </p>
  </div>
);

const Assignees = ({ users = [] }) => (
  <div className="flex -space-x-2 shrink-0">
    {users.slice(0, 3).map((u) =>
      u.profileImage ? (
        <img
          key={u._id}
          src={u.profileImage}
          alt={u.firstName}
          title={`${u.firstName || ""} ${u.lastName || ""}`}
          className="w-7 h-7 rounded-full object-cover border-2 border-white"
        />
      ) : (
        <span
          key={u._id}
          title={`${u.firstName || ""} ${u.lastName || ""}`}
          className="w-7 h-7 rounded-full border-2 border-white bg-blue-50 text-blue-600 text-[10px] font-semibold flex items-center justify-center"
        >
          {initials(u)}
        </span>
      )
    )}
    {users.length > 3 && (
      <span className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-500 text-[10px] font-semibold flex items-center justify-center">
        +{users.length - 3}
      </span>
    )}
  </div>
);

const ItemRow = ({ item, onOpen, meta }) => (
  <div
    onClick={() => onOpen(item)}
    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300 transition-colors p-3 cursor-pointer"
  >
    {item.projectThumb ? (
      <img
        src={item.projectThumb}
        alt=""
        className="w-10 h-10 rounded-xl object-cover shrink-0 bg-white border border-gray-100"
      />
    ) : (
      <span className="w-10 h-10 rounded-xl shrink-0 bg-blue-50 text-blue-600 flex items-center justify-center">
        <FiFolder />
      </span>
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-sm font-medium text-[#0A1629] truncate">{item.title}</p>
        {item.type === "subtask" && (
          <span className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 shrink-0">
            Subtask
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 truncate">
        {item.projectName || "No project"}
        {item.parentTitle ? ` · ${item.parentTitle}` : ""}
      </p>
    </div>
    <div className="hidden md:flex items-center gap-2 shrink-0">
      {item.reworkCount > 0 && (
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${
            item.reworkCount >= 3
              ? "bg-red-50 text-red-600"
              : "bg-rose-50 text-rose-500"
          }`}
          title="Times sent to rework"
        >
          {item.reworkCount}× rework
        </span>
      )}
      {item.priority && (
        <span
          className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-lg ${
            PRIORITY_STYLES[item.priority] || "bg-gray-100 text-gray-500"
          }`}
        >
          {item.priority}
        </span>
      )}
    </div>
    <Assignees users={item.assignees} />
    {meta}
  </div>
);

const EmptyState = ({ children, className = "" }) => (
  <div className={`py-8 text-center text-sm text-gray-500 ${className}`}>
    {children}
  </div>
);

// Review Queue and Rework Watch sit side by side, so they share one height
// range: the card never collapses when empty and scrolls instead of growing.
const LIST_HEIGHT = "min-h-[320px] max-h-[560px]";

const Shimmer = () => (
  <div className="animate-pulse flex flex-col gap-3">
    <div className="bg-white rounded-3xl p-4 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-50 border border-gray-100 h-[130px]" />
      ))}
    </div>
    <div className="bg-white rounded-3xl h-72" />
  </div>
);

const KanbanCard = ({ item, onOpen, footer, tone }) => (
  <div
    onClick={() => onOpen(item)}
    className="rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition p-3 cursor-pointer"
  >
    <div className="flex items-start gap-2">
      {item.projectThumb ? (
        <img
          src={item.projectThumb}
          alt=""
          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-100"
        />
      ) : (
        <span className="w-8 h-8 rounded-lg shrink-0 bg-blue-50 text-blue-600 flex items-center justify-center">
          <FiFolder />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#0A1629] leading-snug line-clamp-2">
          {item.title}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {item.projectName || "No project"}
          {item.parentTitle ? ` · ${item.parentTitle}` : ""}
        </p>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 gap-2">
      <Assignees users={item.assignees} />
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-lg whitespace-nowrap ${tone}`}
      >
        {footer}
      </span>
    </div>
  </div>
);

const ClientKanban = ({ pipeline, reworkItems, onOpen }) => {
  const clientRejected = reworkItems.filter((i) => i.lastReworkSource === "client");
  const withClient = pipeline.awaitingClient.filter((i) => i.daysWaiting < 2);
  const noReply = pipeline.awaitingClient.filter((i) => i.daysWaiting >= 2);

  const columns = [
    {
      key: "ready",
      title: "Ready to send",
      hint: "Approved, you send it",
      items: pipeline.toSend,
      dot: "bg-indigo-500",
      head: "bg-indigo-50 text-indigo-700",
      tone: "bg-indigo-50 text-indigo-600",
      footer: (i) => `approved ${formatHours(i.waitingHours)} ago`,
    },
    {
      key: "with",
      title: "With client",
      hint: "Sent, under 2 days",
      items: withClient,
      dot: "bg-teal-500",
      head: "bg-teal-50 text-teal-700",
      tone: "bg-teal-50 text-teal-600",
      footer: (i) => (i.daysWaiting === 0 ? "sent today" : `${i.daysWaiting}d ago`),
    },
    {
      key: "noreply",
      title: "No reply 2d+",
      hint: "Follow up with the client",
      items: noReply,
      dot: "bg-red-500",
      head: "bg-red-50 text-red-700",
      tone: "bg-red-50 text-red-600",
      footer: (i) => `${i.daysWaiting}d no reply`,
    },
    {
      key: "rejected",
      title: "Client rejected",
      hint: "Back with the team",
      items: clientRejected,
      dot: "bg-rose-500",
      head: "bg-rose-50 text-rose-700",
      tone: "bg-rose-50 text-rose-600",
      footer: (i) => `rework ×${i.reworkCount || 1}`,
    },
    {
      key: "publish",
      title: "Publishing",
      hint: "Client approved",
      items: pipeline.publishing,
      dot: "bg-purple-500",
      head: "bg-purple-50 text-purple-700",
      tone: "bg-purple-50 text-purple-600",
      footer: (i) => `approved ${formatHours(i.waitingHours)} ago`,
    },
  ];

  return (
    <Card
      title="Client Pipeline"
      subtitle="Follow the work from internal approval to publishing"
    >
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid grid-cols-5 gap-3 min-w-[1000px]">
          {columns.map((col) => (
            <div key={col.key} className="rounded-2xl bg-gray-50 border border-gray-100 p-2 flex flex-col min-w-0">
              <div className={`rounded-xl px-3 py-2 flex items-center justify-between ${col.head}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">{col.title}</p>
                    <p className="text-[10px] opacity-70 leading-tight truncate">{col.hint}</p>
                  </div>
                </div>
                <span className="text-sm font-bold bg-white/70 rounded-lg px-2 py-0.5">
                  {col.items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2 max-h-[420px] overflow-y-auto pr-0.5 min-h-[80px]">
                {col.items.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">Nothing here</p>
                ) : (
                  col.items.map((item) => (
                    <KanbanCard
                      key={`${col.key}-${item.type}-${item._id}`}
                      item={item}
                      onOpen={onOpen}
                      tone={col.tone}
                      footer={col.footer(item)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const ReportersTable = ({ rows, onSelect }) => (
  <Card
    title="Reporters"
    subtitle="Most overdue reviews first. Click a reporter to open their dashboard."
  >
    {rows.length === 0 ? (
      <EmptyState>No reporters are assigned to any project.</EmptyState>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="font-medium pb-2">Reporter</th>
              <th className="font-medium pb-2 text-right">Projects</th>
              <th className="font-medium pb-2 text-right">To review</th>
              <th className="font-medium pb-2 text-right">Late</th>
              <th className="font-medium pb-2 text-right">Oldest wait</th>
              <th className="font-medium pb-2 text-right">Reviews (month)</th>
              <th className="font-medium pb-2 text-right">On-time</th>
              <th className="font-medium pb-2 text-right">Avg time</th>
              <th className="font-medium pb-2 text-right">Points lost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r._id}
                onClick={() => onSelect(r._id)}
                className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              >
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <Assignees users={[r]} />
                    <span className="font-medium text-[#0A1629] truncate">
                      {r.firstName} {r.lastName}
                    </span>
                  </div>
                </td>
                <td className="text-right">{r.projects}</td>
                <td className="text-right font-semibold">{r.needsReview}</td>
                <td
                  className={`text-right font-semibold ${
                    r.lateReviews ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {r.lateReviews}
                </td>
                <td className="text-right text-gray-600">
                  {r.needsReview ? formatHours(r.oldestWaitingHours) : "—"}
                </td>
                <td className="text-right">{r.reviewsThisMonth}</td>
                <td className="text-right">
                  {r.onTimeRate === null ? "—" : `${r.onTimeRate}%`}
                </td>
                <td className="text-right">
                  {r.avgReviewHours === null ? "—" : `${r.avgReviewHours}h`}
                </td>
                <td
                  className={`text-right ${
                    r.pointsLost ? "text-red-600 font-semibold" : "text-gray-400"
                  }`}
                >
                  {r.pointsLost ? `-${r.pointsLost}` : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

const ReporterDashboard = () => {
  const navigate = useNavigate();
  // Only admins can pick someone else; the API ignores it for everyone else.
  const [reporterId, setReporterId] = React.useState("");
  const { data, isLoading, isFetching, refetch } = useGetReporterDashboard(
    reporterId || null
  );

  const openItem = (item) => {
    if (!item.projectId) return;
    const taskId = item.type === "subtask" ? item.parentTaskId : item._id;
    navigate(`/projects/${item.projectId}/${taskId}`);
  };

  if (isLoading) return <Shimmer />;

  if (!data?.isReporter) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center">
        <h3 className="text-lg font-semibold text-[#0A1629]">
          {data?.isAdmin
            ? "No project has a reporter yet"
            : "You are not a reporter on any project yet"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {data?.isAdmin
            ? "Assign reporters in a project's settings and their review work will show up here."
            : "Once you are added as a reporter on a project, the tasks waiting for your review will show up here."}
        </p>
      </div>
    );
  }

  const {
    kpis,
    settings,
    reviewQueue,
    clientPipeline,
    rework,
    projectHealth,
    performance,
    isAdmin,
    reporters,
    reporterRows,
  } = data;
  const selected = reporters.find((r) => r._id === reporterId);
  const scopeLabel = !isAdmin
    ? "You"
    : selected
      ? `${selected.firstName} ${selected.lastName || ""}`.trim()
      : "All reporters";

  const tiles = [
    {
      icon: FiEye,
      value: kpis.needsMyReview,
      title: isAdmin ? "Waiting for Review" : "Needs My Review",
      subtitle: `Limit ${settings.reviewTimeLimit}h per review`,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      onClick: () => navigate("/task-on-review"),
    },
    {
      icon: FiAlertTriangle,
      value: kpis.lateReviews,
      title: "Late Reviews",
      subtitle: kpis.lateReviews ? "Past the time limit" : "All within limit",
      bg: "bg-red-50",
      text: "text-red-600",
    },
    {
      icon: FiClock,
      value: kpis.dueSoon,
      title: "Due Within 1h",
      subtitle: "Review before limit",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      icon: FiSend,
      value: kpis.toSendToClient,
      title: "To Send to Client",
      subtitle: "Approved, not sent",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      onClick: () => navigate("/client-review"),
    },
    {
      icon: FiUserCheck,
      value: kpis.awaitingClient,
      title: "Awaiting Client",
      subtitle: "Sent, no reply yet",
      bg: "bg-teal-50",
      text: "text-teal-600",
      onClick: () => navigate("/client-review"),
    },
    {
      icon: FiCalendar,
      value: kpis.publishPending,
      title: "Publishing Pending",
      subtitle: "Client approved",
      bg: "bg-purple-50",
      text: "text-purple-600",
      onClick: () => navigate("/task-on-publish"),
    },
    {
      icon: FiRefreshCw,
      value: kpis.rework,
      title: "In Re-work",
      subtitle: "Needs revision",
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
    {
      icon: FiRepeat,
      value: rework.thisMonth.total || 0,
      title: "Reworked This Month",
      subtitle: `${rework.thisMonth.client || 0} by client`,
      bg: "bg-fuchsia-50",
      text: "text-fuchsia-600",
    },
  ];

  return (
    <section className="flex flex-col gap-3 pb-4">
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0A1629]">
              Reporter Dashboard
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              {isAdmin ? `${scopeLabel} · ` : ""}
              {kpis.projects} project{kpis.projects === 1 ? "" : "s"}
              {isAdmin ? "" : " you report on"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <select
                value={reporterId}
                onChange={(e) => setReporterId(e.target.value)}
                className="h-10 rounded-xl bg-gray-50 border border-gray-100 px-3 text-sm text-gray-700 max-w-[200px] focus:outline-none"
                aria-label="Reporter"
              >
                <option value="">All reporters</option>
                {reporters.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.firstName} {r.lastName}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => refetch()}
              title="Refresh"
              className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-white"
            >
              <FiRefreshCcw className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 md:gap-3">
          {tiles.map((t) => (
            <StatTile key={t.title} {...t} />
          ))}
        </div>
      </div>

      {performance?.pointsAtRisk > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
          <FiAlertTriangle className="shrink-0" />
          <span>
            {kpis.lateReviews} review{kpis.lateReviews === 1 ? " is" : "s are"}{" "}
            already past the {settings.reviewTimeLimit}h limit. Each late
            review costs {settings.reviewPenaltyPoints} points, so{" "}
            <b>{performance.pointsAtRisk} points</b> are at risk.
          </span>
        </div>
      )}

      {isAdmin && !reporterId && (
        <ReportersTable rows={reporterRows} onSelect={setReporterId} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <Card
          className="xl:col-span-3"
          title="Review Queue"
          subtitle="Longest waiting first. Working hours only."
        >
          {reviewQueue.length === 0 ? (
            <EmptyState className={`${LIST_HEIGHT} flex items-center justify-center`}>
              Nothing is waiting for your review.
            </EmptyState>
          ) : (
            <div className={`flex flex-col gap-2 ${LIST_HEIGHT} overflow-y-auto pr-1`}>
              {reviewQueue.map((item) => (
                <ItemRow
                  key={`${item.type}-${item._id}`}
                  item={item}
                  onOpen={openItem}
                  meta={
                    <div className="text-right shrink-0 w-[92px]">
                      <p
                        className={`text-xs font-semibold ${
                          item.isLate ? "text-red-600" : "text-[#0A1629]"
                        }`}
                      >
                        {item.isLate
                          ? `Late ${formatHours(item.remainingHours)}`
                          : `${formatHours(item.remainingHours)} left`}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        waiting {formatHours(item.waitingHours)}
                      </p>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </Card>

        <div className="xl:col-span-2 flex flex-col gap-3">
          <Card
            title="Rework Watch"
            subtitle={`This month: ${rework.thisMonth.internal || 0} internal, ${
              rework.thisMonth.client || 0
            } client${
              rework.thisMonth.myFault
                ? `, ${rework.thisMonth.myFault} charged to ${
                    isAdmin && !reporterId ? "reporters" : isAdmin ? "them" : "you"
                  }`
                : ""
            }`}
          >
            {rework.items.length === 0 ? (
              <EmptyState className={`${LIST_HEIGHT} flex items-center justify-center`}>
                No tasks are in rework.
              </EmptyState>
            ) : (
              <div className={`flex flex-col gap-2 ${LIST_HEIGHT} overflow-y-auto pr-1`}>
                {rework.items.map((item) => (
                  <ItemRow
                    key={`rw-${item.type}-${item._id}`}
                    item={item}
                    onOpen={openItem}
                    meta={
                      item.lastReworkSource && (
                        <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-rose-50 text-rose-600 shrink-0 capitalize">
                          {item.lastReworkSource}
                        </span>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ClientKanban
        pipeline={clientPipeline}
        reworkItems={rework.items}
        onOpen={openItem}
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <Card
          className="xl:col-span-3"
          title="Project Health"
          subtitle="Projects with the most open attention first"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projectHealth.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-300 transition-colors p-3 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  {p.thumbImg ? (
                    <img src={p.thumbImg} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FiFolder />
                    </span>
                  )}
                  <p className="text-sm font-medium text-[#0A1629] truncate">{p.name}</p>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    ["Review", p.onReview, "text-yellow-600"],
                    ["Rework", p.rework, "text-rose-600"],
                    ["Client", p.clientPending, "text-teal-600"],
                    ["Overdue", p.overdue, "text-red-600"],
                  ].map(([label, value, color]) => (
                    <div key={label}>
                      <p className={`text-base font-bold ${value ? color : "text-gray-300"}`}>
                        {value}
                      </p>
                      <p className="text-[10px] text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className="xl:col-span-2"
          title={isAdmin ? "Review Performance" : "My Review Performance"}
          subtitle="This month"
          right={<FiAward className="text-amber-500 w-5 h-5 mt-1" />}
        >
          {performance.reviewsThisMonth === 0 && performance.missedByAdmin === 0 ? (
            <EmptyState>No reviews scored yet this month.</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Reviews done", performance.reviewsThisMonth],
                [
                  "On-time rate",
                  performance.onTimeRate === null ? "—" : `${performance.onTimeRate}%`,
                ],
                [
                  "Avg review time",
                  performance.avgReviewHours === null
                    ? "—"
                    : `${performance.avgReviewHours}h`,
                ],
                ["Delayed", performance.delayed],
                ["Points earned", `+${performance.pointsEarned}`],
                ["Points lost", `-${performance.pointsLost}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xl font-bold text-[#0A1629] leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-1.5">{label}</p>
                </div>
              ))}
              {performance.missedByAdmin > 0 && (
                <p className="col-span-2 text-xs text-red-600">
                  {performance.missedByAdmin} review
                  {performance.missedByAdmin === 1 ? " was" : "s were"} completed by
                  an admin {isAdmin ? "instead of the reporter" : "in your place"}.
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default ReporterDashboard;
