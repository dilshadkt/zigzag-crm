import React, { useState, useEffect, useMemo, useRef } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import { FiAlertTriangle, FiPlus, FiTrash2 } from "react-icons/fi";
import Select from "../../shared/Field/select";
import MultiSelect from "../../shared/Field/multiSelect";
import DatePicker from "../../shared/Field/date";
import AssigneeDatePicker from "../../shared/Field/date/AssigneeDatePicker";
import Input from "../../shared/Field/input";
import CategoryPicker, {
  getCategoryDepartmentName,
} from "../../shared/Field/categoryPicker";
import { useAddSubTaskForm } from "../../../hooks/useAddSubTaskForm";
import Modal from "../../shared/modal";
import { useGetProjectSocialMedia, useGetTaskCategories } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

const socialPlatforms = [
  {
    key: "instagram",
    label: "Instagram URL",
    placeholder: "https://instagram.com/p/...",
    iconClass: "text-pink-500",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    key: "facebook",
    label: "Facebook URL",
    placeholder: "https://facebook.com/...",
    iconClass: "text-blue-600",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    key: "youtube",
    label: "YouTube URL",
    placeholder: "https://youtube.com/watch?v=...",
    iconClass: "text-red-600",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    key: "linkedin",
    label: "LinkedIn URL",
    placeholder: "https://linkedin.com/posts/...",
    iconClass: "text-blue-700",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    key: "twitter",
    label: "Twitter URL",
    placeholder: "https://twitter.com/...",
    iconClass: "text-blue-400",
    path: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
  },
];

const PublishUrlFields = ({ projectData, values, handleChange, disabled }) => {
  const managedPlatforms = socialPlatforms.filter(
    (platform) => projectData?.socialMedia?.[platform.key]?.manage
  );
  const otherPlatforms = (projectData?.socialMedia?.other || []).filter(
    (platform) => platform.manage
  );

  if (managedPlatforms.length === 0 && otherPlatforms.length === 0) {
    return (
      <p className="text-xs text-gray-500">
        No social platforms are enabled for this project yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {managedPlatforms.map((platform) => (
        <div key={platform.key} className="flex flex-col gap-y-[7px]">
          <label className="flex items-center gap-2 pl-[6px] text-sm font-bold text-[#7D8592]">
            <svg className={`h-4 w-4 ${platform.iconClass}`} fill="currentColor" viewBox="0 0 24 24">
              <path d={platform.path} />
            </svg>
            {platform.label}
          </label>
          <input
            type="url"
            className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-4 py-[10px] text-sm text-[#7D8592] outline-none"
            name={`publishUrls.${platform.key}`}
            value={values.publishUrls?.[platform.key] || ""}
            onChange={handleChange}
            placeholder={platform.placeholder}
            disabled={disabled}
          />
        </div>
      ))}
      {otherPlatforms.map((platform, index) => (
        <div key={`${platform.platform}-${index}`} className="flex flex-col gap-y-[7px]">
          <label className="pl-[6px] text-sm font-bold text-[#7D8592]">
            {platform.platform} URL
          </label>
          <input
            type="url"
            className="w-full rounded-[14px] border-2 border-[#D8E0F0]/80 px-4 py-[10px] text-sm text-[#7D8592] outline-none"
            name={`publishUrls.${platform.platform.toLowerCase()}`}
            value={values.publishUrls?.[platform.platform.toLowerCase()] || ""}
            onChange={handleChange}
            placeholder={`https://${platform.platform.toLowerCase()}.com/...`}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
};

const AddSubTask = ({
  isAssignee = false,
  isOpen,
  setShowSubTaskModal,
  teams,
  initialValues = {},
  isLoading = false,
  onSubmit,
  isEdit = false,
  parentTaskId,
  projectData,
  parentCategory: parentCategoryProp,
}) => {
  const { user, companyId } = useAuth();
  const effectiveCompanyId = companyId || user?.company?._id || user?.company;
  const { data: taskCategories = [], isLoading: isLoadingTaskCategories } =
    useGetTaskCategories(effectiveCompanyId);

  const skipCategoryWarningRef = useRef(false);
  const [showMissingCategoryModal, setShowMissingCategoryModal] = useState(false);

  const handleClose = () => {
    skipCategoryWarningRef.current = false;
    setShowMissingCategoryModal(false);
    resetForm();
    setShowSubTaskModal(false);
  };

  const subTaskInitialValues = {
    ...(initialValues || {}),
    parentTaskId: parentTaskId,
    dueDateChangeReason: initialValues?.dueDateChangeReason || "",
    requiresClientApproval: initialValues?.requiresClientApproval || false,
    requiresWorkLink: initialValues?.requiresWorkLink || false,
    requiresCampaignReport: initialValues?.requiresCampaignReport || false,
    customFields: initialValues?.customFields || [],
    taskCategory:
      initialValues?.taskCategory?._id || initialValues?.taskCategory || "",
  };

  const projectId = projectData?._id;
  const { data: socialMediaData } = useGetProjectSocialMedia(
    projectId &&
      (!projectData?.socialMedia ||
        Object.keys(projectData.socialMedia).length === 0)
      ? projectId
      : null
  );

  const effectiveProjectData = projectData?.socialMedia
    ? projectData
    : { socialMedia: socialMediaData?.socialMedia || {} };

  const {
    values,
    touched,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useAddSubTaskForm(subTaskInitialValues, async (formData) => {
    if (!isAssignee && !formData.taskCategory && !skipCategoryWarningRef.current) {
      setShowMissingCategoryModal(true);
      return;
    }
    skipCategoryWarningRef.current = false;
    try {
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      console.error("Error submitting subtask:", error);
    }
  });

  useEffect(() => {
    if (values.title?.toLowerCase().includes("shooting")) {
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
  }, [values.title, setFieldValue]);

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

  const selectedCategory = useMemo(() => {
    const categories = Array.isArray(taskCategories) ? taskCategories : [];
    const selectedId = String(values.taskCategory || "");
    return categories.find((category) => String(category._id) === selectedId);
  }, [taskCategories, values.taskCategory]);

  const parentCategory = useMemo(() => {
    if (parentCategoryProp && typeof parentCategoryProp === "object") {
      return parentCategoryProp;
    }
    const categories = Array.isArray(taskCategories) ? taskCategories : [];
    const parentId =
      parentCategoryProp?._id ||
      parentCategoryProp ||
      initialValues?.parentTask?.taskCategory?._id ||
      "";
    return categories.find((category) => String(category._id) === String(parentId));
  }, [parentCategoryProp, taskCategories, initialValues]);

  const titleKey = String(values.title || "").toLowerCase();
  const isContentSubtask = titleKey === "content";
  const isPublishSubtask = titleKey === "publish";
  const hasNoCategory = !values.taskCategory;

  const [showDateChangeReasonModal, setShowDateChangeReasonModal] =
    useState(false);
  const [pendingNewDueDate, setPendingNewDueDate] = useState(null);
  const [dateChangeReason, setDateChangeReason] = useState("");

  const handleDueDateChange = (e) => {
    const newDate = e.target.value;
    const originalDueDate = initialValues?.dueDate;

    const normalizeDate = (date) => {
      if (!date) return "";
      if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      try {
        return new Date(date).toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    const normalizedNewDate = normalizeDate(newDate);
    const normalizedOriginalDate = normalizeDate(originalDueDate);

    if (
      isEdit &&
      normalizedOriginalDate &&
      normalizedNewDate &&
      normalizedNewDate !== normalizedOriginalDate
    ) {
      setPendingNewDueDate(newDate);
      setShowDateChangeReasonModal(true);
    } else {
      handleChange(e);
    }
  };

  const handleDateChangeReasonSubmit = () => {
    if (!dateChangeReason.trim()) {
      alert("Please provide a reason for changing the due date.");
      return;
    }
    setFieldValue("dueDate", pendingNewDueDate);
    setFieldValue("dueDateChangeReason", dateChangeReason.trim());
    setShowDateChangeReasonModal(false);
    setPendingNewDueDate(null);
    setDateChangeReason("");
  };

  const handleDateChangeReasonCancel = () => {
    setShowDateChangeReasonModal(false);
    setPendingNewDueDate(null);
    setDateChangeReason("");
  };

  const handleMissingCategoryGoBack = () => {
    setShowMissingCategoryModal(false);
  };

  const handleMissingCategorySaveAnyway = () => {
    skipCategoryWarningRef.current = true;
    setShowMissingCategoryModal(false);
    handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#2155A3]/20 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <img src="/icons/loading.svg" alt="" className="w-16" />
          </div>
        ) : (
          <>
            <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-3.5 md:px-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {isEdit ? "Edit Subtask" : "Add Subtask"}
                </h4>
                <p className="text-xs text-gray-500">
                  Name, category, people, then dates.
                </p>
              </div>
              <PrimaryButton
                icon="/icons/cancel.svg"
                className="bg-[#F4F9FD]"
                onclick={handleClose}
                disable={isLoading}
              />
            </header>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 md:px-6">
                {!isAssignee && (
                  <Input
                    placeholder="Subtask name"
                    title="Subtask Name"
                    errors={errors}
                    name="title"
                    onchange={handleChange}
                    touched={touched}
                    value={values}
                    disabled={isLoading}
                  />
                )}

                {!isAssignee ? (
                  <div>
                    <label className="mb-[7px] block pl-[6px] text-sm font-bold text-[#7D8592]">
                      Category
                    </label>
                    <CategoryPicker
                      categories={taskCategories}
                      value={values.taskCategory || ""}
                      onChange={(categoryId) =>
                        setFieldValue("taskCategory", categoryId || "")
                      }
                      disabled={isLoading || isLoadingTaskCategories}
                      placeholder={
                        isLoadingTaskCategories
                          ? "Loading..."
                          : "Select category..."
                      }
                      emptyLabel="No category — will not earn category points"
                    />
                    {hasNoCategory ? (
                      <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <FiAlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        <p className="text-xs text-amber-800">
                          This subtask has no category, so it will not earn category points.
                          {parentCategory?.name
                            ? ` The parent task category (${parentCategory.name}, ${parentCategory.points || 0} pts) can be used as a fallback.`
                            : ""}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1.5 px-0.5 text-[11px] text-gray-500">
                        Completing this step awards {selectedCategory?.points || 0} category points
                        {getCategoryDepartmentName(selectedCategory)
                          ? ` · ${getCategoryDepartmentName(selectedCategory)}`
                          : ""}
                        .
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Category
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">
                      {selectedCategory
                        ? `${selectedCategory.name} (${selectedCategory.points} pts)`
                        : initialValues?.taskCategory?.name
                          ? `${initialValues.taskCategory.name} (${initialValues.taskCategory.points || 0} pts)`
                          : "No category — will not earn category points"}
                    </p>
                    {(getCategoryDepartmentName(selectedCategory) ||
                      getCategoryDepartmentName(initialValues?.taskCategory)) && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {getCategoryDepartmentName(selectedCategory) ||
                          getCategoryDepartmentName(initialValues?.taskCategory)}
                      </p>
                    )}
                  </div>
                )}

                {!isAssignee && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <MultiSelect
                      title="Assignees"
                      errors={errors}
                      onChange={handleChange}
                      touched={touched}
                      name="assignedTo"
                      value={values?.assignedTo || []}
                      options={
                        teams?.map((member) => ({
                          label: `${member?.firstName || member?.name} (${member.position})`,
                          value: member._id,
                        })) || []
                      }
                      placeholder="Select assignees"
                      disabled={isLoading}
                    />
                    <Select
                      errors={errors}
                      name="priority"
                      touched={touched}
                      value={values.priority || "Low"}
                      onChange={handleChange}
                      title="Priority"
                      options={["Low", "Medium", "High"]}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DatePicker
                    errors={errors}
                    value={values.startDate}
                    onChange={handleChange}
                    name="startDate"
                    title="Start Date"
                    touched={touched}
                    disabled={isLoading}
                  />
                  <AssigneeDatePicker
                    title="Due Date"
                    errors={errors}
                    value={values.dueDate}
                    onChange={handleDueDateChange}
                    touched={touched}
                    name="dueDate"
                    disabled={isLoading}
                    assignedTo={values.assignedTo}
                  />
                </div>

                {!isAssignee && (
                  <div>
                    <p className="mb-2 pl-[6px] text-sm font-bold text-[#7D8592]">
                      Requirements
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="requiresClientApproval"
                          checked={values.requiresClientApproval}
                          onChange={handleChange}
                          className="h-3.5 w-3.5 rounded text-blue-600"
                          disabled={isLoading}
                        />
                        Client approval
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="requiresWorkLink"
                          checked={values.requiresWorkLink}
                          onChange={handleChange}
                          className="h-3.5 w-3.5 rounded text-purple-600"
                          disabled={isLoading}
                        />
                        Work link
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="requiresCampaignReport"
                          checked={values.requiresCampaignReport}
                          onChange={handleChange}
                          className="h-3.5 w-3.5 rounded text-indigo-600"
                          disabled={isLoading}
                        />
                        Campaign report
                      </label>
                    </div>
                  </div>
                )}

                {isContentSubtask && (
                  <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F7F9FC] p-4">
                    <p className="text-sm font-semibold text-gray-800">Content details</p>
                    <Description
                      errors={errors}
                      onChange={handleChange}
                      touched={touched}
                      name="copyOfDescription"
                      value={values}
                      title="Content for Description"
                      placeholder="Add content description"
                      disabled={isLoading}
                    />
                    <Description
                      errors={errors}
                      onChange={handleChange}
                      touched={touched}
                      name="description"
                      value={values}
                      title="Description for publishing"
                      placeholder="Add publish description"
                      disabled={isLoading}
                    />
                    <Description
                      errors={errors}
                      onChange={handleChange}
                      touched={touched}
                      name="ideas"
                      value={values}
                      title="Ideas"
                      placeholder="Record your ideas here..."
                      disabled={isLoading}
                    />
                  </div>
                )}

                {isPublishSubtask && (
                  <div className="space-y-3 rounded-2xl border border-gray-100 bg-[#F7F9FC] p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Publish URLs</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Only platforms enabled in project settings are shown here.
                      </p>
                    </div>
                    <PublishUrlFields
                      projectData={effectiveProjectData}
                      values={values}
                      handleChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-gray-100 bg-[#F7F9FC] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800">
                        Additional fields
                      </h5>
                      <p className="text-xs text-gray-500">Optional extras such as a shooting URL.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFieldValue("customFields", [
                          ...(values.customFields || []),
                          { label: "", value: "", type: "text" },
                        ]);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                    >
                      <FiPlus className="h-3 w-3" /> Add field
                    </button>
                  </div>

                  {values.customFields && values.customFields.length > 0 ? (
                    <div className="space-y-2">
                      {values.customFields.map((field, index) => (
                        <div
                          key={index}
                          className="flex items-end gap-2 rounded-xl border border-gray-100 bg-white p-3"
                        >
                          <div className="flex-1">
                            <label className="mb-1 ml-1 block text-[10px] font-bold uppercase text-gray-400">
                              Label
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Shooting URL"
                              value={field.label}
                              onChange={(e) => {
                                const newFields = [...values.customFields];
                                newFields[index].label = e.target.value;
                                setFieldValue("customFields", newFields);
                              }}
                              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none ${
                                errors.customFields && errors.customFields[index]?.label
                                  ? "border-red-400"
                                  : "border-gray-200"
                              }`}
                            />
                          </div>
                          <div className="flex-[2]">
                            <label className="mb-1 ml-1 block text-[10px] font-bold uppercase text-gray-400">
                              Value
                            </label>
                            <input
                              type={field.type || "text"}
                              placeholder="Enter value..."
                              value={field.value}
                              onChange={(e) => {
                                const newFields = [...values.customFields];
                                newFields[index].value = e.target.value;
                                setFieldValue("customFields", newFields);
                              }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFieldValue(
                                "customFields",
                                values.customFields.filter((_, i) => i !== index)
                              );
                            }}
                            className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                            title="Remove field"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-400">None added.</p>
                  )}
                </div>
              </div>

              <footer className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3 md:px-6">
                <p className="text-xs text-gray-500">
                  {hasNoCategory && !isAssignee
                    ? "No category selected — this subtask will not earn category points."
                    : Object.keys(errors).length > 0 && Object.keys(touched).length > 0
                      ? "Please fill the required fields."
                      : "Review the details before saving."}
                </p>
                <PrimaryButton
                  type="submit"
                  title="Save Subtask"
                  disable={isLoading}
                />
              </footer>
            </form>
          </>
        )}
      </div>

      <Modal
        isOpen={showDateChangeReasonModal}
        onClose={handleDateChangeReasonCancel}
        title="Reason for Date Change"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are changing the due date from{" "}
            <span className="font-semibold">
              {initialValues?.dueDate
                ? new Date(initialValues.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
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
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={dateChangeReason}
              onChange={(e) => setDateChangeReason(e.target.value)}
              placeholder="Enter the reason for changing the due date..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleDateChangeReasonCancel}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDateChangeReasonSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Confirm Change
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showMissingCategoryModal}
        onClose={handleMissingCategoryGoBack}
        title="This subtask has no category"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            No category is selected, so this subtask will not earn category points when it is completed.
          </p>
          {parentCategory?.name ? (
            <p className="text-xs text-gray-500">
              If you save anyway, the parent task category ({parentCategory.name}, {parentCategory.points || 0} pts) may be used as a fallback.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Choose a category if you want those points credited. You can still save without one.
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
    </div>
  );
};

export default AddSubTask;
