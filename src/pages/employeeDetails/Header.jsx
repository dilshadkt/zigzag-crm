import Dropdown from "@/components/shared/dropdown";

export const EmployeeHeader = ({
  isAdmin,
  activePage,
  projectOptions,
  setActivePage,
  subTasksCount,
  todaySubTasksCount,
  selectedMonth,
  setSelectedMonth,
  selectedProject,
  setSelectedProject,
}) => {
  // Always show today's subtasks count on the Tasks tab badge
  const tasksBadgeCount = todaySubTasksCount;

  return (
    <div className="flexBetween">
      <div className="flex bg-[#E6EDF5] rounded-full p-1">
        {[
          ...(isAdmin ? ["Overview"] : []),
          "Projects",
          "Teams",
          "Tasks",
          "Vacations",
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => setActivePage(item)}
            className={`${
              activePage === item
                ? `bg-[#3F8CFF] text-white`
                : `bg-[#E6EDF5] text-[#0A1629]`
            } text-sm py-2 px-8 
                  cursor-pointer flex  gap-x-1 rounded-full font-medium relative`}
          >
            {item}
            {item === "Tasks" && tasksBadgeCount > 0 && (
              <span
                className=" -top-0 -right-2 bg-white text-gray-600
                     text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {tasksBadgeCount}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-x-3">
        {(activePage === "Overview" || activePage === "Tasks") && (
          <label className="flex flex-col text-xs font-medium text-gray-600">
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="mt-1 rounded-lg border border-transparent bg-[#E6EDF5] px-3 py-2 text-sm text-[#0A1629] focus:border-[#3F8CFF] focus:bg-white focus:outline-none"
            />
          </label>
        )}
        {activePage === "Teams" && (
          <Dropdown
            options={projectOptions}
            value={selectedProject}
            onChange={setSelectedProject}
            placeholder="Select project"
            className="w-64 bg-[#E6EDF5] rounded-lg font-medium"
          />
        )}
      </div>
    </div>
  );
};
