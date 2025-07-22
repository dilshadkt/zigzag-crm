import React, { useEffect, useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import MultiSelect from "../../shared/Field/multiSelect";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";
import { useAddTaskForm } from "../../../hooks/useAddTaskForm";
import {
  useCreateTask,
  useGetTaskFlows,
  useProjectDetails,
  useGetAllEmployees,
} from "../../../api/hooks";
import FileAndLinkUpload from "../../shared/fileUpload";
import { useAuth } from "../../../hooks/useAuth";

const AddTask = ({
  isOpen,
  setShowModalTask,
  teams,
  initialValues,
  isLoading = false,
  onSubmit,
  projectData,
  isEdit = false,
  monthWorkDetails,
  selectedMonth,
  projects = [], // <-- add default empty array
  showProjectSelection = false, // <-- new prop to control project selection visibility
}) => {
  const { user } = useAuth();
  const companyId = user?.company;
  // Fetch task flows for the company
  const { data: taskFlowsData } = useGetTaskFlows(companyId);
  const taskFlows = taskFlowsData || [];

  const handleClose = () => {
    resetForm();
    setShowModalTask(false);
  };

  // Prepare initial values for the form
  const prepareInitialValues = () => {
    if (!initialValues) return {};

    return {
      title: initialValues.title || "",
      project: initialValues.project?._id || initialValues.project || null,
      taskGroup: initialValues.taskGroup || "",
      taskFlow: initialValues.taskFlow || "",
      extraTaskWorkType: initialValues.extraTaskWorkType || "",
      taskMonth: initialValues.taskMonth || selectedMonth || "",
      startDate: initialValues.startDate || "",
      dueDate: initialValues.dueDate || "",
      periority: initialValues.priority || "Low",
      assignedTo: initialValues.assignedTo
        ? Array.isArray(initialValues.assignedTo)
          ? initialValues.assignedTo.map((user) => user._id || user)
          : [initialValues.assignedTo._id || initialValues.assignedTo]
        : [],
      copyOfDescription: initialValues.copyOfDescription || "",
      description: initialValues.description || "",
      isRecurring: initialValues.isRecurring || false,
      recurringPattern: initialValues.recurringPattern || "none",
      recurringInterval: initialValues.recurringInterval || 1,
      recurringEndDate: initialValues.recurringEndDate || "",
      maxRecurrences: initialValues.maxRecurrences || "",
    };
  };

  const {
    values,
    touched,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useAddTaskForm(prepareInitialValues(), onSubmit);

  // Track selected project separately to avoid hook dependency issues
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialValues?.project?._id || initialValues?.project || ""
  );
  // Fetch project details when a project is selected
  const { data: selectedProjectData } = useProjectDetails(
    initialValues?.project?._id || null,
    {
      enabled: !!selectedProjectId && selectedProjectId !== "",
    }
  );

  // Fetch all employees when "Other" project is selected or no project is selected (for board view and tasks without projects)
  const { data: allEmployeesData, isLoading: isLoadingEmployees } =
    useGetAllEmployees(
      selectedProjectId === "other" ||
        selectedProjectId === "" ||
        selectedProjectId === null
    );

  // Set default taskMonth if not provided
  useEffect(() => {
    if (selectedMonth && !values.taskMonth) {
      setFieldValue("taskMonth", selectedMonth);
    }
  }, [selectedMonth, values.taskMonth, setFieldValue]);

  // Update selectedProjectId when values.project changes
  useEffect(() => {
    setSelectedProjectId(values?.project || "");
  }, [values?.project]);

  // Reset task group when project changes (only for new tasks, not edits)
  useEffect(() => {
    if (!isEdit && values.project !== initialValues?.project) {
      setFieldValue("taskGroup", "");
      setFieldValue("extraTaskWorkType", "");
    }
  }, [values.project, initialValues?.project, setFieldValue, isEdit]);

  // Handle task flow selection
  useEffect(() => {
    if (values.taskFlow && taskFlows.length > 0) {
      const selectedFlow = taskFlows.find(
        (flow) => flow._id === values.taskFlow
      );
      if (selectedFlow && selectedFlow.flows && selectedFlow.flows.length > 0) {
        // Get all assignees from the flow steps
        const flowAssignees = selectedFlow.flows
          .map((step) => step.assignee?._id || step.assignee)
          .filter((assigneeId) => assigneeId);
        // Remove duplicates
        const uniqueAssignees = Array.from(new Set(flowAssignees));
        // Update the assignedTo field with unique flow assignees
        setFieldValue("assignedTo", uniqueAssignees);
      }
    }
  }, [values.taskFlow, taskFlows, setFieldValue]);

  // Initialize form when modal opens for editing
  useEffect(() => {
    if (isOpen && isEdit && initialValues) {
      // Set project ID for editing
      setSelectedProjectId(
        initialValues.project?._id || initialValues.project || ""
      );

      // Ensure all fields are properly set
      const preparedValues = prepareInitialValues();
      Object.keys(preparedValues).forEach((key) => {
        if (preparedValues[key] !== undefined && preparedValues[key] !== null) {
          setFieldValue(key, preparedValues[key]);
        }
      });
    }
  }, [isOpen, isEdit, initialValues, setFieldValue]);

  // Get task group options from selected project's work details
  const getTaskGroupOptions = () => {
    // Use selected project data if available, otherwise fall back to monthWorkDetails or projectData
    let workDetails = null;

    if (selectedProjectData && selectedProjectId) {
      // Find the work details for the selected month from the selected project
      const projectMonthWorkDetails = selectedProjectData.workDetails?.find(
        (wd) => wd.month === selectedMonth
      );
      workDetails = projectMonthWorkDetails;
    } else {
      // Fallback to provided work details
      workDetails = monthWorkDetails || projectData?.workDetails;
    }

    if (!workDetails) return [];

    const options = [];

    // Add main work types
    if (workDetails.reels?.count > 0) {
      options.push({
        label: `Reels (${workDetails.reels.count} remaining)`,
        value: "reels",
      });
    }
    if (workDetails.poster?.count > 0) {
      options.push({
        label: `Poster (${workDetails.poster.count} remaining)`,
        value: "poster",
      });
    }
    if (workDetails.motionPoster?.count > 0) {
      options.push({
        label: `Motion Poster (${workDetails.motionPoster.count} remaining)`,
        value: "motionPoster",
      });
    }
    if (workDetails.shooting?.count > 0) {
      options.push({
        label: `Shooting (${workDetails.shooting.count} remaining)`,
        value: "shooting",
      });
    }
    if (workDetails.motionGraphics?.count > 0) {
      options.push({
        label: `Motion Graphics (${workDetails.motionGraphics.count} remaining)`,
        value: "motionGraphics",
      });
    }

    // Add other work types
    if (workDetails.other?.length > 0) {
      workDetails.other.forEach((item) => {
        if (item.count > 0) {
          options.push({
            label: `${item.name} (${item.count} remaining)`,
            value: item.name,
          });
        }
      });
    }

    // Always add Extra Task option
    options.push({
      label: "Extra Task",
      value: "extraTask",
    });

    return options;
  };

  // Get task flow options
  const getTaskFlowOptions = () => {
    const options = [{ label: "No Task Flow", value: "" }];

    if (taskFlows && taskFlows.length > 0) {
      taskFlows.forEach((flow) => {
        if (flow.isActive) {
          options.push({
            label: flow.name,
            value: flow._id,
          });
        }
      });
    }

    return options;
  };

  // Get extra task work type options based on selected project
  const getExtraTaskWorkTypeOptions = () => {
    // Use selected project data if available, otherwise fall back to monthWorkDetails or projectData
    let workDetails = null;

    if (selectedProjectData && selectedProjectId) {
      // Find the work details for the selected month from the selected project
      const projectMonthWorkDetails = selectedProjectData.workDetails?.find(
        (wd) => wd.month === selectedMonth
      );
      workDetails = projectMonthWorkDetails;
    } else {
      // Fallback to provided work details
      workDetails = monthWorkDetails || projectData?.workDetails;
    }

    if (!workDetails) return [];

    const options = [];
    options.push({ label: "Reels", value: "reels" });
    options.push({ label: "Poster", value: "poster" });
    options.push({ label: "Motion Poster", value: "motionPoster" });
    options.push({ label: "Shooting", value: "shooting" });
    options.push({ label: "Motion Graphics", value: "motionGraphics" });

    // Add other work types
    if (workDetails.other?.length > 0) {
      workDetails.other.forEach((item) => {
        options.push({
          label: item.name,
          value: item.name,
        });
      });
    }

    // Add general option
    options.push({ label: "General Extra Task", value: "general" });

    return options;
  };

  // Get assignee options based on selected project
  const getAssigneeOptions = () => {
    if (
      selectedProjectData &&
      selectedProjectId &&
      selectedProjectId !== "other"
    ) {
      // Use project teams if available
      return (
        selectedProjectData.teams?.map((user) => ({
          label: `${user.firstName} (${user.position})`,
          value: user._id,
        })) || []
      );
    } else if (
      (selectedProjectId === "other" ||
        selectedProjectId === "" ||
        selectedProjectId === null) &&
      allEmployeesData?.employees
    ) {
      // Use all company employees when "Other" is selected or no project is selected
      return (
        allEmployeesData.employees?.map((user) => ({
          label: `${user.name} (${user.position})`,
          value: user._id,
        })) || []
      );
    } else {
      // Fallback to provided teams prop
      return (
        teams?.map((user) => ({
          label: `${user.firstName} (${user.position})`,
          value: user._id,
        })) || []
      );
    }
  };

  console.log(errors);
  const taskGroupOptions = getTaskGroupOptions();
  const taskFlowOptions = getTaskFlowOptions();
  const extraTaskWorkTypeOptions = getExtraTaskWorkTypeOptions();

  // Check if "Other" project is selected or no project is selected
  const isOtherProjectSelected = selectedProjectId === "other";
  const isNoProjectSelected =
    selectedProjectId === "" || selectedProjectId === null;

  const isTaskGroupSelected =
    values.taskGroup && values.taskGroup !== "Select task group";
  const isExtraTaskSelected = values.taskGroup === "extraTask";
  const isExtraTaskWorkTypeSelected = isExtraTaskSelected
    ? values.extraTaskWorkType &&
      values.extraTaskWorkType !== "Select work type"
    : true;
  const isFormEnabled =
    isOtherProjectSelected ||
    isNoProjectSelected ||
    (isTaskGroupSelected && isExtraTaskWorkTypeSelected);

  // Add project select options
  const projectOptions = [
    { label: "No Project", value: null },
    ...projects.map((p) => ({ label: p.name, value: p._id })),
    { label: "Other", value: "other" },
  ];

  const recurringOptions = [
    { label: "Don't repeat", value: "none" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  if (!isOpen) return null;
  return (
    <div
      className="fixed left-0 right-0 top-0 bottom-0
bg-[#2155A3]/15 backdrop-blur-sm py-8 z-50 flexCenter"
    >
      <div
        className="p-10 bg-white pt-12  px-12 flex flex-col
rounded-3xl max-w-[584px] w-full h-full relative"
      >
        {isLoading && (
          <div className="h-full flexCenter">
            <img src="/icons/loading.svg" alt="" className="w-20" />
          </div>
        )}
        {!isLoading && (
          <>
            <div className="w-full h-full flex flex-col overflow-y-auto">
              <h4 className="text-lg pb-2 font-medium sticky top-0 bg-white z-20">
                {isEdit ? "Edit Task" : "Add Task"}
              </h4>

              {/* Project selection for board usage */}
              {showProjectSelection && (
                <Select
                  errors={errors}
                  touched={touched}
                  name={"project"}
                  selectedValue={values?.project || ""}
                  value={values?.project || ""}
                  onChange={handleChange}
                  title="Project"
                  options={projectOptions}
                  defaultValue=""
                  required={false}
                />
              )}

              {/* Month indicator */}
              {selectedMonth && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      Creating task for:{" "}
                      {new Date(selectedMonth + "-01").toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Project work details indicator */}
              {selectedProjectData &&
                selectedProjectId &&
                selectedProjectId !== "other" && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        Using work details from: {selectedProjectData.name}
                      </span>
                    </div>
                  </div>
                )}

              {/* Other project indicator */}
              {isOtherProjectSelected && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-yellow-800">
                      Creating task for external project - task group and flow
                      fields are hidden
                    </span>
                  </div>
                </div>
              )}

              {/* No project indicator */}
              {/* {isNoProjectSelected && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      Creating board task - task group and flow fields are
                      hidden
                    </span>
                  </div>
                </div>
              )} */}

              {/* All employees indicator for "Other" project or no project */}
              {/* {(isOtherProjectSelected || isNoProjectSelected) && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      {isLoadingEmployees
                        ? "Loading company employees..."
                        : `All company employees available for assignment (${
                            allEmployeesData?.employees?.length || 0
                          } employees)`}
                    </span>
                  </div>
                </div>
              )} */}

              <form
                action=" "
                onSubmit={handleSubmit}
                className="mt-3 flex flex-col gap-y-4"
              >
                {/* Hidden input for taskMonth */}
                <input
                  type="hidden"
                  name="taskMonth"
                  value={selectedMonth || ""}
                />

                {/* Show task group and task flow if:
                    1. Not "Other" project AND not "no project" 
                    2. OR we're in project context (showProjectSelection is false) */}
                {((!isOtherProjectSelected && !isNoProjectSelected) ||
                  !showProjectSelection) && (
                  <>
                    <Select
                      errors={errors}
                      touched={touched}
                      name={"taskGroup"}
                      selectedValue={values?.taskGroup || "Select task group"}
                      value={values?.taskGroup || "Select task group"}
                      onChange={handleChange}
                      title="Task Group"
                      options={taskGroupOptions}
                      defaultValue="Select task group"
                      disabled={isEdit}
                    />

                    {/* Task Flow Selection */}
                    <Select
                      errors={errors}
                      touched={touched}
                      name={"taskFlow"}
                      selectedValue={values?.taskFlow || ""}
                      value={values?.taskFlow || ""}
                      onChange={handleChange}
                      title="Task Flow (Optional)"
                      options={taskFlowOptions}
                      defaultValue=""
                      disabled={!isFormEnabled}
                    />

                    {/* Task Flow Preview */}
                    {values.taskFlow &&
                      taskFlows.length > 0 &&
                      (() => {
                        const selectedFlow = taskFlows.find(
                          (flow) => flow._id === values.taskFlow
                        );
                        return selectedFlow &&
                          selectedFlow.flows &&
                          selectedFlow.flows.length > 0 ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              <span className="text-sm font-medium text-blue-800">
                                Task Flow: {selectedFlow.name}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {selectedFlow.flows.map((step, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-xs text-blue-700"
                                >
                                  <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-medium">
                                    {index + 1}
                                  </span>
                                  <span>{step.taskName}</span>
                                  <span className="text-blue-600">→</span>
                                  <span className="font-medium">
                                    {step.assignee?.name ||
                                      `${step.assignee?.firstName || ""} ${
                                        step.assignee?.lastName || ""
                                      }`.trim()}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-blue-600">
                              Assignees will be automatically set based on this
                              flow and will override any manual selections.
                            </div>
                          </div>
                        ) : null;
                      })()}

                    {/* Extra Task Work Type Selection */}
                    {isExtraTaskSelected && (
                      <Select
                        errors={errors}
                        touched={touched}
                        name={"extraTaskWorkType"}
                        selectedValue={
                          values?.extraTaskWorkType || "Select work type"
                        }
                        value={values?.extraTaskWorkType || "Select work type"}
                        onChange={handleChange}
                        title="Extra Task Work Type"
                        options={extraTaskWorkTypeOptions}
                        defaultValue="Select work type"
                      />
                    )}
                  </>
                )}

                <Input
                  placeholder="Task Name"
                  title="Task Name"
                  errors={errors}
                  name={"title"}
                  onchange={handleChange}
                  touched={touched}
                  value={values?.title || ""}
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
                <div className="grid gap-x-4 grid-cols-2">
                  <DatePicker
                    errors={errors}
                    value={values.startDate}
                    onChange={handleChange}
                    name={"startDate"}
                    title="Estimate"
                    touched={touched}
                    disabled={!isFormEnabled && !isOtherProjectSelected}
                  />
                  <DatePicker
                    title="Dead Line"
                    errors={errors}
                    value={values.dueDate}
                    onChange={handleChange}
                    touched={touched}
                    name={"dueDate"}
                    disabled={!isFormEnabled && !isOtherProjectSelected}
                  />
                </div>
                <Select
                  errors={errors}
                  name={"periority"}
                  touched={touched}
                  value={values?.periority || "Low"}
                  onChange={handleChange}
                  title="Priority"
                  options={["Low", "Medium", "High"]}
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
                <MultiSelect
                  title="Assignees"
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"assignedTo"}
                  value={values?.assignedTo || []}
                  options={getAssigneeOptions()}
                  placeholder={
                    (isOtherProjectSelected || isNoProjectSelected) &&
                    isLoadingEmployees
                      ? "Loading employees..."
                      : "Select Assignees"
                  }
                  disabled={
                    (!isFormEnabled &&
                      !isOtherProjectSelected &&
                      !isNoProjectSelected) ||
                    ((isOtherProjectSelected || isNoProjectSelected) &&
                      isLoadingEmployees)
                  }
                />

                {/* Recurring Task Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Task Recurring
                  </h5>

                  <Select
                    errors={errors}
                    name={"recurringPattern"}
                    touched={touched}
                    value={values.recurringPattern || "none"}
                    onChange={handleChange}
                    title="Repeat"
                    options={recurringOptions}
                    disabled={!isFormEnabled && !isOtherProjectSelected}
                  />

                  {values.recurringPattern &&
                    values.recurringPattern !== "none" && (
                      <div className="space-y-4 mt-4">
                        <Input
                          placeholder="1"
                          title={`Every ${
                            values.recurringPattern === "daily"
                              ? "X days"
                              : values.recurringPattern === "weekly"
                              ? "X weeks"
                              : "X months"
                          }`}
                          errors={errors}
                          name={"recurringInterval"}
                          onchange={handleChange}
                          touched={touched}
                          value={values?.recurringInterval || ""}
                          disabled={!isFormEnabled && !isOtherProjectSelected}
                          type="number"
                          min="1"
                        />

                        <div className="grid gap-x-4 grid-cols-2">
                          <DatePicker
                            title="End Date (Optional)"
                            errors={errors}
                            value={values.recurringEndDate}
                            onChange={handleChange}
                            touched={touched}
                            name={"recurringEndDate"}
                            disabled={!isFormEnabled && !isOtherProjectSelected}
                          />
                          <Input
                            placeholder="10"
                            title="Max Recurrences (Optional)"
                            errors={errors}
                            name={"maxRecurrences"}
                            onchange={handleChange}
                            touched={touched}
                            value={values?.maxRecurrences || ""}
                            disabled={!isFormEnabled && !isOtherProjectSelected}
                            type="number"
                            min="1"
                          />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>📅 Recurring Schedule:</strong>
                            <br />
                            This task will repeat every{" "}
                            {values.recurringInterval || 1}{" "}
                            {values.recurringPattern === "daily" &&
                              (values.recurringInterval > 1 ? "days" : "day")}
                            {values.recurringPattern === "weekly" &&
                              (values.recurringInterval > 1 ? "weeks" : "week")}
                            {values.recurringPattern === "monthly" &&
                              (values.recurringInterval > 1
                                ? "months"
                                : "month")}
                            {values.recurringEndDate &&
                              ` until ${values.recurringEndDate}`}
                            {values.maxRecurrences &&
                              ` for a maximum of ${values.maxRecurrences} times`}
                            .
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"copyOfDescription"}
                  value={values?.copyOfDescription || ""}
                  title="Content for Description"
                  placeholder="Add copy of description"
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"description"}
                  value={values?.description || ""}
                  title="Description for publishing"
                  placeholder="Add some description of the task"
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
                <div>
                  <FileAndLinkUpload
                    fileClassName={"grid grid-cols-3 gap-3"}
                    initialFiles={
                      initialValues?.attachments?.filter(
                        (file) => file.type !== "link"
                      ) || []
                    }
                    initialLinks={
                      initialValues?.attachments?.filter(
                        (file) => file.type === "link"
                      ) || []
                    }
                    onChange={(files) => setFieldValue("attachments", files)}
                    disabled={!isFormEnabled && !isOtherProjectSelected}
                  />
                  <div className="flexEnd">
                    <PrimaryButton
                      type="submit"
                      title="Save Task"
                      disabled={!isFormEnabled && !isOtherProjectSelected}
                    />
                  </div>
                </div>
              </form>
            </div>
            <PrimaryButton
              icon={"/icons/cancel.svg"}
              className={"bg-[#F4F9FD] absolute z-40 top-7 right-7"}
              onclick={handleClose}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AddTask;
