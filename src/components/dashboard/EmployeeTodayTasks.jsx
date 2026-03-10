import React, { useState } from "react";
import { useTodayTasks } from "../../api/hooks/dashboard";
import { useGetAllEmployees } from "../../api/hooks";
import { FaTasks, FaCheckCircle, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const EmployeeTodayTasks = () => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const { data, isLoading } = useTodayTasks(selectedEmployeeId);
    const { data: employeesData } = useGetAllEmployees();

    const employees = employeesData?.employees || [];

    const tasks = data?.tasks || [];
    const subTasks = data?.subTasks || [];
    const completedTasks = data?.completedTasks || [];
    const completedSubTasks = data?.completedSubTasks || [];

    const activeItems = [...tasks, ...subTasks];
    const completedItems = [...completedTasks, ...completedSubTasks];

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-[470px] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        Employees Today Tasks
                    </h3>
                    <p className="text-sm text-gray-500">Real-time task tracking for all employees</p>
                </div>

                <div className="relative min-w-[200px]">
                    <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="">All Employees</option>
                        {employees.map((emp) => {
                            const empName = emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unnamed";
                            return (
                                <option key={emp._id} value={emp._id}>
                                    {empName}
                                </option>
                            );
                        })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                {/* Active Today */}
                <div className="flex flex-col h-full bg-slate-50 rounded-2xl p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Active Today ({activeItems.length})
                        </h4>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-white rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : activeItems.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <FaTasks className="mx-auto text-4xl mb-2 opacity-20" />
                                <p>No active tasks for today</p>
                            </div>
                        ) : (
                            activeItems.map((item) => (
                                <TaskItem key={item._id} item={item} status="active" />
                            ))
                        )}
                    </div>
                </div>

                {/* Completed Today */}
                <div className="flex flex-col h-full bg-emerald-50 rounded-2xl p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h4 className="font-semibold text-emerald-700 flex items-center gap-2">
                            <FaCheckCircle className="text-emerald-500" />
                            Completed Today ({completedItems.length})
                        </h4>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-emerald-100">
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-white rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : completedItems.length === 0 ? (
                            <div className="text-center py-10 text-emerald-300">
                                <FaCheckCircle className="mx-auto text-4xl mb-2 opacity-20" />
                                <p>No tasks completed today yet</p>
                            </div>
                        ) : (
                            completedItems.map((item) => (
                                <TaskItem key={item._id} item={item} status="completed" />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Avatar = ({ user, size = "w-7 h-7", fontSize = "text-[10px]" }) => {
    const userName = user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "U";
    const firstLetter = userName.charAt(0).toUpperCase();

    if (user?.profileImage) {
        return (
            <img
                src={user.profileImage}
                alt={userName}
                className={`${size} rounded-full border-2 border-white object-cover shadow-sm`}
                title={userName}
            />
        );
    }

    return (
        <div
            className={`${size} rounded-full border-2 border-white bg-blue-500 flex items-center justify-center ${fontSize} font-bold text-white uppercase shadow-sm`}
            title={userName}
        >
            {firstLetter}
        </div>
    );
};

const TaskItem = ({ item, status }) => {
    const isSubTask = !!item.parentTask;
    const project = item.project;
    const assignedTo = item.assignedTo?.[0]; // Primary assigned person

    return (
        <div className="bg-white p-3 rounded-xl shadow-sm border border-transparent hover:border-blue-200 transition-all hover:shadow-md cursor-default group">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isSubTask ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                            }`}>
                            {isSubTask ? "Subtask" : "Task"}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                            {project?.name || "No Project"}
                        </span>
                    </div>
                    <h5 className="font-medium text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {item.title}
                    </h5>
                </div>

                <div className="flex -space-x-2">
                    {item.assignedTo?.slice(0, 2).map((user, idx) => (
                        <Avatar key={user._id || idx} user={user} />
                    ))}
                    {item.assignedTo?.length > 2 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            +{item.assignedTo.length - 2}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {assignedTo && (
                        <div className="flex items-center gap-1.5">
                            <Avatar user={assignedTo} size="w-4 h-4" fontSize="text-[8px]" />
                            <span className="text-[11px] text-gray-500">
                                {assignedTo.firstName} {assignedTo.lastName}
                            </span>
                        </div>
                    )}
                </div>

                {status === "completed" ? (
                    <span className="text-[10px] text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                        Completed at {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                ) : (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-50 text-red-500' :
                        item.priority === 'medium' ? 'bg-blue-50 text-blue-500' :
                            'bg-gray-50 text-gray-500'
                        }`}>
                        {item.priority || 'Normal'} priority
                    </span>
                )}
            </div>
        </div>
    );
};

export default EmployeeTodayTasks;
