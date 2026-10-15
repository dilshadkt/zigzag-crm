import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { useGetUpcomingPublishing } from "../../../api/hooks/dashboard";

const RANGE_OPTIONS = [3, 9, 12];
// 3 and 9 days lay out as 3 columns (1 and 3 rows); 12 days as 4 columns x 3 rows
const columnsFor = (days) => (days === 12 ? 4 : 3);

// Lime shades from light (1 post) to strong (3+ posts), mirroring the reference heatmap
const SHADES = ["", "#E4F6A8", "#D3F26A", "#C2EE3D"];
const HATCH =
    "repeating-linear-gradient(135deg, #E6EAF0 0px, #E6EAF0 1.5px, #F4F7FA 1.5px, #F4F7FA 5px)";

const formatLongDay = (dateKey) =>
    new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

const ClientLogo = ({ project, size = 28 }) => {
    const [failed, setFailed] = useState(false);
    const style = { width: size, height: size };

    if (project.thumbImg && !failed) {
        return (
            <img
                src={project.thumbImg}
                alt={project.name}
                style={style}
                className="shrink-0 rounded-full bg-[#F4F9FD] object-cover"
                onError={() => setFailed(true)}
            />
        );
    }
    return (
        <span
            style={style}
            className="flex shrink-0 items-center justify-center rounded-full bg-[#0A1629] text-[11px] font-semibold uppercase text-white"
        >
            {project.name?.charAt(0) || "?"}
        </span>
    );
};

const MAX_LOGOS = 3;

const DayTile = ({ day, clients, onHover, onLeave, onClick }) => {
    const total = day.total;
    const allDone = total > 0 && clients.every((c) => c.cell.completed === c.cell.count);
    const shade = SHADES[Math.min(total, 3)];
    const shown = clients.slice(0, MAX_LOGOS);
    const extra = clients.length - shown.length;

    return (
        <button
            type="button"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onFocus={onHover}
            onBlur={onLeave}
            onClick={onClick}
            disabled={!total}
            className={`relative flex min-h-[58px] flex-col justify-between rounded-[14px] p-2 text-left transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3F8CFF] ${
                total ? "hover:scale-[1.03]" : "cursor-default"
            } ${day.isToday ? "ring-2 ring-[#0A1629]" : ""}`}
            style={total ? { backgroundColor: shade } : { background: HATCH }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#5B6B2A]/80">
                    {day.weekday} <span className="font-semibold text-[#0A1629]">{day.day}</span>
                </span>
                {allDone && <FiCheck className="h-3 w-3 text-[#3D5200]" strokeWidth={3} />}
            </div>
            {total > 0 && (
                <div className="mt-1 flex items-center">
                    <div className="flex -space-x-2">
                        {shown.map(({ project }) => (
                            <span key={project._id} className="rounded-full ring-2 ring-white">
                                <ClientLogo project={project} size={22} />
                            </span>
                        ))}
                    </div>
                    {extra > 0 && (
                        <span className="ml-1 text-[10px] font-semibold text-[#3D5200]">+{extra}</span>
                    )}
                    <span className="ml-auto text-[11px] font-semibold text-[#3D5200]">{total}</span>
                </div>
            )}
        </button>
    );
};

const RangeSelector = ({ range, setRange }) => (
    <div className="relative">
        <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="h-9 cursor-pointer appearance-none rounded-full bg-[#F4F9FD] pl-4 pr-9 text-xs font-semibold text-[#0A1629] transition-colors hover:bg-[#E6EDF5] focus:outline-none"
        >
            {RANGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                    {n} days
                </option>
            ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
    </div>
);

const PublishingSkeleton = () => (
    <div className="flex min-h-[340px] animate-pulse flex-col rounded-[24px] bg-white p-4 md:p-6">
        <div className="h-4 w-28 rounded bg-[#E6EDF5]" />
        <div className="mt-6 h-9 w-24 rounded bg-[#E6EDF5]" />
        <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 rounded-[10px] bg-[#F4F9FD]" />
            ))}
        </div>
    </div>
);

const PublishingSchedule = () => {
    const navigate = useNavigate();
    const [range, setRange] = useState(9);
    const { data, isLoading, isError } = useGetUpcomingPublishing(range);
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const days = data?.data?.days || [];
    const projects = data?.data?.projects || [];
    const summary = data?.data?.summary || { total: 0, completed: 0, pending: 0 };

    // Per-day list of clients publishing that day (with their cell details)
    const clientsByDay = useMemo(
        () =>
            days.map((_, idx) =>
                projects
                    .map((project) => ({ project, cell: project.cells[idx] }))
                    .filter(({ cell }) => cell?.count > 0)
            ),
        [days, projects]
    );

    if (isLoading) return <PublishingSkeleton />;

    const hoveredDay = hoveredIdx !== null ? days[hoveredIdx] : null;
    const hoveredClients = hoveredIdx !== null ? clientsByDay[hoveredIdx] || [] : [];

    return (
        <div className="flex min-h-[340px] flex-col rounded-[24px] bg-white p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-[#0A1629]">Publishing</h3>
                    <p className="mt-3 text-xs text-[#7D8592]">Scheduled in the next {range} days</p>
                    <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="text-4xl font-semibold leading-none text-[#0A1629]">{summary.total}</span>
                        <span className="text-sm text-[#7D8592]">posts</span>
                        {summary.total > 0 && (
                            <span className="ml-1 rounded-full bg-[#F4F9FD] px-2.5 py-1 text-xs font-semibold text-[#3F8CFF]">
                                {summary.pending} pending
                            </span>
                        )}
                    </div>
                </div>
                <RangeSelector range={range} setRange={setRange} />
            </div>

            {isError ? (
                <p className="mt-10 text-center text-sm text-[#7D8592]">Couldn't load the publishing schedule.</p>
            ) : (
                <div
                    className="mt-4 grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${columnsFor(range)}, minmax(0, 1fr))` }}
                >
                    {days.map((day, idx) => (
                        <DayTile
                            key={day.date}
                            day={day}
                            clients={clientsByDay[idx] || []}
                            onHover={() => setHoveredIdx(idx)}
                            onLeave={() => setHoveredIdx(null)}
                            onClick={() => navigate("/calender")}
                        />
                    ))}
                </div>
            )}

            <div className="mt-auto min-h-[40px] pt-4 text-xs text-[#7D8592]">
                {hoveredDay ? (
                    <div>
                        <span className="font-semibold text-[#0A1629]">{formatLongDay(hoveredDay.date)}</span>
                        {" · "}
                        {hoveredDay.total} {hoveredDay.total === 1 ? "post" : "posts"}
                        <p className="mt-0.5 truncate">
                            {hoveredClients.map(({ project, cell }) => `${project.name} (${cell.count})`).join(", ")}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span className="inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#C2EE3D]" />
                            Scheduled
                            <span className="font-semibold text-[#0A1629]">{summary.total}</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FiCheck className="h-3 w-3 text-[#3D5200]" strokeWidth={3} />
                            Done
                            <span className="font-semibold text-[#0A1629]">{summary.completed}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => navigate("/calender")}
                            className="font-semibold text-[#3F8CFF] hover:underline"
                        >
                            Open calendar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublishingSchedule;
