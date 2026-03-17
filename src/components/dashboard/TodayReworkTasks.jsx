import React, { useState } from "react";
import { useTodayTasks } from "../../api/hooks/dashboard";
import { useGetAllEmployees } from "../../api/hooks";
import { FaReply, FaExclamationTriangle, FaUserCircle } from "react-icons/fa";

const TodayReworkTasks = () => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const { data, isLoading } = useTodayTasks(selectedEmployeeId);
    const { data: employeesData } = useGetAllEmployees();

    const employees = employeesData?.employees || [];
    const reworkTasks = data?.reworkTasks || [];
    const reworkSubTasks = data?.reworkSubTasks || [];
    const allReworkItems = [...reworkTasks, ...reworkSubTasks];

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <div className="flex flex-col gap-3 mb-4">
                <div>
                    <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                        <FaReply className="text-red-500" />
                        Today Rework ({allReworkItems.length})
                    </h3>
                    <p className="text-[11px] text-gray-400">Returned for revision today</p>
                </div>

                <div className="relative">
                    <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full bg-red-50/50 border border-red-100 text-gray-700 text-[11px] rounded-lg focus:ring-red-500 focus:border-red-500 block p-2 appearance-none cursor-pointer hover:bg-red-50 transition-colors"
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
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-red-100">
                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : allReworkItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <FaExclamationTriangle className="text-4xl mb-2 opacity-20" />
                        <p>No rework tasks assigned for today</p>
                    </div>
                ) : (
                    allReworkItems.map((item) => (
                        <ReworkItem key={item._id} item={item} />
                    ))
                )}
            </div>
        </div>
    );
};

const ReworkItem = ({ item }) => {
    const isSubTask = !!item.parentTask;
    const project = item.project;
    const assignedTo = item.assignedTo?.[0];

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 hover:border-red-300 transition-all hover:shadow-md group">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isSubTask ? "bg-purple-100 text-purple-600" : "bg-red-100 text-red-600"
                        }`}>
                            {isSubTask ? "Subtask" : "Task"}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                            {project?.name || "No Project"}
                        </span>
                    </div>
                    <h5 className="font-semibold text-gray-800 text-sm truncate group-hover:text-red-600 transition-colors">
                        {item.title}
                    </h5>
                    {item.reworkHistory?.length > 0 && (
                        <p className="text-[11px] text-red-500 mt-1 italic line-clamp-1">
                            Reason: {item.reworkHistory[item.reworkHistory.length - 1].reason || "Generic rework"}
                        </p>
                    )}
                </div>

                <div className="flex -space-x-2">
                    {item.assignedTo?.slice(0, 2).map((user, idx) => (
                        <Avatar key={user._id || idx} user={user} />
                    ))}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {assignedTo && (
                        <div className="flex items-center gap-1.5">
                            <Avatar user={assignedTo} size="w-4 h-4" fontSize="text-[8px]" />
                            <span className="text-[11px] text-gray-500 font-medium">
                                {assignedTo.firstName} {assignedTo.lastName}
                            </span>
                        </div>
                    )}
                </div>
                
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Needs Rework
                </span>
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

export default TodayReworkTasks;
