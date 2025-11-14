import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Sector,
} from "recharts";
import { Calendar, Clock, Users, Activity } from "lucide-react";
import { useState } from "react";

// Custom tooltip component for bar chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <div className="mt-2">
          <p className="text-sm flex items-center">
            <span className="inline-block w-3 h-3 mr-2 bg-emerald-500 rounded-sm"></span>
            <span>Completed: {payload[0].value}</span>
          </p>
          <p className="text-sm flex items-center">
            <span className="inline-block w-3 h-3 mr-2 bg-rose-500 rounded-sm"></span>
            <span>Remaining: {payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip component for pie chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm font-medium">
          <span>Value: {payload[0].value}</span>
        </p>
        <p className="text-sm">
          <span>Percentage: {(payload[0].percent * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom active shape for pie chart
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-20}
        textAnchor="middle"
        fill="#333"
        className="text-sm"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        fill="#333"
        className="text-base font-medium"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <text
        x={cx}
        y={cy}
        dy={20}
        textAnchor="middle"
        fill="#999"
        className="text-xs"
      >
        {`(${value} tasks)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

const OverviewTab = ({
  project,
  workTypesData,
  workSummary,
  taskStatusData,
  timelinePercentage,
  formatDate,
  daysRemaining,
  projectDuration,
}) => {
  // Modern professional color palette
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // State for active pie chart segment
  const [activeIndex, setActiveIndex] = useState(0);

  // Progress gradient colors
  const progressGradient = {
    low: "from-blue-400 to-blue-600",
    medium: "from-emerald-400 to-emerald-600",
    high: "from-amber-400 to-amber-600",
  };

  // Get progress color based on percentage
  const getProgressColor = (percent) => {
    if (percent < 33) return progressGradient.low;
    if (percent < 66) return progressGradient.medium;
    return progressGradient.high;
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 truncate">
                  Overall Progress
                </dt>
                <dd className="flex items-center">
                  <div className="text-base font-medium text-gray-900">
                    {project?.progress || 0}%
                  </div>
                  <div className="ml-2 flex-1">
                    <div className="relative h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className={`absolute h-2 rounded-full bg-gradient-to-r ${getProgressColor(
                          project?.progress || 0
                        )}`}
                        style={{ width: `${project?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 truncate">
                  Timeline
                </dt>
                <dd>
                  <div>
                    <span className="text-base font-medium text-gray-900">
                      {timelinePercentage}%
                    </span>
                    <span className="ml-2 text-xs text-gray-500">complete</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(project?.startDate)} -{" "}
                    {formatDate(project?.endDate)}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 truncate">
                  Days Remaining
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-xl font-semibold text-gray-900">
                    {daysRemaining}
                  </div>
                  <div className="ml-2 flex items-baseline text-xs font-semibold text-green-600">
                    <span className="sr-only">days left</span>
                  </div>
                </dd>
                <div className="text-xs text-gray-500">
                  Out of {projectDuration} days total
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-xs font-medium text-gray-500 truncate">
                  Team Members
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-xl font-semibold text-gray-900">
                    {project?.teams?.length || 0}
                  </div>
                </dd>
                <div className="text-xs text-gray-500">
                  Working on {project?.tasks?.length || 0} tasks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Details Summary */}
      {workSummary?.totalPlanned > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Work Details Overview
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Breakdown of planned, completed, and pending work items.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-[11px] uppercase text-blue-600 font-semibold">
                  Planned
                </p>
                <p className="text-xl font-bold text-blue-900">
                  {workSummary.totalPlanned}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-[11px] uppercase text-emerald-600 font-semibold">
                  Completed
                </p>
                <p className="text-xl font-bold text-emerald-900">
                  {workSummary.totalCompleted}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-[11px] uppercase text-amber-600 font-semibold">
                  Pending
                </p>
                <p className="text-xl font-bold text-amber-900">
                  {workSummary.totalPending}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-[11px] uppercase text-purple-600 font-semibold">
                  Completion
                </p>
                <p className="text-xl font-bold text-purple-900">
                  {workSummary.completionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {workSummary.breakdown.map((item) => {
              const percent =
                item.total > 0
                  ? Math.round((item.completed / item.total) * 100)
                  : 0;
              return (
                <div
                  key={item.key}
                  className="flex flex-col gap-2 border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.completed}/{item.total} completed
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {percent}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600 font-medium">
                      ✓ {item.completed} completed
                    </span>
                    <span className="text-orange-600 font-medium">
                      ⏳ {item.remaining} pending
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Work Type Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workTypesData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
                barSize={35}
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={40}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  radius={[4, 4, 0, 0]}
                  fill="#10b981"
                  fillOpacity={0.9}
                />
                <Bar
                  dataKey="remaining"
                  name="Remaining"
                  radius={[4, 4, 0, 0]}
                  fill="#ef4444"
                  fillOpacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Task Status Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", bottom: 0 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-medium text-gray-900 mb-3">
          Project Timeline Progress
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                {
                  name: "Start",
                  progress: 0,
                  date: formatDate(project?.startDate),
                },
                {
                  name: "Current",
                  progress: timelinePercentage,
                  date: "Today",
                },
                {
                  name: "End",
                  progress: 100,
                  date: formatDate(project?.endDate),
                },
              ]}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                label={{
                  value: "Progress (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#6b7280",
                    fontSize: 12,
                  },
                }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />
              <Area
                type="monotone"
                dataKey="progress"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorProgress)"
                strokeWidth={2}
                dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4, fill: "white" }}
                activeDot={{
                  stroke: "#1e40af",
                  strokeWidth: 2,
                  r: 6,
                  fill: "#3b82f6",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-base font-medium leading-6 text-gray-900">
            Project Details
          </h3>
          <p className="mt-1 max-w-2xl text-xs text-gray-500">
            Detailed information about the project.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-xs font-medium text-gray-500">
                Project name
              </dt>
              <dd className="mt-1 text-xs text-gray-900 sm:mt-0 sm:col-span-2">
                {project?.name}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-xs font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-xs text-gray-900 sm:mt-0 sm:col-span-2">
                {project?.description}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-xs font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-xs text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium 
                  ${
                    project?.status === "planning"
                      ? "bg-blue-100 text-blue-800"
                      : project?.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : project?.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : project?.status === "paused"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {project?.status?.charAt(0).toUpperCase() +
                    project?.status?.slice(1)}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-xs font-medium text-gray-500">Priority</dt>
              <dd className="mt-1 text-xs text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium 
                  ${
                    project?.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : project?.priority === "medium"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {project?.priority?.charAt(0).toUpperCase() +
                    project?.priority?.slice(1)}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-xs font-medium text-gray-500">Timeline</dt>
              <dd className="mt-1 text-xs text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(project?.startDate)} -{" "}
                {formatDate(project?.endDate)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
