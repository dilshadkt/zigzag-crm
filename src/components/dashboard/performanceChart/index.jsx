import React, { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useGetCompletionTrend } from "../../../api/hooks/dashboard";
import { FiChevronDown } from "react-icons/fi";
import PublishingSchedule from "../publishingSchedule";

const RED = "#EF4444";

const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [breakpoint]);

    return isMobile;
};

const RangeSelector = ({ range, setRange }) => (
    <div className="relative">
        <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="appearance-none h-9 rounded-full bg-[#F4F9FD] pl-4 pr-9 text-xs font-semibold text-[#0A1629] focus:outline-none cursor-pointer hover:bg-[#E6EDF5] transition-colors"
        >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
    </div>
);

const formatDay = (date) =>
    new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const TooltipShell = ({ title, children }) => (
    <div className="min-w-[150px] rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
        <p className="mb-2 text-[11px] font-semibold text-[#0A1629]">{title}</p>
        <div className="space-y-1.5 text-xs">{children}</div>
    </div>
);

const Row = ({ label, value }) => (
    <div className="flex items-center justify-between gap-6">
        <span className="text-[#7D8592]">{label}</span>
        <span className="font-semibold text-[#0A1629]">{value}</span>
    </div>
);

const ReworkTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <TooltipShell title={formatDay(d.date)}>
            <Row label="Rework events" value={d.dailyRework} />
        </TooltipShell>
    );
};

const PeakDot = (peakIndex) => {
    const Dot = ({ cx, cy, index, value }) => {
        if (index !== peakIndex || !value) return null;
        const w = 34;
        const h = 20;
        return (
            <g>
                <circle cx={cx} cy={cy} r={5} fill="#fff" stroke={RED} strokeWidth={2.5} />
                <rect x={cx - w / 2} y={cy - h - 10} width={w} height={h} rx={10} fill={RED} />
                <text x={cx} y={cy - h / 2 - 10} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={11} fontWeight={600}>{value}</text>
            </g>
        );
    };
    return Dot;
};

const indexOfMax = (rows, key) => {
    let best = -1;
    let bestValue = 0;
    rows.forEach((row, i) => {
        if ((row[key] || 0) > bestValue) {
            bestValue = row[key];
            best = i;
        }
    });
    return best;
};

const ChartCard = ({ title, caption, value, unit, extra, range, setRange, children, footer }) => (
    <div className="flex min-h-[340px] flex-col rounded-[24px] bg-white p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
            <div>
                <h3 className="text-base font-semibold text-[#0A1629]">{title}</h3>
                <p className="mt-3 text-xs text-[#7D8592]">{caption}</p>
                <div className="mt-0.5 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold leading-none text-[#0A1629]">{value}</span>
                    {unit && <span className="text-sm text-[#7D8592]">{unit}</span>}
                    {extra}
                </div>
            </div>
            <RangeSelector range={range} setRange={setRange} />
        </div>

        <div className="mt-4 h-[190px] w-full md:h-[210px]">{children}</div>

        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-[#7D8592]">{footer}</div>
    </div>
);

const Legend = ({ color, label, value }) => (
    <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
        <span className="font-semibold text-[#0A1629]">{value}</span>
    </span>
);

const CompletionTrendChart = ({ userId = null }) => {
    const [range, setRange] = useState(14);
    const isMobile = useIsMobile();
    const { data, isLoading } = useGetCompletionTrend(userId, range);

    if (isLoading) {
        return (
            <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
                {[1, 2].map((i) => (
                    <div key={i} className="h-[340px] animate-pulse rounded-[24px] bg-white p-6">
                        <div className="h-4 w-32 rounded bg-[#E6EDF5]" />
                        <div className="mt-6 h-9 w-24 rounded bg-[#E6EDF5]" />
                        <div className="mt-8 flex h-[160px] items-end gap-2">
                            {Array.from({ length: 12 }).map((_, b) => (
                                <div key={b} className="flex-1 rounded-t-md bg-[#F4F9FD]" style={{ height: `${30 + ((b * 37) % 60)}%` }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const chartData = data?.data || [];

    const totalRework = chartData.reduce((acc, curr) => acc + curr.dailyRework, 0);
    const criticalDays = chartData.filter((d) => d.dailyRework > 2).length;
    const cleanDays = chartData.filter((d) => d.dailyRework === 0).length;

    const peakRework = indexOfMax(chartData, "dailyRework");

    const margin = { top: 30, right: 4, left: 4, bottom: 0 };
    const xAxis = (
        <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9AA7BC", fontSize: isMobile ? 9 : 10 }}
            dy={8}
            interval={isMobile && range > 7 ? 1 : range > 14 ? 2 : 0}
        />
    );

    return (
        <div className="relative grid w-full grid-cols-1 gap-4 xl:grid-cols-2">
            <PublishingSchedule />

            <ChartCard
                title="Quality"
                caption="Rework events"
                value={totalRework}
                unit={`in ${range} days`}
                range={range}
                setRange={setRange}
                footer={
                    <>
                        <Legend color={RED} label="Critical days" value={criticalDays} />
                        <Legend color="#FCA5A5" label="Clean days" value={cleanDays} />
                    </>
                }
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={margin}>
                        <defs>
                            <linearGradient id="reworkFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={RED} stopOpacity={0.28} />
                                <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        {xAxis}
                        <Tooltip content={<ReworkTooltip />} cursor={{ stroke: "#FCA5A5", strokeDasharray: "4 4" }} />
                        <Area
                            type="monotone"
                            dataKey="dailyRework"
                            name="Rework"
                            stroke={RED}
                            strokeWidth={2.5}
                            fill="url(#reworkFill)"
                            dot={false}
                            activeDot={{ r: 5, fill: "#fff", stroke: RED, strokeWidth: 2.5 }}
                            label={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="dailyRework"
                            stroke="none"
                            fill="none"
                            dot={PeakDot(peakRework)}
                            activeDot={false}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
};

export default CompletionTrendChart;
