import React, { useEffect, useState, useMemo, useRef } from "react";
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
  useGetWorkSchedule,
  useGetHolidays,
} from "../../../api/hooks";
import FileAndLinkUpload from "../../shared/fileUpload";
import { useAuth } from "../../../hooks/useAuth";
import { FiActivity, FiAlertTriangle, FiCalendar, FiClock, FiPlus, FiTarget, FiTrash2 } from "react-icons/fi";
import Modal from "../../shared/modal";
import {
  computeFlowDatesWithSchedule,
  isWeeklyOff,
  isHoliday,
  formatShortDate,
} from "../../../utils/workingDayUtils";
import { useCheckAvailability } from "../../../features/vacations/hooks/useVacations";

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

  // Fetch company work schedule (weekly-off rules)
  const { data: workSchedule } = useGetWorkSchedule(companyId);
  const weeklyOffs = workSchedule?.weeklyOffs || [];

  // Fetch company holidays
  const { data: holidays = [] } = useGetHolidays(companyId);

  const handleClose = () => {
    resetForm();
    setShowModalTask(false);
  };

  // Prepare initial values for the form
  const prepareInitialValues = () => {
    if (!initialValues) return {};

    return {
      title: initialValues.title || "",
      task_description: initialValues.task_description || "",
      project: initialValues.project?._id || initialValues.project || null,
      taskGroup: initialValues.taskGroup || "",
      taskFlow: initialValues.taskFlow?._id || initialValues.taskFlow || "",
      extraTaskWorkType: initialValues.extraTaskWorkType || "",
      // taskMonth: isEdit ? selectedMonth : initialValues.selectedMonth || "",
      taskMonth: selectedMonth || "",
      startDate: initialValues.startDate || "",
      dueDate: initialValues.dueDate || "",
      priority: initialValues.priority || "Low",
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
      dueDateChangeReason: initialValues.dueDateChangeReason || "",
      requiresClientApproval: initialValues.requiresClientApproval || false,
      requiresWorkLink: initialValues.requiresWorkLink || false,
      customFields: initialValues.customFields || [],
      subtasks: initialValues.subtasks || [],
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

  // Refs to track previous "master" values for resetting manual subtask edits
  const prevMasterValues = useRef({
    taskFlow: "",
    startDate: "",
    dueDate: ""
  });

  // State for due date change reason modal
  const [showDateChangeReasonModal, setShowDateChangeReasonModal] =
    useState(false);
  const [pendingNewDueDate, setPendingNewDueDate] = useState(null);
  const [dateChangeReason, setDateChangeReason] = useState("");
  const [showFlowAssigneeModal, setShowFlowAssigneeModal] = useState(false);
  const [missingFlowAssignees, setMissingFlowAssignees] = useState([]);

  // Vacation availability state
  const availabilityMutation = useCheckAvailability();
  const [availabilityConflicts, setAvailabilityConflicts] = useState([]);

  // Trigger availability check when assignees or dates change
  useEffect(() => {
    // Only check if we have dates and assignees
    const hasMainAssignees = values.assignedTo?.length > 0;
    const hasSubtasks = values.subtasks?.length > 0;

    if (!values.startDate || !values.dueDate || (!hasMainAssignees && !hasSubtasks)) {
      setAvailabilityConflicts([]);
      return;
    }

    const checks = [];

    // 1. Add main task assignees to check list
    if (hasMainAssignees) {
      values.assignedTo.forEach((empId) => {
        checks.push({
          employeeId: empId,
          startDate: values.startDate,
          endDate: values.dueDate,
          label: "main",
        });
      });
    }

    // 2. Add subtask assignees to check list
    if (hasSubtasks) {
      values.subtasks.forEach((sub, idx) => {
        const subAssigneeId = typeof sub.assignee === "object" ? sub.assignee?._id : sub.assignee;
        if (subAssigneeId && sub.startDate && sub.dueDate) {
          checks.push({
            employeeId: subAssigneeId,
            startDate: sub.startDate,
            endDate: sub.dueDate,
            label: `subtask-${idx}`,
          });
        }
      });
    }

    if (checks.length > 0) {
      // Use a timeout to debounce the API call slightly
      const timeoutId = setTimeout(() => {
        availabilityMutation.mutate(checks, {
          onSuccess: (data) => {
            setAvailabilityConflicts(data.conflicts || []);
          },
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAvailabilityConflicts([]);
    }
  }, [
    values.assignedTo,
    values.subtasks,
    values.startDate,
    values.dueDate,
    values.taskFlow, // Also check when flow changes as it updates subtasks
  ]);


  // Fetch project details when a project is selected
  const {
    data: selectedProjectData,
    isLoading: isLoadingProjectDetails,
    error: projectDetailsError,
  } = useProjectDetails(
    selectedProjectId && selectedProjectId !== "other"
      ? selectedProjectId
      : null,
    {
      enabled:
        !!selectedProjectId &&
        selectedProjectId !== "" &&
        selectedProjectId !== "other",
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
    // if (selectedMonth && !values.taskMonth) {
    if (selectedMonth) {
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

  // Handle automatic custom fields based on task group
  useEffect(() => {
    if (
      values.taskGroup === "shooting" ||
      (values.taskGroup === "extraTask" && values.extraTaskWorkType === "shooting")
    ) {
      const hasUrlField = values.customFields?.some(
        (field) =>
          field.label?.toLowerCase().includes("url") ||
          field.label?.toLowerCase().includes("shooting")
      );
      if (!hasUrlField) {
        setFieldValue("customFields", [
          ...(values.customFields || []),
          { label: "Shooting URL", value: "", type: "url" },
        ]);
      }
    }
  }, [values.taskGroup, values.extraTaskWorkType, setFieldValue]);

  // Handle automatic work link field based on requiresWorkLink option
  useEffect(() => {
    if (values.requiresWorkLink) {
      const hasWorkLinkField = values.customFields?.some(
        (field) =>
          field.label?.toLowerCase().includes("work link") ||
          field.label?.toLowerCase().includes("google drive") ||
          field.label?.toLowerCase().includes("link")
      );
      if (!hasWorkLinkField) {
        setFieldValue("customFields", [
          ...(values.customFields || []),
          { label: "Work Link", value: "", type: "url" },
        ]);
      }
    }
  }, [values.requiresWorkLink, setFieldValue]);

  // Handle task flow selection with project membership validation
  useEffect(() => {
    const normalizeId = (val) => {
      if (!val) return null;
      if (typeof val === "string") return val;
      if (val._id) return String(val._id);
      if (val.id) return String(val.id);
      if (val.userId) return String(val.userId);
      return String(val);
    };

    if (values.taskFlow && taskFlows.length > 0) {
      const selectedFlow = taskFlows.find(
        (flow) => flow._id === values.taskFlow
      );
      if (selectedFlow && selectedFlow.flows && selectedFlow.flows.length > 0) {
        // Get all assignees from the flow steps
        const flowAssignees = selectedFlow.flows
          .map((step) => normalizeId(step.assignee))
          .filter(Boolean);
        // Remove duplicates
        const uniqueAssignees = Array.from(new Set(flowAssignees));

        // Prefer teams prop (project members) for validation; fallback to project data
        const projectMembersRaw =
          (Array.isArray(teams) && teams.length > 0 && teams) ||
          selectedProjectData?.teamMembers ||
          selectedProjectData?.teams ||
          [];
        const projectMemberIds = projectMembersRaw
          .map((m) => normalizeId(m))
          .filter(Boolean);

        const missingAssignees = projectMemberIds.length
          ? uniqueAssignees.filter((id) => !projectMemberIds.includes(id))
          : [];

        if (missingAssignees.length > 0) {
          setFieldValue("taskFlow", "");
          const missingNames = selectedFlow.flows
            .map((step) => step.assignee)
            .filter((assignee) =>
              missingAssignees.includes(normalizeId(assignee))
            )
            .map((assignee) => {
              if (!assignee) return null;
              if (typeof assignee === "string") return assignee;
              return (
                assignee.name ||
                `${assignee.firstName || ""} ${assignee.lastName || ""}`.trim()
              );
            })
            .filter(Boolean);
          setMissingFlowAssignees(
            missingNames.length > 0 ? missingNames : missingAssignees
          );
          setShowFlowAssigneeModal(true);
        } else {
          setFieldValue("assignedTo", uniqueAssignees);
          setFieldValue("requiresClientApproval", selectedFlow.flows.some(step => step.requiresClientApproval));
          setFieldValue("requiresWorkLink", selectedFlow.flows.some(step => step.requiresWorkLink));
        }
      }
    }
  }, [values.taskFlow, taskFlows, setFieldValue, selectedProjectData]);

  // ── Sync subtasks in Formik whenever flow or main dates change ──────────
  useEffect(() => {
    const isMasterChanged =
      values.taskFlow !== prevMasterValues.current.taskFlow ||
      values.startDate !== prevMasterValues.current.startDate ||
      values.dueDate !== prevMasterValues.current.dueDate;

    if (isMasterChanged) {
      if (values.taskFlow && values.startDate && values.dueDate && taskFlows.length > 0) {
        const selectedFlow = taskFlows.find(flow => flow._id === values.taskFlow);
        if (selectedFlow?.flows?.length) {
          const calculatedSteps = computeFlowDatesWithSchedule(
            values.startDate,
            values.dueDate,
            selectedFlow.flows,
            weeklyOffs,
            holidays
          );

          // Keep manual subtasks and replace/add flow-based ones
          const manualSubtasks = (values.subtasks || []).filter(s => !s.isFromFlow);
          
          const flowSubtasks = calculatedSteps.map((s, idx) => ({
            taskName: s.taskName,
            assignee: s.assignee,
            startDate: s.startDate.toISOString().split('T')[0],
            dueDate: s.dueDate.toISOString().split('T')[0],
            wasAdjusted: s.wasAdjusted,
            skippedDay: s.skippedDay,
            skippedDayType: s.skippedDayType,
            weightage: s.weightage,
            requiresClientApproval: selectedFlow.flows[idx].requiresClientApproval,
            requiresWorkLink: selectedFlow.flows[idx].requiresWorkLink,
            isFromFlow: true
          }));

          setFieldValue("subtasks", [...flowSubtasks, ...manualSubtasks]);
        }
      } else if (!values.taskFlow && prevMasterValues.current.taskFlow) {
        // If we transitioned from a flow to no flow, remove only the flow subtasks
        const manualSubtasks = (values.subtasks || []).filter(s => !s.isFromFlow);
        setFieldValue("subtasks", manualSubtasks);
      }

      // Update refs to latest master values
      prevMasterValues.current = {
        taskFlow: values.taskFlow,
        startDate: values.startDate,
        dueDate: values.dueDate
      };
    }
  }, [values.taskFlow, values.startDate, values.dueDate, taskFlows, weeklyOffs, holidays, setFieldValue]);

  // Handle manual date overrides for subtasks
  const handleSubtaskDateChange = (index, field, newValue) => {
    const updated = [...(values.subtasks || [])];
    if (!updated[index]) return;

    updated[index][field] = newValue;

    // Sequential cascade: if a dueDate changes, move the START of the next task
    if (field === 'dueDate' && index < updated.length - 1 && updated[index + 1].isFromFlow) {
      updated[index + 1].startDate = newValue;
      // If the next start date is now after its due date, bump the due date too
      if (new Date(updated[index + 1].startDate) > new Date(updated[index + 1].dueDate)) {
        updated[index + 1].dueDate = newValue;
      }
    }

    setFieldValue("subtasks", updated);
  };

  const addManualSubtask = () => {
    const newSubtask = {
      taskName: values.title || "",
      assignee: values.assignedTo?.[0] || "",
      startDate: values.startDate || new Date().toISOString().split('T')[0],
      dueDate: values.dueDate || new Date().toISOString().split('T')[0],
      isManual: true,
      requiresClientApproval: false,
      requiresWorkLink: false
    };
    setFieldValue("subtasks", [...(values.subtasks || []), newSubtask]);
  };

  const removeSubtask = (index) => {
    const updated = values.subtasks.filter((_, i) => i !== index);
    setFieldValue("subtasks", updated);
  };

  const handleSubtaskChange = (index, field, value) => {
    const updated = [...(values.subtasks || [])];
    updated[index][field] = value;
    setFieldValue("subtasks", updated);
  };

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

    if (
      selectedProjectData &&
      selectedProjectId &&
      selectedProjectId !== "other"
    ) {
      // Find the work details for the selected month from the selected project
      const projectMonthWorkDetails = selectedProjectData.workDetails?.find(
        (wd) => wd.month === selectedMonth
      );
      workDetails = projectMonthWorkDetails;
    } else {
      // Fallback to provided work details
      workDetails = monthWorkDetails || projectData?.workDetails;
    }

    if (!workDetails) {
      return [];
    }

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

    if (
      selectedProjectData &&
      selectedProjectId &&
      selectedProjectId !== "other"
    ) {
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

  // Handle due date change - check if we need to ask for reason
  const handleDueDateChange = (e) => {
    const newDate = e.target.value;
    const originalDueDate = initialValues?.dueDate;

    // Normalize dates for comparison (convert to YYYY-MM-DD format)
    const normalizeDate = (date) => {
      if (!date) return "";
      // If already in YYYY-MM-DD format, return as is
      if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      // Otherwise, convert to YYYY-MM-DD
      try {
        return new Date(date).toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    const normalizedNewDate = normalizeDate(newDate);
    const normalizedOriginalDate = normalizeDate(originalDueDate);

    // If editing and there's an existing dueDate, show reason modal
    if (
      isEdit &&
      normalizedOriginalDate &&
      normalizedNewDate &&
      normalizedNewDate !== normalizedOriginalDate
    ) {
      setPendingNewDueDate(newDate);
      setShowDateChangeReasonModal(true);
    } else {
      // Directly update the date if no reason needed
      handleChange(e);
    }
  };

  // Handle reason submission
  const handleDateChangeReasonSubmit = () => {
    if (!dateChangeReason.trim()) {
      alert("Please provide a reason for changing the due date.");
      return;
    }

    // Update the due date
    setFieldValue("dueDate", pendingNewDueDate);
    // Store the reason
    setFieldValue("dueDateChangeReason", dateChangeReason.trim());

    // Reset modal state
    setShowDateChangeReasonModal(false);
    setPendingNewDueDate(null);
    setDateChangeReason("");
  };

  // Handle reason modal cancel
  const handleDateChangeReasonCancel = () => {
    setShowDateChangeReasonModal(false);
    setPendingNewDueDate(null);
    setDateChangeReason("");
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed left-0 right-0 top-0 bottom-0
bg-[#2155A3]/15 backdrop-blur-sm py-8 z-50 flexCenter"
    >
      <div
        className="p-10 bg-white pt-12  px-12 flex flex-col
rounded-3xl max-w-[800px] w-full h-full relative"
      >
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
              <div className="mb-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
            {isLoadingProjectDetails &&
              selectedProjectId &&
              selectedProjectId !== "other" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      Loading project details...
                    </span>
                  </div>
                </div>
              )}

            {projectDetailsError &&
              selectedProjectId &&
              selectedProjectId !== "other" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-red-800">
                      Failed to load project details. Please try again.
                    </span>
                  </div>
                </div>
              )}

            {/* {selectedProjectData &&
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
                )} */}

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
                      options={
                        isLoadingProjectDetails
                          ? [{ label: "Loading...", value: "" }]
                          : taskGroupOptions
                      }
                      defaultValue="Select task group"
                      disabled={isEdit || isLoadingProjectDetails}
                    />
                  </>
                )}

              {/* ── Dates (before Task Flow so preview shows immediately) */}
              <div className="grid gap-x-4 grid-cols-2">
                      {/* Start Date */}
                      <div>
                        <DatePicker
                          errors={errors}
                          value={values.startDate}
                          onChange={handleChange}
                          name={"startDate"}
                          title="Estimate"
                          touched={touched}
                          disabled={!isFormEnabled && !isOtherProjectSelected}
                        />
                        {values.startDate && (isWeeklyOff(new Date(values.startDate), weeklyOffs) || isHoliday(new Date(values.startDate), holidays)) && (
                          <div className="flex items-center gap-1.5 mt-1 px-1">
                            <FiAlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="text-[11px] text-amber-600 font-medium whitespace-nowrap">
                              {isHoliday(new Date(values.startDate), holidays)
                                ? `Holiday: ${holidays.find(h => new Date(h.date).toDateString() === new Date(values.startDate).toDateString())?.name}`
                                : "Weekly-off day"} — task can still start here
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Due Date */}
                      <div>
                        <DatePicker
                          title="Dead Line"
                          errors={errors}
                          value={values.dueDate}
                          onChange={handleDueDateChange}
                          touched={touched}
                          name={"dueDate"}
                          disabled={!isFormEnabled && !isOtherProjectSelected}
                        />
                        {values.dueDate && (isWeeklyOff(new Date(values.dueDate), weeklyOffs) || isHoliday(new Date(values.dueDate), holidays)) && (
                          <div className="flex items-center gap-1.5 mt-1 px-1">
                            <FiAlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="text-[11px] text-amber-600 font-medium whitespace-nowrap">
                              {isHoliday(new Date(values.dueDate), holidays)
                                ? `Holiday: ${holidays.find(h => new Date(h.date).toDateString() === new Date(values.dueDate).toDateString())?.name}`
                                : "Weekly-off day"} — subtasks will be adjusted
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

              {((!isOtherProjectSelected && !isNoProjectSelected) ||
                !showProjectSelection) && (
                  <>
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



                    {/* No date range set warning for preview */}
                    {values.taskFlow && (!values.startDate || !values.dueDate) && (
                      <div className="bg-blue-50 px-3 py-2.5 text-xs text-blue-500 italic flex items-center gap-1.5 border border-blue-200 rounded-xl">
                        <FiClock className="w-3 h-3" />
                        Set parent Start &amp; Due dates to preview the flow schedule.
                      </div>
                    )}

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
                        options={
                          isLoadingProjectDetails
                            ? [{ label: "Loading...", value: "" }]
                            : extraTaskWorkTypeOptions
                        }
                        defaultValue="Select work type"
                        disabled={isLoadingProjectDetails}
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
                value={values}
                disabled={!isFormEnabled && !isOtherProjectSelected}
              />
              <Description
                errors={errors}
                onChange={handleChange}
                touched={touched}
                name={"task_description"}
                value={values}
                title="Task Description"
                placeholder="Add task description"
                disabled={!isFormEnabled && !isOtherProjectSelected}
              />

              <Select
                errors={errors}
                name={"priority"}
                touched={touched}
                value={values?.priority || "Low"}
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

              {/* Main Task Availability Conflicts */}
              {availabilityConflicts.filter(c => c.label === 'main').length > 0 && (
                <div className="mt-2 space-y-1">
                  {availabilityConflicts.filter(c => c.label === 'main').map((conflict, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <FiAlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-amber-800">
                          {conflict.employeeName} is on leave
                        </p>
                        {conflict.conflictingDates.map((d, dIdx) => (
                          <p key={dIdx} className="text-[10px] text-amber-700 italic">
                            • {d.type.replace('_', ' ')}: {d.startDate} to {d.endDate}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mb-2 mt-4 px-1">
                <input
                  type="checkbox"
                  id="requiresClientApproval"
                  name="requiresClientApproval"
                  checked={values.requiresClientApproval}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
                <label
                  htmlFor="requiresClientApproval"
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Requires Client Approval
                </label>
              </div>

              <div className="flex items-center gap-2 mb-2 mt-2 px-1">
                <input
                  type="checkbox"
                  id="requiresWorkLink"
                  name="requiresWorkLink"
                  checked={values.requiresWorkLink}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  disabled={!isFormEnabled && !isOtherProjectSelected}
                />
                <label
                  htmlFor="requiresWorkLink"
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Requires Work Link
                </label>
              </div>

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
                        title={`Every ${values.recurringPattern === "daily"
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

              {/* Dynamic Custom Fields Section */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flexBetween mb-3">
                  <h5 className="text-sm font-medium text-gray-700">
                    Additional Fields (e.g. Shooting URL)
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      const newFields = [...(values.customFields || []), { label: "", value: "", type: "text" }];
                      setFieldValue("customFields", newFields);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-all"
                  >
                    <FiPlus className="w-3 h-3" /> Add Field
                  </button>
                </div>

                {values.customFields && values.customFields.length > 0 ? (
                  <div className="space-y-3">
                    {values.customFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Field Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Shooting URL"
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...values.customFields];
                              newFields[index].label = e.target.value;
                              setFieldValue("customFields", newFields);
                            }}
                            className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 ${errors.customFields && errors.customFields[index]?.label ? 'border-red-400' : 'border-gray-200'}`}
                          />
                          {errors.customFields && errors.customFields[index]?.label && (
                            <span className="text-[10px] text-red-500 mt-1 block">{errors.customFields[index].label}</span>
                          )}
                        </div>
                        <div className="flex-[2]">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Field Value</label>
                          <input
                            type={field.type || "text"}
                            placeholder="Enter value..."
                            value={field.value}
                            onChange={(e) => {
                              const newFields = [...values.customFields];
                              newFields[index].value = e.target.value;
                              setFieldValue("customFields", newFields);
                            }}
                            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFields = values.customFields.filter((_, i) => i !== index);
                            setFieldValue("customFields", newFields);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove field"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">No additional fields added.</p>
                )}
              </div>

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

                <div className="flex flex-col gap-3 mt-4">
                  {/* ── Subtasks Preview/Editor ─────────────── */}
                  {(values.subtasks && values.subtasks.length > 0 || values.taskFlow) && (
                    <div className="border border-blue-100 rounded-2xl overflow-hidden mt-1 shadow-sm bg-white">
                      {/* Header */}
                      <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiActivity className="w-4 h-4 text-white" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {values.taskFlow 
                              ? taskFlows.find(f => f._id === values.taskFlow)?.name 
                              : "Custom Subtasks"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={addManualSubtask}
                          className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold py-1 px-2 rounded-lg transition-all flex items-center gap-1"
                        >
                          <FiPlus className="w-3 h-3" /> Add Step
                        </button>
                      </div>

                      {/* Step rows */}
                      <div className="divide-y divide-gray-50">
                        {values.subtasks?.map((step, index) => {
                          const assigneeOptions = getAssigneeOptions();
                          const currentAssigneeId = typeof step.assignee === 'object' ? step.assignee?._id : step.assignee;

                          return (
                            <div
                              key={index}
                              className="bg-white p-3 flex flex-col gap-2 hover:bg-blue-50/20 transition-colors relative group"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100">
                                  {index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={step.taskName}
                                  onChange={(e) => handleSubtaskChange(index, "taskName", e.target.value)}
                                  placeholder="Subtask name..."
                                  className="flex-1 text-xs font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-300 outline-none py-0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSubtask(index)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 pl-7">
                                {/* Assignee Select */}
                                <div className="flex items-center gap-1.5 min-w-[120px]">
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Assigned To:</span>
                                  <select
                                    value={currentAssigneeId || ""}
                                    onChange={(e) => handleSubtaskChange(index, "assignee", e.target.value)}
                                    className="text-[10px] font-bold text-blue-600 bg-blue-50/50 border border-blue-100 rounded px-1.5 py-0.5 outline-none"
                                  >
                                    <option value="">Select...</option>
                                    {assigneeOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Dates */}
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                                    <input
                                      type="date"
                                      value={step.startDate}
                                      onChange={(e) => handleSubtaskDateChange(index, "startDate", e.target.value)}
                                      className="text-[10px] text-gray-600 bg-transparent outline-none"
                                    />
                                    <span className="text-[9px] text-gray-300 px-1">—</span>
                                    <input
                                      type="date"
                                      value={step.dueDate}
                                      onChange={(e) => handleSubtaskDateChange(index, "dueDate", e.target.value)}
                                      className="text-[10px] text-gray-600 bg-transparent outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Requirements */}
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={step.requiresClientApproval}
                                      onChange={(e) => handleSubtaskChange(index, "requiresClientApproval", e.target.checked)}
                                      className="w-3 h-3 rounded text-blue-600"
                                    />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Approval</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={step.requiresWorkLink}
                                      onChange={(e) => handleSubtaskChange(index, "requiresWorkLink", e.target.checked)}
                                      className="w-3 h-3 rounded text-purple-600"
                                    />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Link</span>
                                  </label>
                                </div>
                              </div>
                              
                              {step.wasAdjusted && (
                                <div className="flex items-center gap-1 pl-7">
                                  <FiAlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                                  <span className="text-[9px] font-medium text-amber-600 italic">
                                    Shifted from {step.skippedDayType?.toLowerCase()} ({step.skippedDay})
                                  </span>
                                </div>
                              )}

                              {/* Subtask Availability Conflicts */}
                              {availabilityConflicts.filter(c => c.label === `subtask-${index}`).map((conflict, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 pl-7 mt-1">
                                  <FiAlertTriangle className="w-3 h-3 text-red-500 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-bold text-red-600">
                                      {conflict.employeeName} unavailable
                                    </p>
                                    {conflict.conflictingDates.map((d, dIdx) => (
                                      <p key={dIdx} className="text-[9px] text-red-500 italic">
                                        • {d.type.replace('_', ' ')}: {d.startDate} to {d.endDate}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {values.subtasks.length} total subtasks
                        </span>
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest animate-pulse">
                          Subtasks will be created with the task
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Create Subtask Toggle/Button at the bottom */}
                  {!values.taskFlow && (
                    <button
                      type="button"
                      onClick={addManualSubtask}
                      className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-500 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="p-1 bg-blue-100 rounded-full">
                        <FiPlus className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Add Subtask with Task Details</span>
                    </button>
                  )}

                  {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                    <div className="text-red-500 text-xs text-right mb-2">
                      Please fix the following errors: {Object.keys(errors).join(", ")}
                    </div>
                  )}
                  <div className="flexEnd">
                    <PrimaryButton
                      type="submit"
                      title="Save Task"
                      loading={isLoading}
                      disable={(!isFormEnabled && !isOtherProjectSelected) || isLoading}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
          <PrimaryButton
            icon={"/icons/cancel.svg"}
            disable={isLoading}
            className={"bg-[#F4F9FD] absolute z-40 top-7 right-7"}
            onclick={() => !isLoading && handleClose()}
          />
        </>
      </div>

      {/* Due Date Change Reason Modal */}
      <Modal
        isOpen={showDateChangeReasonModal}
        onClose={handleDateChangeReasonCancel}
        title="Reason for Date Change"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              You are changing the due date from{" "}
              <span className="font-semibold">
                {initialValues?.dueDate
                  ? new Date(initialValues.dueDate).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )
                  : "N/A"}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {pendingNewDueDate
                  ? new Date(pendingNewDueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                  : "N/A"}
              </span>
              . Please provide a reason for this change.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={dateChangeReason}
              onChange={(e) => setDateChangeReason(e.target.value)}
              placeholder="Enter the reason for changing the due date..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleDateChangeReasonCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDateChangeReasonSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm Change
            </button>
          </div>
        </div>
      </Modal>

      {/* Task Flow Assignee Validation Modal */}
      <Modal
        isOpen={showFlowAssigneeModal}
        onClose={() => setShowFlowAssigneeModal(false)}
        title="Task Flow Members Not in Project"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            One or more users in this task flow are not part of the selected
            project. Please add them to the project or choose another task flow.
          </p>
          {missingFlowAssignees.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 mb-1">
                Missing from project:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                {missingFlowAssignees.map((name, idx) => (
                  <li key={idx}>{name || "Unknown user"}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowFlowAssigneeModal(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddTask;
