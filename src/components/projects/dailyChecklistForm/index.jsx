import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { MdEdit, MdCheck, MdClose, MdDelete } from "react-icons/md";
import { useGetAllEmployees } from "../../../api/hooks";

const DailyChecklistForm = ({ values, setFieldValue, errors, touched }) => {
    const { data: employeesData } = useGetAllEmployees();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingAssignedTo, setEditingAssignedTo] = useState("");

    const employees = employeesData?.employees || [];

    const handleAddStart = () => {
        if (!newTaskTitle.trim()) return;

        const currentList = values.dailyChecklist || [];
        const newList = [
            ...currentList,
            {
                title: newTaskTitle,
                active: true,
                assignedTo: newTaskAssignedTo || undefined,
            },
        ];

        setFieldValue("dailyChecklist", newList);
        setNewTaskTitle("");
        setNewTaskAssignedTo("");
    };

    const handleRemoveTask = (index) => {
        const currentList = [...(values.dailyChecklist || [])];
        currentList.splice(index, 1);
        setFieldValue("dailyChecklist", currentList);
    };

    const handleToggleTask = (index) => {
        const currentList = [...(values.dailyChecklist || [])];
        currentList[index].active = !currentList[index].active;
        setFieldValue("dailyChecklist", currentList);
    };

    const handleEditStart = (index, title, assignedToId) => {
        setEditingIndex(index);
        setEditingTitle(title);
        setEditingAssignedTo(assignedToId || "");
    };

    const handleEditSave = () => {
        if (!editingTitle.trim()) return;
        const currentList = [...(values.dailyChecklist || [])];
        currentList[editingIndex].title = editingTitle;
        currentList[editingIndex].assignedTo = editingAssignedTo || undefined;
        setFieldValue("dailyChecklist", currentList);
        setEditingIndex(null);
        setEditingTitle("");
        setEditingAssignedTo("");
    };

    const handleEditCancel = () => {
        setEditingIndex(null);
        setEditingTitle("");
        setEditingAssignedTo("");
    };

    const commonTasks = [
        "Post Story",
        "Post Reel",
        "Check DMs",
        "Engage with Followers",
        "Review Ad Performance",
    ];

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStart())}
                    placeholder="Add a daily recurring task..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={newTaskAssignedTo}
                    onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                    className="sm:w-48 bg-white px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                            {emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()}
                        </option>
                    ))}
                </select>
                <PrimaryButton
                    title="Add Task"
                    onclick={handleAddStart}
                    className="text-white px-6"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 pt-1">Suggestions:</span>
                {commonTasks.map((task, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setNewTaskTitle(task)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700 transition-colors"
                    >
                        + {task}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                {!values.dailyChecklist || values.dailyChecklist.length === 0 ? (
                    <div className="h-40 flexCenter flex-col text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <p>No recurring tasks defined yet.</p>
                        <p className="text-sm">Add tasks above to get started.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {values.dailyChecklist.map((task, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${task.active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200 opacity-70"
                                    } ${editingIndex === index ? "ring-2 ring-blue-100 border-blue-300" : ""}`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className={`w-2 h-2 rounded-full flex-shrink-0 ${task.active ? "bg-green-500" : "bg-gray-300"}`}
                                        title={task.active ? "Active" : "Inactive"}
                                    />
                                    {editingIndex === index ? (
                                        <div className="flex flex-1 flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleEditSave();
                                                    } else if (e.key === "Escape") {
                                                        handleEditCancel();
                                                    }
                                                }}
                                                autoFocus
                                                className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <select
                                                value={editingAssignedTo}
                                                onChange={(e) => setEditingAssignedTo(e.target.value)}
                                                className="sm:w-40 bg-white px-2 py-1 border border-gray-300 text-gray-700 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                                            >
                                                <option value="">Unassigned</option>
                                                {employees.map((emp) => (
                                                    <option key={emp._id} value={emp._id}>
                                                        {emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 items-center justify-between min-w-0">
                                            <span className={`font-medium text-sm ${!task.active && "text-gray-500 line-through"}`}>
                                                {task.title}
                                            </span>
                                            {task.assignedTo && (
                                                <span className="text-[11px] text-gray-500 bg-gray-100/80 px-2.5 py-1 rounded-full border border-gray-200/80 flex items-center gap-1 font-medium select-none">
                                                    Assigned: {
                                                        (() => {
                                                            const assignedToId = task.assignedTo?._id || task.assignedTo;
                                                            const matchedEmp = employees.find(e => e._id === assignedToId);
                                                            return matchedEmp 
                                                                ? matchedEmp.name || `${matchedEmp.firstName || ""} ${matchedEmp.lastName || ""}`.trim() 
                                                                : "Team Member";
                                                        })()
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 ml-4">
                                    {editingIndex === index ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleEditSave}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Save Changes"
                                            >
                                                <MdCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleEditCancel}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel"
                                            >
                                                <MdClose className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleEditStart(index, task.title, task.assignedTo?._id || task.assignedTo)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Task"
                                            >
                                                <MdEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleTask(index)}
                                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${task.active
                                                    ? "text-gray-400 border-gray-200 hover:bg-gray-50"
                                                    : "text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                                                    }`}
                                            >
                                                {task.active ? "Disable" : "Enable"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTask(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Task"
                                            >
                                                <MdDelete className="w-5 h-5" />
                                                <span className="sr-only">Delete</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyChecklistForm;
