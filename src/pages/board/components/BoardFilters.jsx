import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/shared/header";
import MonthSelector from "../../../components/shared/MonthSelector";
import { assetPath } from "../../../utils/assetPath";
import { MdPerson, MdFolder, MdFlag, MdTask } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";

const BoardFilters = ({
    selectedMonth,
    onMonthChange,
    selectedProject,
    onProjectChange,
    projects,
    selectedPriority,
    onPriorityChange,
    user,
    selectedAssignee,
    onAssigneeChange,
    assignees,
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
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

    const typeDropdownRef = useRef(null);
    const projectDropdownRef = useRef(null);
    const priorityDropdownRef = useRef(null);
    const assigneeDropdownRef = useRef(null);

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
            if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
                setIsAssigneeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getSelectedProjectName = () => {
        if (selectedProject === "all") return "All Projects";
        if (selectedProject === "other") return "Other Tasks";
        const project = projects?.find(p => p._id === selectedProject);
        return project ? project.name : "All Projects";
    };

    const getSelectedPriorityName = () => {
        if (selectedPriority === "all") return "All Priorities";
        return `${selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)} Priority`;
    };

    const getSelectedAssigneeName = () => {
        if (selectedAssignee === "all") return "All Assignees";
        const assignee = assignees.find(a => a._id === selectedAssignee);
        if (!assignee) return "All Assignees";
        return assignee.firstName || assignee.lastName
            ? `${assignee.firstName || ""} ${assignee.lastName || ""}`.trim()
            : assignee.email;
    };

    return (
        <div className="flexBetween px-1 mb-1">
            <Header className={"whitespace-nowrap md:text-lg 2xl:text-xl"}>Task Board</Header>
            <div className="hidden md:flex gap-2 2xl:gap-1 items-center">
                <MonthSelector
                    selectedMonth={selectedMonth}
                    onMonthChange={onMonthChange}
                />

                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs w-full md:w-40 lg:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z" />
                        </svg>
                    </div>
                </div>

                {/* Project Selector */}
                <div className="relative" ref={projectDropdownRef}>
                    <button
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
                        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-1 animate-in fade-in slide-in-from-bottom-1 duration-200 max-h-64 overflow-y-auto">
                            <button
                                onClick={() => { onProjectChange("all"); setIsProjectDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedProject === "all" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                            >
                                All Projects
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            {projects?.map((project) => (
                                <button
                                    key={project._id}
                                    onClick={() => { onProjectChange(project._id); setIsProjectDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 ${selectedProject === project._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                                >
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="truncate">{project.name}</span>
                                </button>
                            ))}
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={() => { onProjectChange("other"); setIsProjectDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedProject === "other" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                            >
                                Other Tasks
                            </button>
                        </div>
                    )}
                </div>

                {/* Priority Selector */}
                <div className="relative" ref={priorityDropdownRef}>
                    <button
                        onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                        className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-white border border-gray-200 hover:border-gray-300 min-w-[130px]"
                    >
                        <MdFlag className={`${selectedPriority === 'high' ? 'text-red-500' : selectedPriority === 'medium' ? 'text-yellow-500' : selectedPriority === 'low' ? 'text-green-500' : 'text-gray-400'} text-sm`} />
                        <span className="text-gray-700">{getSelectedPriorityName()}</span>
                        <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isPriorityDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isPriorityDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            {[
                                { id: "all", label: "All Priorities", color: "gray" },
                                { id: "high", label: "High Priority", color: "red" },
                                { id: "medium", label: "Medium Priority", color: "yellow" },
                                { id: "low", label: "Low Priority", color: "green" },
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => { onPriorityChange(p.id); setIsPriorityDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 ${selectedPriority === p.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                                >
                                    <MdFlag className={`text-${p.color === 'yellow' ? 'yellow-500' : p.color === 'red' ? 'red-500' : p.color === 'green' ? 'green-500' : 'gray-400'}`} />
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assignee Selector (Admin only) */}
                {user?.role === "company-admin" && (
                    <div className="relative" ref={assigneeDropdownRef}>
                        <button
                            onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                            className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-white border border-gray-200 hover:border-gray-300 min-w-[130px]"
                        >
                            <MdPerson className="text-gray-400 text-sm" />
                            <span className="max-w-[90px] truncate text-gray-700">
                                {getSelectedAssigneeName()}
                            </span>
                            <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isAssigneeDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isAssigneeDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-1 animate-in fade-in slide-in-from-bottom-1 duration-200 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => { onAssigneeChange("all"); setIsAssigneeDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors ${selectedAssignee === "all" ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                                >
                                    All Assignees
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                {assignees.map((a) => (
                                    <button
                                        key={a._id}
                                        onClick={() => { onAssigneeChange(a._id); setIsAssigneeDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 ${selectedAssignee === a._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] text-gray-600 font-bold overflow-hidden border border-gray-200">
                                            {a.profileImage ? (
                                                <img src={a.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (a.firstName?.charAt(0) || a.email?.charAt(0))
                                            )}
                                        </div>
                                        <span className="truncate">
                                            {a.firstName || a.lastName
                                                ? `${a.firstName || ""} ${a.lastName || ""}`.trim()
                                                : a.email}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Type Filter Dropdown */}
                <div className="relative" ref={typeDropdownRef}>
                    <button
                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                        className="flex items-center cursor-pointer gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium transition-all duration-200 hover:border-gray-300 min-w-[120px]"
                    >
                        <MdTask className="text-gray-400 text-sm" />
                        <span className="text-gray-700">
                            {selectedTypes.length === 3
                                ? "All Types"
                                : selectedTypes.length === 0
                                    ? "No Types"
                                    : `${selectedTypes.length} Selected`}
                        </span>
                        <IoChevronDown className={`text-gray-400 transition-transform duration-200 ml-auto ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isTypeDropdownOpen && (
                        <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] p-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            {[
                                { id: "task", label: "Regular Tasks" },
                                { id: "subtask", label: "Subtasks" },
                                { id: "extra", label: "Extra Tasks" },
                            ].map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                                >
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(item.id)}
                                            onChange={() => {
                                                const newTypes = selectedTypes.includes(item.id)
                                                    ? selectedTypes.filter((t) => t !== item.id)
                                                    : [...selectedTypes, item.id];
                                                onTypesChange(newTypes);
                                            }}
                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:bg-blue-600 checked:border-blue-600"
                                        />
                                        <svg
                                            className="absolute h-3 w-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                            {selectedTypes.length !== 3 && (
                                <button
                                    onClick={() => onTypesChange(["task", "subtask", "extra"])}
                                    className="mt-1 w-full text-left px-2.5 py-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium border-t border-gray-100 pt-1.5"
                                >
                                    Select All
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {canCreateTask && (
                    <button
                        onClick={onAddTaskClick}
                        className="h-fit px-4 py-1.5 bg-blue-600 whitespace-nowrap cursor-pointer text-xs text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        + Add Task
                    </button>
                )}

                <button
                    onClick={onRefresh}
                    className="p-1.5 bg-white h-fit hover:bg-gray-50 transition-colors rounded-lg border border-gray-200 hover:border-gray-300"
                >
                    <img src={assetPath("icons/refresh.svg")} alt="Refresh" className="w-4 h-4 opacity-70" />
                </button>
            </div>
        </div>
    );
};

export default BoardFilters;
