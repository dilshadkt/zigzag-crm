import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import { MdEdit, MdCheck, MdClose, MdDelete } from "react-icons/md";

const DailyChecklistForm = ({ values, setFieldValue, errors, touched }) => {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const handleAddStart = () => {
        if (!newTaskTitle.trim()) return;

        const currentList = values.dailyChecklist || [];
        const newList = [
            ...currentList,
            {
                title: newTaskTitle,
                active: true,
            },
        ];

        setFieldValue("dailyChecklist", newList);
        setNewTaskTitle("");
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

    const handleEditStart = (index, title) => {
        setEditingIndex(index);
        setEditingTitle(title);
    };

    const handleEditSave = () => {
        if (!editingTitle.trim()) return;
        const currentList = [...(values.dailyChecklist || [])];
        currentList[editingIndex].title = editingTitle;
        setFieldValue("dailyChecklist", currentList);
        setEditingIndex(null);
        setEditingTitle("");
    };

    const handleEditCancel = () => {
        setEditingIndex(null);
        setEditingTitle("");
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
            {/* <div className="bg-blue-50 p-4 rounded-xl">
                <h5 className="font-semibold text-blue-900 mb-2">
                    Daily Recurring Tasks
                </h5>
                <p className="text-sm text-blue-700">
                    Define the checklist of tasks that need to be completed <b>every day</b> for this project.
                    A new checklist will be automatically generated each day based on these items.
                </p>
            </div> */}

            <div className="flex gap-3">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStart())}
                    placeholder="Add a daily recurring task..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                                <div className="flex items-center gap-3 flex-1">
                                    <div
                                        className={`w-2 h-2 rounded-full flex-shrink-0 ${task.active ? "bg-green-500" : "bg-gray-300"}`}
                                        title={task.active ? "Active" : "Inactive"}
                                    />
                                    {editingIndex === index ? (
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
                                    ) : (
                                        <span className={`font-medium text-sm ${!task.active && "text-gray-500 line-through"}`}>
                                            {task.title}
                                        </span>
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
                                                onClick={() => handleEditStart(index, task.title)}
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
