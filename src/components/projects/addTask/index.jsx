import React, { useEffect, useState, useMemo, useRef } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import MultiSelect from "../../shared/Field/multiSelect";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";
import CategoryPicker from "../../shared/Field/categoryPicker";
import { useAddTaskForm } from "../../../hooks/useAddTaskForm";
import {
  useCreateTask,
  useGetTaskFlows,
  useProjectDetails,
  useGetAllEmployees,
  useGetWorkSchedule,
  useGetHolidays,
  useGetTaskCategories,
} from "../../../api/hooks";
import FileAndLinkUpload from "../../shared/fileUpload";
import { useAuth } from "../../../hooks/useAuth";
import { FiAlertTriangle, FiCheck, FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "../../shared/modal";
import {
  computeFlowDatesWithSchedule,
  isWeeklyOff,
  isHoliday,
  formatShortDate,
} from "../../../utils/workingDayUtils";
import { useCheckAvailability } from "../../../features/vacations/hooks/useVacations";
import { useGetCampaignsByCompany } from "../../../api/campaigns";
import {
  extraWorkTypeValueFromName,
  getSelectedWorkItems,
  matchStandardWorkType,
  resolveTaskCategoryId,
  taskHoursToMinutes,
} from "../workDetailsForm/workTypeMapping";

const formatConflictDate = (value) => {
  if (!value) return "—";
  const date = new Date(typeof value === "string" && !value.includes("T")
    ? `${value}T00:00:00`
    : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatConflictRange = (start, end) => {
  const from = formatConflictDate(start);
  const to = formatConflictDate(end);
  return from === to ? from : `${from} – ${to}`;
};

const getConflictTypeMeta = (type) => {
  if (type === "sick_leave") return { label: "Sick leave", className: "bg-rose-50 text-rose-700 border-rose-100" };
  if (type === "vacation") return { label: "Annual leave", className: "bg-amber-50 text-amber-700 border-amber-100" };
  if (type === "subtask") return { label: "Subtask", className: "bg-indigo-50 text-indigo-700 border-indigo-100" };
  if (type === "task") return { label: "Task", className: "bg-blue-50 text-blue-700 border-blue-100" };
  return { label: String(type || "Conflict").replace("_", " "), className: "bg-gray-50 text-gray-600 border-gray-100" };
};

const getConflictCounts = (items = []) => {
  const taskCount = items.filter((d) => d.type === "task" || d.type === "subtask").length;
  const leaveCount = items.filter((d) => d.type === "vacation" || d.type === "sick_leave").length;
  return { taskCount, leaveCount, total: items.length };
};

const getConflictSummary = (name, items = []) => {
  const firstName = String(name || "Employee").trim().split(" ")[0] || "Employee";
  const { taskCount, leaveCount } = getConflictCounts(items);
  const parts = [];
  if (taskCount > 0) {
    parts.push(`${taskCount} task conflict${taskCount === 1 ? "" : "s"}`);
  }
  if (leaveCount > 0) {
    parts.push(`${leaveCount} leave`);
  }
  if (parts.length === 0) {
    return `${firstName} has schedule conflicts`;
  }
  return `${firstName} has ${parts.join(" and ")}`;
};

const ConflictItem = ({ item }) => {
  const meta = getConflictTypeMeta(item.type);
  const scheduledStart = item.originalStart || item.startDate;
  const scheduledEnd = item.originalEnd || item.endDate;
  const overlapStart = item.overlapStart || item.startDate;
  const overlapEnd = item.overlapEnd || item.endDate;
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${meta.className}`}>
          {meta.label}
        </span>
        {item.status ? (
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-500">
            {item.status.replace("-", " ")}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs font-semibold text-gray-800">
        {item.title || item.taskName || meta.label}
      </p>
      {item.parentTaskName ? (
        <p className="text-[11px] text-gray-500">Parent: {item.parentTaskName}</p>
      ) : null}
      {item.projectName ? (
        <p className="text-[11px] text-gray-500">Project: {item.projectName}</p>
      ) : null}
      <p className="mt-1 text-[11px] text-gray-600">
        Scheduled: {formatConflictRange(scheduledStart, scheduledEnd)}
      </p>
      <p className="text-[11px] font-medium text-amber-700">
        Overlaps: {formatConflictRange(overlapStart, overlapEnd)}
      </p>
    </div>
  );
};

const ConflictDetails = ({ conflicts, title, emptyText }) => {
  const [openConflict, setOpenConflict] = useState(null);

  if (!conflicts?.length) {
    return emptyText ? (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-5 text-center">
        <p className="text-sm font-medium text-gray-500">{emptyText}</p>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-2">
      {title ? (
        <div className="flex items-center gap-2">
          <FiAlertTriangle className="h-4 w-4 text-amber-500" />
          <h5 className="text-sm font-semibold text-gray-800">{title}</h5>
        </div>
      ) : null}
      {conflicts.map((conflict, idx) => {
        const items = conflict.conflictingDates || [];
        return (
          <div
            key={`${conflict.employeeId || idx}-${conflict.label || "main"}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-white px-3 py-2.5 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {getConflictSummary(conflict.employeeName, items)}
              </p>
              <p className="text-[11px] text-gray-500">
                {conflict.employeeName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenConflict(conflict)}
              className="flex-shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100"
            >
              View more
            </button>
          </div>
        );
      })}

      <Modal
        isOpen={!!openConflict}
        onClose={() => setOpenConflict(null)}
        title={openConflict ? getConflictSummary(openConflict.employeeName, openConflict.conflictingDates) : "Conflicts"}
      >
        {openConflict && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {openConflict.employeeName} has {(openConflict.conflictingDates || []).length} overlapping item{(openConflict.conflictingDates || []).length === 1 ? "" : "s"} on these dates.
            </p>
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {(openConflict.conflictingDates || []).map((item, itemIdx) => (
                <ConflictItem key={itemIdx} item={item} />
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setOpenConflict(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

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

  // Fetch company task categories
  const { data: taskCategories = [], isLoading: isLoadingTaskCategories } =
    useGetTaskCategories(companyId);

  const skipCategoryWarningRef = useRef(false);
  const [showMissingCategoryModal, setShowMissingCategoryModal] = useState(false);

  const handleClose = () => {
    skipCategoryWarningRef.current = false;
    setShowMissingCategoryModal(false);
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
      taskCategory: initialValues.taskCategory?._id || initialValues.taskCategory || "",
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
      campaign: initialValues.campaign?._id || initialValues.campaign || "",
      requiresCampaignReport: initialValues.requiresCampaignReport || false,
      customFields: initialValues.customFields || [],
      subtasks: initialValues.subtasks || [],
      attachments: initialValues.attachments || [],
      timeEstimate:
        taskHoursToMinutes(initialValues.timeEstimate) ??
        initialValues.timeEstimate ??
        "",
    };
  };

  const handleTaskSubmit = async (formData, helpers) => {
    const categories = Array.isArray(taskCategories) ? taskCategories : [];
    const missing = (formData.subtasks || []).filter((step) => {
      if (step?.taskCategory) return false;
      return !categories.some(
        (category) =>
          String(category.name || "").toLowerCase() ===
          String(step?.taskName || "").toLowerCase()
      );
    });
    const noStepsAndNoTaskCategory =
      (!formData.subtasks || formData.subtasks.length === 0) &&
      !formData.taskCategory;

    if (
      (missing.length > 0 || noStepsAndNoTaskCategory) &&
      !skipCategoryWarningRef.current
    ) {
      setShowMissingCategoryModal(true);
      helpers?.setSubmitting?.(false);
      return;
    }

    skipCategoryWarningRef.current = false;
    await onSubmit(formData, helpers);
  };

  const {
    values,
    touched,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useAddTaskForm(prepareInitialValues(), handleTaskSubmit);
  // Track selected project separately to avoid hook dependency issues
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialValues?.project?._id || initialValues?.project || ""
  );

  const campaignProjectId =
    selectedProjectId && selectedProjectId !== "other"
      ? selectedProjectId
      : null;
  const { data: projectCampaignsData } = useGetCampaignsByCompany(companyId, {
    projectId: campaignProjectId || undefined,
  });
  const projectCampaigns = projectCampaignsData?.data || [];
  const prevCampaignRef = useRef(initialValues?.campaign?._id || initialValues?.campaign || "");
  const prevTaskGroupRef = useRef(initialValues?.taskGroup || "");

  // Refs to track previous "master" values for resetting manual subtask edits
  const prevMasterValues = useRef({
    taskFlow: initialValues?.taskFlow || "",
    startDate: isEdit && initialValues?.startDate
      ? new Date(initialValues.startDate).toISOString().split('T')[0]
      : "",
    dueDate: isEdit && initialValues?.dueDate
      ? new Date(initialValues.dueDate).toISOString().split('T')[0]
      : ""
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
      setFieldValue("taskCategory", "");
    }
  }, [values.project, initialValues?.project, setFieldValue, isEdit]);

  // Work type pick fills the Master category used for points — no second dropdown
  useEffect(() => {
    if (isEdit) return;
    let workDetails = null;
    if (
      selectedProjectData &&
      selectedProjectId &&
      selectedProjectId !== "other"
    ) {
      workDetails = selectedProjectData.workDetails?.find(
        (wd) => wd.month === selectedMonth
      );
    } else {
      workDetails = monthWorkDetails || projectData?.workDetails;
    }

    const nextId = resolveTaskCategoryId({
      taskGroup: values.taskGroup,
      extraTaskWorkType: values.extraTaskWorkType,
      workDetails,
      categories: taskCategories,
    });
    if (String(values.taskCategory || "") !== String(nextId || "")) {
      setFieldValue("taskCategory", nextId || "");
    }
  }, [
    values.taskGroup,
    values.extraTaskWorkType,
    values.taskCategory,
    selectedProjectData,
    selectedProjectId,
    selectedMonth,
    monthWorkDetails,
    projectData,
    taskCategories,
    isEdit,
    setFieldValue,
  ]);

  // Prefill time estimate from the selected Master category (minutes)
  useEffect(() => {
    if (isEdit) return;
    if (!values.taskGroup || values.taskGroup === "campaign") return;
    if (
      values.taskGroup === "extraTask" &&
      (!values.extraTaskWorkType ||
        values.extraTaskWorkType === "Select work type")
    ) {
      return;
    }

    let workDetails = null;
    if (
      selectedProjectData &&
      selectedProjectId &&
      selectedProjectId !== "other"
    ) {
      workDetails = selectedProjectData.workDetails?.find(
        (wd) => wd.month === selectedMonth
      );
    } else {
      workDetails = monthWorkDetails || projectData?.workDetails;
    }

    const categoryId = resolveTaskCategoryId({
      taskGroup: values.taskGroup,
      extraTaskWorkType: values.extraTaskWorkType,
      workDetails,
      categories: taskCategories,
    });
    if (!categoryId) return;

    const category = (taskCategories || []).find(
      (item) => String(item._id) === String(categoryId)
    );
    const minutes = Number(category?.time) || 0;
    if (minutes <= 0) return;

    if (String(values.timeEstimate ?? "") !== String(minutes)) {
      setFieldValue("timeEstimate", minutes);
    }
  }, [
    values.taskGroup,
    values.extraTaskWorkType,
    values.timeEstimate,
    selectedProjectData,
    selectedProjectId,
    selectedMonth,
    monthWorkDetails,
    projectData,
    taskCategories,
    isEdit,
    setFieldValue,
  ]);

  // Handle automatic custom fields based on task group
  useEffect(() => {
    if (
      values.taskGroup === "shooting" ||
      (values.taskGroup === "extraTask" &&
        matchStandardWorkType(values.extraTaskWorkType) === "shooting")
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

  useEffect(() => {
    if (values.campaign && values.campaign !== prevCampaignRef.current) {
      setFieldValue("requiresCampaignReport", true);
      if (!values.taskGroup || values.taskGroup === "Select task group" || values.taskGroup === "Select work type") {
        setFieldValue("taskGroup", "campaign");
      }
    }
    if (!values.campaign && prevCampaignRef.current && values.taskGroup !== "campaign") {
      setFieldValue("requiresCampaignReport", false);
    }
    prevCampaignRef.current = values.campaign;
  }, [values.campaign, values.taskGroup, setFieldValue]);

  useEffect(() => {
    if (values.taskGroup === "campaign" && prevTaskGroupRef.current !== "campaign") {
      setFieldValue("requiresCampaignReport", true);
      setFieldValue("requiresClientApproval", false);
      setFieldValue("requiresWorkLink", false);
      setFieldValue("taskFlow", "");
      setFieldValue("extraTaskWorkType", "");
    }
    prevTaskGroupRef.current = values.taskGroup;
  }, [values.taskGroup, setFieldValue]);

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
          const mergedAssignees = Array.from(new Set([...(values.assignedTo || []), ...uniqueAssignees]));
          if (mergedAssignees.length !== (values.assignedTo?.length || 0)) {
            setFieldValue("assignedTo", mergedAssignees);
          }
          setFieldValue("requiresClientApproval", selectedFlow.flows.some(step => step.requiresClientApproval));
          setFieldValue("requiresWorkLink", selectedFlow.flows.some(step => step.requiresWorkLink));
          setFieldValue(
            "requiresCampaignReport",
            selectedFlow.flows.some(
              (step) =>
                step.requiresCampaignReport ||
                String(step.taskName || "").toLowerCase() === "campaign"
            )
          );
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
          
          const existingFlowSubtasks = (values.subtasks || []).filter((s) => s.isFromFlow);
          const flowSubtasks = calculatedSteps.map((s, idx) => {
            const matchedCategory = (Array.isArray(taskCategories) ? taskCategories : []).find(
              (category) =>
                String(category.name || "").toLowerCase() ===
                String(s.taskName || "").toLowerCase()
            );
            const previous = existingFlowSubtasks[idx];
            const keepPreviousCategory =
              previous &&
              String(previous.taskName || "").toLowerCase() ===
                String(s.taskName || "").toLowerCase() &&
              previous.taskCategory
                ? previous.taskCategory
                : "";
            return {
            taskName: s.taskName,
            taskCategory: keepPreviousCategory || matchedCategory?._id || "",
            assignee: typeof s.assignee === 'object' && s.assignee !== null ? s.assignee._id : s.assignee,
            startDate: s.startDate.toISOString().split('T')[0],
            dueDate: s.dueDate.toISOString().split('T')[0],
            wasAdjusted: s.wasAdjusted,
            skippedDay: s.skippedDay,
            skippedDayType: s.skippedDayType,
            weightage: s.weightage,
            requiresClientApproval: selectedFlow.flows[idx].requiresClientApproval,
            requiresWorkLink: selectedFlow.flows[idx].requiresWorkLink,
            requiresCampaignReport:
              selectedFlow.flows[idx].requiresCampaignReport ||
              String(selectedFlow.flows[idx].taskName || "").toLowerCase() === "campaign",
            isFromFlow: true
          };
          });

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
  }, [values.taskFlow, values.startDate, values.dueDate, values.taskCategory, taskFlows, taskCategories, weeklyOffs, holidays, setFieldValue]);

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
      taskName: "",
      taskCategory: "",
      assignee: values.assignedTo?.[0] || "",
      startDate: values.startDate || new Date().toISOString().split('T')[0],
      dueDate: values.dueDate || new Date().toISOString().split('T')[0],
      isManual: true,
      isFromFlow: false,
      requiresClientApproval: false,
      requiresWorkLink: false,
      requiresCampaignReport: false
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

  const handleSubtaskCategoryChange = (index, categoryId) => {
    const categories = Array.isArray(taskCategories) ? taskCategories : [];
    const category = categories.find(
      (item) => String(item._id) === String(categoryId)
    );
    const updated = [...(values.subtasks || [])];
    if (!updated[index]) return;
    updated[index].taskCategory = categoryId || "";
    if (!updated[index].isFromFlow) {
      updated[index].taskName = category?.name || "";
    }
    setFieldValue("subtasks", updated);
  };

  const getSelectedSubtaskCategoryId = (step) => {
    if (step?.taskCategory) {
      return typeof step.taskCategory === "object"
        ? step.taskCategory._id
        : step.taskCategory;
    }
    const match = (Array.isArray(taskCategories) ? taskCategories : []).find(
      (category) =>
        String(category.name || "").toLowerCase() ===
        String(step?.taskName || "").toLowerCase()
    );
    return match?._id || "";
  };

  const uncategorizedSubtasks = (values.subtasks || []).filter(
    (step) => !getSelectedSubtaskCategoryId(step)
  );
  const parentCategory = (Array.isArray(taskCategories) ? taskCategories : []).find(
    (category) => String(category._id) === String(values.taskCategory || "")
  );
  const selectedFlow = taskFlows.find((flow) => flow._id === values.taskFlow);
  const flowStepsMissingCategory = (selectedFlow?.flows || []).filter((step) => {
    const name = String(step?.taskName || "").toLowerCase();
    if (!name) return true;
    return !(Array.isArray(taskCategories) ? taskCategories : []).some(
      (category) =>
        category?.isActive !== false &&
        String(category.name || "").toLowerCase() === name
    );
  });
  const showFlowCategoryBanner =
    Boolean(values.taskFlow) &&
    ((values.subtasks || []).length > 0
      ? uncategorizedSubtasks.length > 0
      : flowStepsMissingCategory.length > 0);
  const missingCategoryCount =
    (values.subtasks || []).length > 0
      ? uncategorizedSubtasks.length
      : flowStepsMissingCategory.length;

  const handleMissingCategoryGoBack = () => {
    setShowMissingCategoryModal(false);
  };

  const handleMissingCategorySaveAnyway = () => {
    skipCategoryWarningRef.current = true;
    setShowMissingCategoryModal(false);
    handleSubmit();
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
      return [
        { label: "Campaign", value: "campaign" },
        { label: "Other", value: "extraTask" },
      ];
    }

    const options = [];

    getSelectedWorkItems(workDetails, taskCategories).forEach((item) => {
      if (Number(item.count) > 0) {
        options.push({
          label: `${item.name} (${item.count} remaining)`,
          value: item.kind === "standard" ? item.key : item.name,
        });
      }
    });

    // Always add Campaign and Other — they do not consume monthly content quota
    options.push({
      label: "Campaign",
      value: "campaign",
    });
    options.push({
      label: "Other",
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

  const getExtraTaskWorkTypeOptions = () => {
    const seen = new Set();
    return (taskCategories || [])
      .filter((category) => category?.isActive !== false)
      .map((category) => ({
        label:
          Number(category.points) > 0
            ? `${category.name} (${category.points} pts)`
            : category.name,
        value: extraWorkTypeValueFromName(category.name),
      }))
      .filter((option) => {
        const key = String(option.value || "").toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
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
    values.taskGroup &&
    values.taskGroup !== "Select task group" &&
    values.taskGroup !== "Select work type";
  const isCampaignTaskSelected = values.taskGroup === "campaign";
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

  const mainConflicts = availabilityConflicts.filter((c) => c.label === "main");
  const allConflicts = availabilityConflicts;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#2155A3]/20 backdrop-blur-sm p-3 md:p-4">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-3 md:px-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Task" : "Add Task"}
            </h4>
            <p className="text-xs text-gray-500">
              Task details on the left. Subtasks and conflicts on the right.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedMonth && (
              <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:inline-flex">
                {new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            <PrimaryButton
              icon="/icons/cancel.svg"
              disable={isLoading}
              className="bg-[#F4F9FD]"
              onclick={() => !isLoading && handleClose()}
            />
          </div>
        </header>

        {isLoadingProjectDetails &&
          selectedProjectId &&
          selectedProjectId !== "other" && (
            <div className="mx-5 mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 md:mx-6">
              Loading project details...
            </div>
          )}
        {projectDetailsError &&
          selectedProjectId &&
          selectedProjectId !== "other" && (
            <div className="mx-5 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 md:mx-6">
              Failed to load project details. Please try again.
            </div>
          )}
        {isOtherProjectSelected && (
          <div className="mx-5 mt-3 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 md:mx-6">
            External project — work type and flow fields are hidden.
          </div>
        )}

        <form
          action=" "
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
            <div className="min-h-0 space-y-5 overflow-y-auto border-gray-100 px-5 py-5 md:px-6 lg:border-r">
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
                      selectedValue={values?.taskGroup || "Select work type"}
                      value={values?.taskGroup || "Select work type"}
                      onChange={handleChange}
                      title="Work type"
                      options={
                        isLoadingProjectDetails
                          ? [{ label: "Loading...", value: "" }]
                          : taskGroupOptions
                      }
                      defaultValue="Select work type"
                      disabled={isEdit || isLoadingProjectDetails}
                    />
                    {isExtraTaskSelected && (
                      <div className="space-y-1.5">
                        <Select
                          errors={errors}
                          touched={touched}
                          name={"extraTaskWorkType"}
                          selectedValue={
                            values?.extraTaskWorkType || "Select work type"
                          }
                          value={values?.extraTaskWorkType || "Select work type"}
                          onChange={handleChange}
                          title="Category"
                          options={
                            isLoadingTaskCategories
                              ? [{ label: "Loading...", value: "" }]
                              : extraTaskWorkTypeOptions
                          }
                          defaultValue="Select work type"
                          disabled={isLoadingTaskCategories}
                        />
                        <p className="text-[11px] text-amber-600 px-0.5">
                          Counted as extra work for this month. Does not use the
                          project quota.
                        </p>
                      </div>
                    )}
                  </>
                )}

              {((!isOtherProjectSelected && !isNoProjectSelected) ||
                !showProjectSelection) &&
                campaignProjectId && (
                  <Select
                    errors={errors}
                    touched={touched}
                    name={"campaign"}
                    selectedValue={values?.campaign || ""}
                    value={values?.campaign || ""}
                    onChange={handleChange}
                    title={isCampaignTaskSelected ? "Campaign" : "Campaign (optional)"}
                    options={[
                      { label: "None", value: "" },
                      ...projectCampaigns.map((c) => ({
                        label: c.name,
                        value: c._id,
                      })),
                    ]}
                    defaultValue=""
                    required={false}
                    disabled={!isFormEnabled && !isOtherProjectSelected}
                  />
                )}

              <div>
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
              </div>

              <div>
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <DatePicker
                          errors={errors}
                          value={values.startDate}
                          onChange={handleChange}
                          name={"startDate"}
                          title="Start date"
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

                      <div>
                        <DatePicker
                          title="Due date"
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

                      <div>
                        <Input
                          title="Time Estimate (mins)"
                          placeholder="e.g. 120"
                          errors={errors}
                          name="timeEstimate"
                          type="number"
                          onchange={handleChange}
                          touched={touched}
                          value={values}
                          disabled={!isFormEnabled && !isOtherProjectSelected}
                        />
                      </div>
              </div>

              {((!isOtherProjectSelected && !isNoProjectSelected) ||
                !showProjectSelection) &&
                !isCampaignTaskSelected && (
                  <>
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
                    {values.taskFlow && (!values.startDate || !values.dueDate) && (
                      <div className="bg-blue-50 px-3 py-2.5 text-xs text-blue-500 italic flex items-center gap-1.5 border border-blue-200 rounded-xl">
                        <FiClock className="w-3 h-3" />
                        Set parent Start &amp; Due dates to preview the flow schedule.
                      </div>
                    )}
                    {showFlowCategoryBanner && (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <FiAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        <div className="text-xs text-amber-800">
                          <p className="font-semibold">
                            {missingCategoryCount} flow step{missingCategoryCount === 1 ? "" : "s"} {missingCategoryCount === 1 ? "has" : "have"} no category.
                          </p>
                          <p className="mt-0.5">
                            Those steps will not earn category points. Choose a category on each subtask on the right so the assignee is credited.
                          </p>
                          {(!values.subtasks || values.subtasks.length === 0) &&
                            flowStepsMissingCategory.some((step) => step.taskName) && (
                              <p className="mt-1 font-medium">
                                {flowStepsMissingCategory
                                  .map((step) => step.taskName)
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </>
                )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FiCheck className="h-4 w-4 text-blue-600" />
                  <h5 className="text-sm font-semibold text-gray-800">Requirements</h5>
                </div>
                <div className="space-y-2">
                  {!isCampaignTaskSelected && (
                    <label htmlFor="requiresClientApproval" className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                      <input
                        type="checkbox"
                        id="requiresClientApproval"
                        name="requiresClientApproval"
                        checked={values.requiresClientApproval}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        disabled={!isFormEnabled && !isOtherProjectSelected}
                      />
                      <span className="text-sm font-medium text-gray-700">Client approval</span>
                    </label>
                  )}
                  {!isCampaignTaskSelected && (
                    <label htmlFor="requiresWorkLink" className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                      <input
                        type="checkbox"
                        id="requiresWorkLink"
                        name="requiresWorkLink"
                        checked={values.requiresWorkLink}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600"
                        disabled={!isFormEnabled && !isOtherProjectSelected}
                      />
                      <span className="text-sm font-medium text-gray-700">Work link</span>
                    </label>
                  )}
                  <label htmlFor="requiresCampaignReport" className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 border border-gray-100">
                    <input
                      type="checkbox"
                      id="requiresCampaignReport"
                      name="requiresCampaignReport"
                      checked={values.requiresCampaignReport}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                      disabled={!isFormEnabled && !isOtherProjectSelected}
                    />
                    <span className="text-sm font-medium text-gray-700">Campaign report</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
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
              </div>
              <div>
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
              </div>

              <FileAndLinkUpload
                  fileClassName={"grid grid-cols-3 gap-3"}
                  initialFiles={
                    values?.attachments?.filter(
                      (file) => file.type !== "link"
                    ) || []
                  }
                  initialLinks={
                    values?.attachments?.filter(
                      (file) => file.type === "link"
                    ) || []
                  }
                  onChange={(files) => setFieldValue("attachments", files)}
                  disable={!isFormEnabled && !isOtherProjectSelected}
                />

              <div className="border-t border-gray-100 pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Recurring (optional)
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
                          <strong>Recurring schedule:</strong>
                          {" "}This task will repeat every{" "}
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
            </div>

            <div className="min-h-0 space-y-5 overflow-y-auto bg-[#F7F9FC] px-5 py-5 md:px-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Subtasks</h5>
                    <p className="text-xs text-gray-500">
                      {values.taskFlow
                        ? taskFlows.find((f) => f._id === values.taskFlow)?.name || "Task flow"
                        : "Checklist of work to create with this task"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addManualSubtask}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"
                  >
                    <FiPlus className="h-3 w-3" /> Add step
                  </button>
                </div>

                {(values.subtasks && values.subtasks.length > 0) || values.taskFlow ? (
                  <div className="space-y-3">
                    {values.subtasks?.map((step, index) => {
                      const assigneeOptions = getAssigneeOptions();
                      const currentAssigneeId = typeof step.assignee === "object" ? step.assignee?._id : step.assignee;
                      const stepConflicts = availabilityConflicts.filter((c) => c.label === `subtask-${index}`);

                      return (
                        <div
                          key={index}
                          className={`rounded-2xl border bg-white p-3 shadow-sm ${
                            getSelectedSubtaskCategoryId(step)
                              ? "border-gray-100"
                              : "border-amber-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[11px] font-bold text-blue-600">
                              {index + 1}
                            </span>
                            {step.isFromFlow ? (
                              <input
                                type="text"
                                value={step.taskName}
                                onChange={(e) => handleSubtaskChange(index, "taskName", e.target.value)}
                                placeholder="Subtask name..."
                                className="min-w-0 flex-1 border-b border-transparent bg-transparent py-0.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-300"
                              />
                            ) : (
                              <span className="min-w-0 flex-1 text-sm font-semibold text-gray-800">
                                {step.taskName || "New subtask"}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeSubtask(index)}
                              className="p-1.5 text-gray-300 transition-all hover:text-red-500"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3">
                            <CategoryPicker
                              categories={taskCategories}
                              value={getSelectedSubtaskCategoryId(step)}
                              onChange={(categoryId) => handleSubtaskCategoryChange(index, categoryId)}
                              disabled={isLoadingTaskCategories}
                              compact
                              placeholder={isLoadingTaskCategories ? "Loading..." : "Select category..."}
                              emptyLabel="No category — will not earn points"
                            />
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <select
                              value={currentAssigneeId || ""}
                              onChange={(e) => handleSubtaskChange(index, "assignee", e.target.value)}
                              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-700 outline-none"
                            >
                              <option value="">Assign to...</option>
                              {assigneeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">
                              <input
                                type="date"
                                value={step.startDate}
                                onChange={(e) => handleSubtaskDateChange(index, "startDate", e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-600 outline-none"
                              />
                              <span className="text-gray-300">–</span>
                              <input
                                type="date"
                                value={step.dueDate}
                                onChange={(e) => handleSubtaskDateChange(index, "dueDate", e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-600 outline-none"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                              <input
                                type="checkbox"
                                checked={step.requiresClientApproval}
                                onChange={(e) => handleSubtaskChange(index, "requiresClientApproval", e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-blue-600"
                              />
                              Approval
                            </label>
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                              <input
                                type="checkbox"
                                checked={step.requiresWorkLink}
                                onChange={(e) => handleSubtaskChange(index, "requiresWorkLink", e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-purple-600"
                              />
                              Link
                            </label>
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                              <input
                                type="checkbox"
                                checked={step.requiresCampaignReport}
                                onChange={(e) => handleSubtaskChange(index, "requiresCampaignReport", e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-indigo-600"
                              />
                              Report
                            </label>
                          </div>

                          {step.wasAdjusted && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-amber-600">
                              <FiAlertTriangle className="h-3 w-3" />
                              Shifted from {step.skippedDayType?.toLowerCase()} ({step.skippedDay})
                            </div>
                          )}

                          {!getSelectedSubtaskCategoryId(step) && (
                            <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-2">
                              <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                              <p className="text-[11px] leading-snug text-amber-800">
                                No category on this subtask, so it will not earn category points.
                                {parentCategory
                                  ? ` If you save anyway, the task work type (${parentCategory.name}, ${parentCategory.points} pts) is used as a fallback.`
                                  : " Completing it will not credit category points."}
                              </p>
                            </div>
                          )}

                          {stepConflicts.length > 0 && (
                            <div className="mt-3">
                              <ConflictDetails conflicts={stepConflicts} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <p className="text-center text-[11px] text-gray-400">
                      {values.subtasks.length} subtask{values.subtasks.length === 1 ? "" : "s"} will be created with this task
                    </p>
                    {uncategorizedSubtasks.length > 0 && (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                        <FiAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        <p className="text-xs text-amber-800">
                          {uncategorizedSubtasks.length} subtask{uncategorizedSubtasks.length === 1 ? " has" : "s have"} no category and will not earn category points.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={addManualSubtask}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 py-8 text-blue-500 hover:bg-blue-50"
                  >
                    <FiPlus className="h-4 w-4" />
                    <span className="text-sm font-semibold">Add the first subtask</span>
                  </button>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800">Schedule & conflicts</h5>
                    <p className="text-xs text-gray-500">Who is busy, and on which dates.</p>
                  </div>
                  {allConflicts.length > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      {allConflicts.length} issue{allConflicts.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <ConflictDetails
                  conflicts={mainConflicts}
                  emptyText="No assignee conflicts on the main dates."
                />
              </div>
            </div>
          </div>

          <footer className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3 md:px-6">
            <div className="text-xs text-gray-500">
              {uncategorizedSubtasks.length > 0
                ? `${uncategorizedSubtasks.length} subtask${uncategorizedSubtasks.length === 1 ? "" : "s"} missing a category — they will not earn category points.`
                : Object.keys(errors).length > 0 && Object.keys(touched).length > 0
                ? `Please fix: ${Object.keys(errors).join(", ")}`
                : "Review conflicts before saving."}
            </div>
            <PrimaryButton
              type="submit"
              title="Save Task"
              loading={isLoading}
              disable={(!isFormEnabled && !isOtherProjectSelected) || isLoading}
            />
          </footer>
        </form>
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

      {/* Missing category points warning */}
      <Modal
        isOpen={showMissingCategoryModal}
        onClose={handleMissingCategoryGoBack}
        title="Some steps have no category"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {(values.subtasks || []).length === 0 && !values.taskCategory
              ? "This task has no work type and no categorized subtasks, so completing it will not credit category points."
              : "These subtasks have no category, so they will not earn category points when completed."}
          </p>
          {uncategorizedSubtasks.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
                No category
              </p>
              <ul className="space-y-1.5">
                {uncategorizedSubtasks.map((step, idx) => (
                  <li key={`${step.taskName || "step"}-${idx}`} className="text-sm text-amber-900">
                    {step.taskName || `Subtask ${idx + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {parentCategory ? (
            <p className="text-xs text-gray-500">
              If you save anyway, the task work type ({parentCategory.name}, {parentCategory.points} pts) will be used as a fallback.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Assign a category on each subtask if you want those points credited. You can still save without one.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleMissingCategoryGoBack}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={handleMissingCategorySaveAnyway}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Save anyway
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
