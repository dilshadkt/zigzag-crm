import {
  FiAlertTriangle,
  FiAlertOctagon,
  FiEye,
  FiExternalLink,
  FiFolder,
  FiShare2,
} from "react-icons/fi";
import { useGetDigitalRadar } from "../../../api/hooks/dashboard";

const STAGE_LABELS = { 0: "Not notified yet", 1: "Marketer notified", 2: "Coordinator notified", 3: "Admins notified" };

const WATCH_LABELS = {
  CPL_HIGH: "CPL above target",
  NO_LEADS: "Spend with no leads",
  NO_OPTIMIZATION: "No changes today",
  NOT_SYNCED: "Not synced",
};

const fullName = (u) => `${u?.firstName || ""} ${u?.lastName || ""}`.trim();
const initials = (u) => `${(u?.firstName || "")[0] || ""}${(u?.lastName || "")[0] || ""}`.toUpperCase();
const hours = (h) => (h < 1 ? `${Math.round(h * 60)}m` : `${h}h`);
const when = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const Card = ({ title, subtitle, children, className = "" }) => (
  <div className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-5 ${className}`}>
    <div className="mb-3">
      <h3 className="text-base md:text-lg font-semibold text-[#0A1629]">{title}</h3>
      {subtitle && <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Empty = ({ children }) => <p className="py-6 text-center text-sm text-gray-500">{children}</p>;

const Thumb = ({ project }) =>
  project?.thumbImg ? (
    <img src={project.thumbImg} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 bg-white border border-gray-100" />
  ) : (
    <span className="w-9 h-9 rounded-xl shrink-0 bg-blue-50 text-blue-600 flex items-center justify-center">
      <FiFolder />
    </span>
  );

const Person = ({ user }) =>
  user ? (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      {user.profileImage ? (
        <img src={user.profileImage} alt="" className="w-5 h-5 rounded-full object-cover" />
      ) : (
        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-semibold flex items-center justify-center">{initials(user)}</span>
      )}
      {fullName(user)}
    </span>
  ) : (
    <span className="text-xs text-gray-400">Unassigned</span>
  );

const Tile = ({ icon: Icon, value, title, subtitle, bg, text }) => (
  <div className="rounded-2xl p-3 md:p-4 bg-gray-50 border border-gray-100 min-w-0">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${text}`}>
      <Icon className="w-[18px] h-[18px]" />
    </div>
    <div className="text-2xl md:text-[28px] font-bold text-[#0A1629] mt-4 leading-none">{value}</div>
    <p className="text-xs md:text-sm font-semibold text-gray-800 mt-2 leading-tight">{title}</p>
    <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 leading-tight">{subtitle}</p>
  </div>
);

const AlertRow = ({ alert }) => {
  const critical = alert.severity === "critical";
  return (
    <div className={`rounded-2xl border p-3 ${critical ? "border-red-100 bg-red-50/60" : "border-amber-100 bg-amber-50/60"}`}>
      <div className="flex items-start gap-3">
        <Thumb project={alert.project} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-[#0A1629]">{alert.title}</p>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${critical ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
              {critical ? "Critical" : "Warning"}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
          <div className="flex items-center gap-3 flex-wrap mt-2">
            <Person user={alert.staff} />
            <span className="text-[11px] text-gray-500">Open {hours(alert.ageHours)}</span>
            <span className="text-[11px] text-gray-500">{STAGE_LABELS[alert.stage]}</span>
          </div>
        </div>
        {alert.project?.metaLink && (
          <a href={alert.project.metaLink} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-1 text-xs text-[#3F8CFF] hover:underline">
            Ads Manager <FiExternalLink />
          </a>
        )}
      </div>
    </div>
  );
};

const PostRow = ({ post, extra }) => (
  <a
    href={post.livePostUrl}
    target="_blank"
    rel="noreferrer"
    className="block rounded-xl border border-gray-100 bg-gray-50 hover:bg-white p-2.5"
  >
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-medium text-[#0A1629] truncate">{post.project?.name || "Client"}</p>
      <span className="text-[10px] text-gray-500 capitalize shrink-0">{post.platform.toLowerCase()}</span>
    </div>
    <p className="text-[11px] text-gray-500 mt-0.5">
      {fullName(post.staff)} · {when(post.publishedTime)}
    </p>
    {extra && <p className="text-[11px] text-red-600 mt-0.5">{extra}</p>}
  </a>
);

const RadarPanel = () => {
  const { data, isLoading, isError } = useGetDigitalRadar();

  if (isLoading && !data) return <div className="animate-pulse bg-gray-100 rounded-3xl h-64" />;
  if (isError && !data) {
    return <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">Could not load the radar. Try refreshing.</div>;
  }

  const { summary, alerts, watch, rejections, changelog, smm } = data;
  const smmFlags = summary.smmLate + summary.smmQuality + summary.t24Due;

  return (
    <>
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
          <Tile icon={FiAlertOctagon} value={summary.critical} title="Critical alerts" subtitle={`${summary.warning} warning${summary.warning === 1 ? "" : "s"}`} bg="bg-red-50" text="text-red-600" />
          <Tile icon={FiEye} value={summary.watch} title="On the watch list" subtitle="Not alerting yet" bg="bg-amber-50" text="text-amber-600" />
          <Tile icon={FiAlertTriangle} value={summary.rejections} title="Disapproved ads" subtitle="Open right now" bg="bg-orange-50" text="text-orange-600" />
          <Tile icon={FiShare2} value={smmFlags} title="Social media flags" subtitle="Late, errors, T+24H due" bg="bg-pink-50" text="text-pink-600" />
        </div>
      </div>

      <Card title="Open alerts" subtitle="Notified automatically: the marketer first, then the coordinator after 2h, then admins after 6h.">
        {alerts.length === 0 ? (
          <Empty>No open alerts. Account health, disapproved ads and overspend are all clear.</Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map((a) => (
              <AlertRow key={a._id} alert={a} />
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card title="Watch list" subtitle="Worth a look. No one is notified for these.">
          {watch.length === 0 ? (
            <Empty>Nothing to watch right now.</Empty>
          ) : (
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
              {watch.map((w, i) => (
                <div key={`${w.project._id}-${w.kind}-${i}`} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <Thumb project={w.project} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#0A1629] truncate">{w.project.name}</p>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600">{WATCH_LABELS[w.kind]}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{w.message}</p>
                    <div className="mt-1.5">
                      <Person user={w.staff} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Disapproved ads" subtitle="Each one costs the marketer 10 points if still open after 3 hours.">
          {rejections.length === 0 ? (
            <Empty>No disapproved ads.</Empty>
          ) : (
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
              {rejections.map((r) => (
                <div key={r._id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <Thumb project={r.project} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0A1629] truncate">{r.adName}</p>
                    <p className="text-xs text-gray-500 truncate">{r.project.name} · open {hours(r.ageHours)}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-1 rounded-lg shrink-0 ${r.penalized ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                    {r.penalized ? "-10 applied" : `${hours(r.hoursLeft)} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Changes by marketer today" subtitle="Campaign changes made in Ads Manager today, excluding Meta's own automatic changes. Updated at 15:00.">
        {changelog.length === 0 ? (
          <Empty>No marketers are assigned to clients with an ad account yet.</Empty>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="font-medium px-2 py-2">Marketer</th>
                  <th className="font-medium px-2 py-2 text-right">Changes</th>
                  <th className="font-medium px-2 py-2">By client</th>
                </tr>
              </thead>
              <tbody>
                {changelog.map((c) => (
                  <tr key={c.user._id} className="border-t border-gray-100 align-top">
                    <td className="px-2 py-2.5">
                      <Person user={c.user} />
                    </td>
                    <td className={`px-2 py-2.5 text-right font-semibold ${c.changes === 0 ? "text-amber-600" : "text-[#0A1629]"}`}>{c.changes}</td>
                    <td className="px-2 py-2.5 text-xs text-gray-600">
                      {c.clients.map((cl) => `${cl.name}: ${cl.changes ?? "—"}`).join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card title="Late posts today" subtitle="Published after the scheduled time">
          {smm.late.length === 0 ? <Empty>None.</Empty> : <div className="flex flex-col gap-2">{smm.late.map((p) => <PostRow key={p._id} post={p} extra={`Late by ${p.minutesLate} min`} />)}</div>}
        </Card>
        <Card title="Quality errors" subtitle="Flagged in the last 7 days">
          {smm.quality.length === 0 ? <Empty>None.</Empty> : <div className="flex flex-col gap-2">{smm.quality.map((p) => <PostRow key={p._id} post={p} extra={p.note || "Quality error"} />)}</div>}
        </Card>
        <Card title="T+24H check due" subtitle="Engagement not entered yet">
          {smm.t24Due.length === 0 ? <Empty>None.</Empty> : <div className="flex flex-col gap-2">{smm.t24Due.map((p) => <PostRow key={p._id} post={p} />)}</div>}
        </Card>
      </div>
    </>
  );
};

export default RadarPanel;
