import React, { useState, useEffect } from "react";
import { IoArrowUpOutline } from "react-icons/io5";

const NoteForm = ({ note, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    priority: "medium",
  });

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || "",
        desc: note.desc || "",
        priority: note.priority || "medium",
      });
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && !isLoading) {
      onSave(formData);
      if (!note) {
        setFormData({ title: "", desc: "", priority: "medium" });
      }
    }
  };

  const priorityOptions = [
    { value: "low", label: "Low", color: "#00D097" },
    { value: "medium", label: "Medium", color: "#FFBD21" },
    { value: "high", label: "High", color: "#FF4D4F" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Field */}
      <div className="flex flex-col gap-y-2">
        <label className="text-sm text-[#91929E] font-medium">Note Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter note title..."
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>

      {/* Description Field */}
      <div className="flex flex-col gap-y-2">
        <label className="text-sm text-[#91929E] font-medium">
          Description
        </label>
        <textarea
          name="desc"
          value={formData.desc}
          onChange={handleChange}
          placeholder="Enter note description..."
          rows="4"
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Priority Field */}
      <div className="flex flex-col gap-y-2">
        <label className="text-sm text-[#91929E] font-medium">Priority</label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-2xl p-3 border-2 transition-all duration-200 flexCenter gap-x-2 ${
                formData.priority === option.value
                  ? "border-current bg-opacity-10"
                  : "border-gray-200 hover:border-gray-300"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{
                color:
                  formData.priority === option.value ? option.color : "#7D8592",
                backgroundColor:
                  formData.priority === option.value
                    ? `${option.color}15`
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="priority"
                value={option.value}
                checked={formData.priority === option.value}
                onChange={handleChange}
                disabled={isLoading}
                className="sr-only"
              />
              <IoArrowUpOutline className="text-sm" />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flexEnd gap-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-2xl border border-gray-200 text-[#7D8592] hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.title.trim()}
          className="px-6 py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flexCenter gap-x-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isLoading
            ? note
              ? "Updating..."
              : "Creating..."
            : note
            ? "Update Note"
            : "Create Note"}
        </button>
      </div>
    </form>
  );
};

export default NoteForm;
