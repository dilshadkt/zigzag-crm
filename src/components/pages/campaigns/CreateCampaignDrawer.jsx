import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiDollarSign, FiType, FiTag, FiFolder } from "react-icons/fi";
import { useCreateCampaign } from "../../../api/campaigns";
import { useCompanyProjects, useProjectTasks } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";

const CreateCampaignDrawer = ({ isOpen, onClose }) => {
  const { companyId, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    budget: "",
    startDate: "",
    endDate: "",
    description: "",
    project: "",
    task: "",
    platform: "",
    status: "planned",
  });

  const [errors, setErrors] = useState({});

  const { mutate: createCampaign, isLoading } = useCreateCampaign();
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useCompanyProjects(
    companyId,
    0 // No limit - get all projects
  );

  // Fetch tasks for selected project (only tasks, not subtasks)
  const { data: projectTasksData, isLoading: tasksLoading } = useProjectTasks(
    formData.project || null
  );

  // Filter to get only tasks (not subtasks) - subtasks have itemType "subtask" or parentTask field
  const tasks = (projectTasksData || []).filter(
    (item) => item.itemType === "task" || !item.parentTask
  );

  // Platform options
  const platformOptions = [
    "Facebook",
    "Instagram",
    "Google Ads",
    "LinkedIn",
    "Twitter",
    "TikTok",
    "YouTube",
    "Organic",
    "Other",
  ];

  // Status options
  const statusOptions = [
    { value: "planned", label: "Planned" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when drawer closes
      setFormData({
        name: "",
        budget: "",
        startDate: "",
        endDate: "",
        description: "",
        project: "",
        task: "",
        platform: "",
        status: "planned",
      });
      setErrors({});
    }
  }, [isOpen]);

  // Clear task selection when project changes
  useEffect(() => {
    if (formData.project) {
      setFormData((prev) => ({
        ...prev,
        task: "", // Clear task when project changes
      }));
    }
  }, [formData.project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Campaign name is required";
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = "Budget must be greater than 0";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (!formData.project) {
      newErrors.project = "Project selection is required";
    }

    if (!formData.task) {
      newErrors.task = "Task selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    createCampaign(
      {
        name: formData.name.trim(),
        budget: parseFloat(formData.budget),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim() || undefined,
        task: formData.task,
        platform: formData.platform || undefined,
        status: formData.status,
      },
      {
        onSuccess: () => {
          toast.success("Campaign created successfully!");
          onClose();
        },
        onError: (err) => {
          console.error("Failed to create campaign:", err);
          const errorMessage =
            err?.response?.data?.message || "Failed to create campaign";
          toast.error(errorMessage);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Create New Campaign
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fill in the details to create a new campaign
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-800"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiType className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.name ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="Enter campaign name"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFolder className="text-gray-400" />
                  </div>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white ${
                      errors.project ? "border-red-300" : "border-gray-200"
                    }`}
                    required
                    disabled={projectsLoading}
                  >
                    <option value="">
                      {projectsLoading ? "Loading projects..." : "Select a project"}
                    </option>
                    {(projects || []).map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.project && (
                  <p className="mt-1 text-xs text-red-500">{errors.project}</p>
                )}
              </div>

              {/* Task Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="task"
                    value={formData.task}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white ${
                      errors.task ? "border-red-300" : "border-gray-200"
                    }`}
                    required
                    disabled={!formData.project || tasksLoading}
                  >
                    <option value="">
                      {!formData.project
                        ? "Select a project first"
                        : tasksLoading
                        ? "Loading tasks..."
                        : tasks.length === 0
                        ? "No tasks available"
                        : "Select a task"}
                    </option>
                    {tasks.map((task) => (
                      <option key={task._id} value={task._id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.task && (
                  <p className="mt-1 text-xs text-red-500">{errors.task}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.budget ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.budget && (
                  <p className="mt-1 text-xs text-red-500">{errors.budget}</p>
                )}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        errors.startDate ? "border-red-300" : "border-gray-200"
                      }`}
                      required
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || undefined}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                        errors.endDate ? "border-red-300" : "border-gray-200"
                      }`}
                      required
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="text-gray-400" />
                  </div>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="">Select platform (optional)</option>
                    {platformOptions.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Enter campaign description..."
                  ></textarea>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 font-semibold hover:bg-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#3F8CFF] text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCampaignDrawer;
