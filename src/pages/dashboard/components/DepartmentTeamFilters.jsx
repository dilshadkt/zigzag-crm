import React, { useState, useEffect, useRef } from "react";
import { MdPerson, MdFolder, MdFlag, MdTask } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import Header from "../../../components/shared/header";
import MonthSelector from "../../../components/shared/MonthSelector";
import { assetPath } from "../../../utils/assetPath";

const DepartmentTeamFilters = ({
  departments,
  activeDepartmentId,
  onDepartmentChange,
  teamEmployees,
  selectedEmployeeId,
  onEmployeeChange,
  viewMode,
  onViewModeChange,
  selectedMonth,
  onMonthChange,
  selectedProject,
  onProjectChange,
  projects,
  selectedPriority,
  onPriorityChange,
  selectedTypes,
  onTypesChange,
  canCreateTask,
  onAddTaskClick,
  onRefresh,
  searchQuery,
  onSearchChange,
}) => {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  const typeDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setIsPriorityDropdownOpen(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSelectedProjectName = () => {
    if (selectedProject === "all") return "All Projects";
    if (selectedProject === "other") return "Other Tasks";
    const project = projects?.find((item) => item._id === selectedProject);
    return project ? project.name : "All Projects";
  };

  const getSelectedEmployeeName = () => {
    if (selectedEmployeeId === "all") return "All Team Members";
    const employee = teamEmployees.find((item) => item._id === selectedEmployeeId);
    return employee?.name || "All Team Members";
  };

  return (
    <div className="flex flex-col gap-3 px-1">
      <div className="flexBetween flex-col lg:flex-row gap-3">
        <Header className="whitespace-nowrap md:text-lg 2xl:text-xl">
          Department Team Tasks
        </Header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => onViewModeChange("today")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                viewMode === "today"
                  ? "bg-[#3F8CFF] text-white"
                  : "text-gray-600 hover:text-[#3F8CFF]"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("month")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                viewMode === "month"
                  ? "bg-[#3F8CFF] text-white"
                  : "text-gray-600 hover:text-[#3F8CFF]"
              }`}
            >
              This Month
            </button>
          </div>

          {viewMode === "month" && (
            <MonthSelector selectedMonth={selectedMonth} onMonthChange={onMonthChange} />
          )}

          {canCreateTask && (
            <button
              type="button"
              onClick={onAddTaskClick}
              className="h-fit px-4 py-1.5 bg-blue-600 whitespace-nowrap cursor-pointer text-xs text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Add Task
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 bg-white h-fit hover:bg-gray-50 transition-colors rounded-lg border border-gray-200 hover:border-gray-300"
          >
            <img src={assetPath("icons/refresh.svg")} alt="Refresh" className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>

      {departments.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {departments.map((department) => (
            <button
              key={department._id}
              type="button"
              onClick={() => onDepartmentChange(department._id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${
                activeDepartmentId === department._id
                  ? "bg-[#3F8CFF] text-white border-[#3F8CFF]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-[#3F8CFF]"
              }`}
            >
              {department.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEmployeeChange("all")}
          className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
            selectedEmployeeId === "all"
              ? "bg-[#ECF3FF] text-[#3F8CFF] border-[#3F8CFF]/30"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
          }`}
        >
          All Team ({teamEmployees.length})
        </button>

        {teamEmployees.map((employee) => (
          <button
            key={employee._id}
            type="button"
            onClick={() => onEmployeeChange(employee._id)}
            className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
              selectedEmployeeId === employee._id
                ? "bg-[#ECF3FF] text-[#3F8CFF] border-[#3F8CFF]/30"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
            }`}
          >
            <span>{employee.name}</span>
            <span className="ml-2 opacity-70">
              {employee.todayCompleted}/{employee.todayTotal}
            </span>
          </button>
        ))}
      </div>

      <div className="hidden md:flex flex-wrap gap-2 items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs w-44 lg:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z" />
            </svg>
          </div>
        </div>

        <div className="relative" ref={employeeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
            className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-white border border-gray-200 hover:border-gray-300 min-w-[150px]"
          >
            <MdPerson className="text-gray-400 text-sm" />
            <span className="max-w-[110px] truncate text-gray-700">
              {getSelectedEmployeeName()}
            </span>
            <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isEmployeeDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isEmployeeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-1 max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onEmployeeChange("all");
                  setIsEmployeeDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedEmployeeId === "all" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
              >
                All Team Members
              </button>
              <div className="border-t border-gray-100 my-1" />
              {teamEmployees.map((employee) => (
                <button
                  key={employee._id}
                  type="button"
                  onClick={() => {
                    onEmployeeChange(employee._id);
                    setIsEmployeeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedEmployeeId === employee._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                >
                  {employee.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={projectDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-white border border-gray-200 hover:border-gray-300 min-w-[130px]"
          >
            <MdFolder className="text-gray-400 text-sm" />
            <span className="max-w-[90px] truncate text-gray-700">
              {getSelectedProjectName()}
            </span>
            <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isProjectDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-1 max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onProjectChange("all");
                  setIsProjectDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedProject === "all" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
              >
                All Projects
              </button>
              <div className="border-t border-gray-100 my-1" />
              {projects?.map((project) => (
                <button
                  key={project._id}
                  type="button"
                  onClick={() => {
                    onProjectChange(project._id);
                    setIsProjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedProject === project._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                >
                  {project.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={priorityDropdownRef}>
          <button
            type="button"
            onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
            className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-white border border-gray-200 hover:border-gray-300 min-w-[130px]"
          >
            <MdFlag className="text-gray-400 text-sm" />
            <span className="text-gray-700">
              {selectedPriority === "all"
                ? "All Priorities"
                : `${selectedPriority.charAt(0).toUpperCase()}${selectedPriority.slice(1)} Priority`}
            </span>
            <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isPriorityDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isPriorityDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-1">
              {["all", "high", "medium", "low"].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => {
                    onPriorityChange(priority);
                    setIsPriorityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedPriority === priority ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                >
                  {priority === "all"
                    ? "All Priorities"
                    : `${priority.charAt(0).toUpperCase()}${priority.slice(1)} Priority`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={typeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium transition-all duration-200 hover:border-gray-300 min-w-[120px]"
          >
            <MdTask className="text-gray-400 text-sm" />
            <span className="text-gray-700">
              {selectedTypes.length === 3
                ? "All Types"
                : `${selectedTypes.length} Selected`}
            </span>
            <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isTypeDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] p-2">
              {[
                { id: "task", label: "Regular Tasks" },
                { id: "subtask", label: "Subtasks" },
                { id: "extra", label: "Extra Tasks" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(item.id)}
                    onChange={() => {
                      const newTypes = selectedTypes.includes(item.id)
                        ? selectedTypes.filter((type) => type !== item.id)
                        : [...selectedTypes, item.id];
                      onTypesChange(newTypes);
                    }}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentTeamFilters;
