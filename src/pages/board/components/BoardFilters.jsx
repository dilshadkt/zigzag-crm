import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/shared/header";
import MonthSelector from "../../../components/shared/MonthSelector";
import { assetPath } from "../../../utils/assetPath";

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
    const typeDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                typeDropdownRef.current &&
                !typeDropdownRef.current.contains(event.target)
            ) {
                setIsTypeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flexBetween">
            <Header className={"whitespace-nowrap"}>Task Board</Header>
            <div className="hidden md:flex gap-2 2xl:gap-3 items-center">
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
                        className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z" />
                        </svg>
                    </div>
                </div>

                {/* Project Selector */}
                <div className="relative">
                    <select
                        value={selectedProject}
                        onChange={(e) => onProjectChange(e.target.value)}
                        className="appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm max-w-[200px] w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer hover:border-gray-300 transition-colors"
                    >
                        <option value="all">All Projects</option>
                        {projects?.map((project) => (
                            <option key={project._id} value={project._id}>
                                {project.name}
                            </option>
                        ))}
                        <option value="other">Other Tasks</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Priority Selector */}
                <div className="relative">
                    <select
                        value={selectedPriority}
                        onChange={(e) => onPriorityChange(e.target.value)}
                        className="appearance-none px-4 py-2 max-w-[200px] w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer hover:border-gray-300 transition-colors"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Assignee Selector (Admin only) */}
                {user?.role === "company-admin" && (
                    <div className="relative">
                        <select
                            value={selectedAssignee}
                            onChange={(e) => onAssigneeChange(e.target.value)}
                            className="appearance-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none max-w-[200px] w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <option value="all">All Assignees</option>
                            {assignees.map((a) => (
                                <option key={a._id} value={a._id}>
                                    {a.firstName || a.lastName
                                        ? `${a.firstName || ""} ${a.lastName || ""}`.trim()
                                        : a.email}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Type Filter Dropdown */}
                <div className="relative" ref={typeDropdownRef}>
                    <button
                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                        className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm min-w-[150px] hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <span className="text-gray-700">
                            {selectedTypes.length === 3
                                ? "All Types"
                                : selectedTypes.length === 0
                                    ? "No Types selected"
                                    : `${selectedTypes.length} Type${selectedTypes.length > 1 ? "s" : ""} selected`}
                        </span>
                        <svg
                            className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isTypeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {[
                                { id: "task", label: "Regular Tasks" },
                                { id: "subtask", label: "Subtasks" },
                                { id: "extra", label: "Extra Tasks" },
                            ].map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
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
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:bg-blue-600 checked:border-blue-600"
                                        />
                                        <svg
                                            className="absolute h-3.5 w-3.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                            {selectedTypes.length !== 3 && (
                                <button
                                    onClick={() => onTypesChange(["task", "subtask", "extra"])}
                                    className="mt-1 w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium border-t border-gray-100"
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
                        className="h-fit px-5 p-2 bg-blue-600 whitespace-nowrap cursor-pointer text-sm text-white rounded-lg"
                    >
                        + Add Task
                    </button>
                )}

                <button
                    onClick={onRefresh}
                    className="p-2 bg-white h-fit hover:bg-gray-50 transition-colors rounded-lg border border-gray-200"
                >
                    <img src={assetPath("icons/refresh.svg")} alt="Refresh" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default BoardFilters;
