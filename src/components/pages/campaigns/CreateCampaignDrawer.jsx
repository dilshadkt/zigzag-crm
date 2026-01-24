import React, { useState, useEffect, useMemo } from "react";
import { FiX, FiCalendar, FiType, FiTag, FiFolder, FiInfo } from "react-icons/fi";
import { useCreateCampaign } from "../../../api/campaigns";
import { useCompanyProjects, useProjectTasks, useExternalTasks } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";
import SearchableSelect from "./SearchableSelect";

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
  
  // Check if "External/Other" is selected
  const isExternalProject = formData.project === "external";
  // Check if "External/Task" is selected
  const isExternalTask = formData.task === "external";
  
  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useCompanyProjects(
    companyId,
    0 // No limit - get all projects
  );

  // Fetch tasks for selected project (only tasks, not subtasks)
  // Only fetch if a real project is selected (not "external")
  const { data: projectTasksData, isLoading: tasksLoading } = useProjectTasks(
    formData.project && !isExternalProject ? formData.project : null
  );

  // Fetch external tasks (tasks with project: null)
  const { data: externalTasks = [], isLoading: externalTasksLoading } = useExternalTasks(
    companyId,
    true // Always enabled
  );

  // Filter to get only tasks (not subtasks) - subtasks have itemType "subtask" or parentTask field
  const tasks = (projectTasksData || []).filter(
    (item) => item.itemType === "task" || !item.parentTask
  );

  // Prepare project options for SearchableSelect
  const projectOptions = useMemo(() => {
    const options = [
      { value: "external", label: "External/Other" },
      ...(projects || []).map((project) => ({
        value: project._id,
        label: project.name,
      })),
    ];
    return options;
  }, [projects]);

  // Prepare task options for SearchableSelect
  const taskOptions = useMemo(() => {
    const options = [];
    
    // If a project is selected (not external), show External/Task option first, then project tasks
    if (formData.project && !isExternalProject) {
      // Always add External/Task option as the FIRST option when a project is selected
      options.push({ value: "external", label: "External/Task" });
      
      // Add project tasks after External/Task
      if (tasks && tasks.length > 0) {
        options.push(
          ...tasks.map((task) => ({
            value: task._id,
            label: task.title,
          }))
        );
      }
      
      // Add existing external tasks (filter out subtasks)
      if (externalTasks && Array.isArray(externalTasks) && externalTasks.length > 0) {
        const filteredExternalTasks = externalTasks.filter(
          (task) => {
            // Filter out subtasks - keep only tasks
            const isTask = !task.itemType || task.itemType === "task" || !task.parentTask;
            return isTask;
          }
        );
        
        if (filteredExternalTasks.length > 0) {
          options.push(
            ...filteredExternalTasks.map((task) => ({
              value: task._id,
              label: task.title || "Untitled Task",
            }))
          );
        }
      }
    } else if (isExternalProject) {
      // If External/Other project is selected, show external tasks
      if (externalTasks && Array.isArray(externalTasks) && externalTasks.length > 0) {
        const filteredExternalTasks = externalTasks.filter(
          (task) => {
            // Filter out subtasks - keep only tasks
            const isTask = !task.itemType || task.itemType === "task" || !task.parentTask;
            return isTask;
          }
        );
        
        if (filteredExternalTasks.length > 0) {
          options.push(
            ...filteredExternalTasks.map((task) => ({
              value: task._id,
              label: task.title || "Untitled Task",
            }))
          );
        }
      }
      // Note: We'll create a new task automatically if none is selected
    }
    
    return options;
  }, [tasks, externalTasks, formData.project, isExternalProject]);

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

    // Project validation
    if (!formData.project) {
      newErrors.project = "Project selection is required";
    }

    // Task validation - not required if external project or external task is selected
    if (!isExternalProject && !isExternalTask && !formData.task) {
      newErrors.task = "Task selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      let taskId = null;

      // If "External/Task" is selected or "External/Other" project is selected, set taskId to null
      if (isExternalTask || isExternalProject) {
        // Don't create a task - just keep campaign separate with task: null
        taskId = null;
      } else {
        // Normal case: use selected task ID
        taskId = formData.task;
      }

      // Create the campaign
      createCampaign(
        {
          name: formData.name.trim(),
          budget: parseFloat(formData.budget),
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description.trim() || undefined,
          task: taskId, // Can be null if External/Task is selected
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
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create task for campaign"
      );
    }
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
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50/50">
            <h2 className="text-lg font-bold text-gray-900">
              Create New Campaign
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-800"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiType className="text-gray-400 text-sm" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Project <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  options={projectOptions}
                  placeholder={projectsLoading ? "Loading projects..." : "Select a project"}
                  disabled={projectsLoading}
                  loading={projectsLoading}
                  error={!!errors.project}
                  icon={FiFolder}
                />
                {errors.project && (
                  <p className="mt-1 text-xs text-red-500">{errors.project}</p>
                )}
                {isExternalProject && (
                  <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0 text-sm" />
                    <p className="text-xs text-blue-800">
                      This campaign will not be linked to any project or task.
                    </p>
                  </div>
                )}
              </div>

              {/* Task Selection - Only show if not external project */}
              {!isExternalProject && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Task <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    name="task"
                    value={formData.task}
                    onChange={handleChange}
                    options={taskOptions}
                    placeholder={
                      !formData.project
                        ? "Select a project first"
                        : tasksLoading || externalTasksLoading
                        ? "Loading tasks..."
                        : taskOptions.length === 0
                        ? "No tasks available"
                        : "Select a task"
                    }
                    disabled={!formData.project || tasksLoading || externalTasksLoading}
                    loading={tasksLoading || externalTasksLoading}
                    error={!!errors.task}
                  />
                  {errors.task && (
                    <p className="mt-1 text-xs text-red-500">{errors.task}</p>
                  )}
                  {isExternalTask && (
                    <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0 text-sm" />
                      <p className="text-xs text-blue-800">
                        This campaign will not be linked to any task.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-medium">₹</span>
                  </div>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`block w-full pl-8 pr-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400 text-sm" />
                    </div>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || undefined}
                      className={`block w-full pl-8 pr-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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

              {/* Platform and Status in one row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Platform
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <FiTag className="text-gray-400 text-sm" />
                    </div>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      className="block w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                    >
                      <option value="">Select platform</option>
                      {platformOptions.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Enter campaign description..."
                ></textarea>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2 text-sm bg-[#3F8CFF] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Campaign..." : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCampaignDrawer;
