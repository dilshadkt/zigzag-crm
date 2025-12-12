import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import MultiSelect from "../../shared/Field/multiSelect";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";
import { useAddSubTaskForm } from "../../../hooks/useAddSubTaskForm";
import Modal from "../../shared/modal";
import { useGetProjectSocialMedia } from "../../../api/hooks";

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
}) => {
  const handleClose = () => {
    resetForm();
    setShowSubTaskModal(false);
  };

  const subTaskInitialValues = {
    ...(initialValues || {}),
    parentTaskId: parentTaskId,
    dueDateChangeReason: initialValues?.dueDateChangeReason || "",
  };

  // Get project social media data if not provided in projectData
  const projectId = projectData?._id;
  const { data: socialMediaData } = useGetProjectSocialMedia(
    projectId &&
      (!projectData?.socialMedia ||
        Object.keys(projectData.socialMedia).length === 0)
      ? projectId
      : null
  );

  // Use projectData if available, otherwise use fetched social media data
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
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      // Don't reset form if there's an error
      console.error("Error submitting subtask:", error);
    }
  });

  // State for due date change reason modal
  const [showDateChangeReasonModal, setShowDateChangeReasonModal] =
    useState(false);
  const [pendingNewDueDate, setPendingNewDueDate] = useState(null);
  const [dateChangeReason, setDateChangeReason] = useState("");

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
    <div className="fixed left-0 right-0 top-0 bottom-0 bg-[#2155A3]/15 backdrop-blur-sm py-8 z-50 flexCenter">
      <div
        className={`p-10 bg-white pt-12 px-12 flex flex-col
        rounded-3xl max-w-[584px] w-full ${
          isAssignee ? `` : `h-full`
        } relative`}
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
                {isEdit ? "Edit Subtask" : "Add Subtask"}
              </h4>
              <form
                action=""
                onSubmit={handleSubmit}
                className="mt-3 flex flex-col gap-y-4 h-full"
              >
                {!isAssignee && (
                  <Input
                    placeholder="Subtask Name"
                    title="Subtask Name"
                    errors={errors}
                    name="title"
                    onchange={handleChange}
                    touched={touched}
                    value={values}
                    disabled={isLoading}
                  />
                )}

                {/* Show extra fields if subtask is 'content' */}
                {values.title.toLowerCase() === "content" && (
                  <>
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
                    {/* Ideas field with build icon */}
                    <div className="flex flex-col gap-1 mt-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
                            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                          />
                        </svg>
                        Ideas
                      </label>
                      <textarea
                        className="border rounded px-2 py-1 text-sm min-h-[60px]"
                        name="ideas"
                        value={values.ideas || ""}
                        onChange={handleChange}
                        placeholder="Record your ideas here..."
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                {/* Show publish URL fields if subtask is 'publish' */}
                {values.title.toLowerCase() === "publish" && (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 mb-3">
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
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          Publish URLs
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <svg
                          className="w-4 h-4 text-blue-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-xs text-blue-700">
                          Only platforms managed in project settings will appear
                          here. Configure social media platforms in the project
                          settings.
                        </p>
                      </div>
                    </div>

                    {/* Instagram URL */}
                    {effectiveProjectData?.socialMedia?.instagram?.manage && (
                      <div className="flex flex-col gap-y-[7px]">
                        <label className="text-sm pl-[6px] font-bold text-[#7D8592] flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-pink-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none w-full"
                          name="publishUrls.instagram"
                          value={values.publishUrls?.instagram || ""}
                          onChange={handleChange}
                          placeholder="https://instagram.com/p/..."
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {/* Facebook URL */}
                    {effectiveProjectData?.socialMedia?.facebook?.manage && (
                      <div className="flex flex-col gap-y-[7px]">
                        <label className="text-sm pl-[6px] font-bold text-[#7D8592] flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none w-full"
                          name="publishUrls.facebook"
                          value={values.publishUrls?.facebook || ""}
                          onChange={handleChange}
                          placeholder="https://facebook.com/..."
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {/* YouTube URL */}
                    {effectiveProjectData?.socialMedia?.youtube?.manage && (
                      <div className="flex flex-col gap-y-[7px]">
                        <label className="text-sm pl-[6px] font-bold text-[#7D8592] flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          YouTube URL
                        </label>
                        <input
                          type="url"
                          className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none w-full"
                          name="publishUrls.youtube"
                          value={values.publishUrls?.youtube || ""}
                          onChange={handleChange}
                          placeholder="https://youtube.com/watch?v=..."
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {/* LinkedIn URL */}
                    {effectiveProjectData?.socialMedia?.linkedin?.manage && (
                      <div className="flex flex-col gap-y-[7px]">
                        <label className="text-sm pl-[6px] font-bold text-[#7D8592] flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-blue-700"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none w-full"
                          name="publishUrls.linkedin"
                          value={values.publishUrls?.linkedin || ""}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/posts/..."
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {/* Twitter URL */}
                    {effectiveProjectData?.socialMedia?.twitter?.manage && (
                      <div className="flex flex-col gap-y-[7px]">
                        <label className="text-sm pl-[6px] font-bold text-[#7D8592] flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none w-full"
                          name="publishUrls.twitter"
                          value={values.publishUrls?.twitter || ""}
                          onChange={handleChange}
                          placeholder="https://twitter.com/..."
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {/* Other social media platforms */}
                    {effectiveProjectData?.socialMedia?.other?.map(
                      (platform, index) =>
                        platform.manage && (
                          <div
                            key={index}
                            className="flex flex-col gap-y-[7px]"
                          >
                            <label className="text-sm pl-[6px] font-bold text-[#7D8592] flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                              </svg>
                              {platform.platform} URL
                            </label>
                            <input
                              type="url"
                              className="rounded-[14px] text-sm border-2 text-[#7D8592] border-[#D8E0F0]/80 py-[10px] px-4 outline-none focus:outline-none w-full"
                              name={`publishUrls.${platform.platform.toLowerCase()}`}
                              value={
                                values.publishUrls?.[
                                  platform.platform.toLowerCase()
                                ] || ""
                              }
                              onChange={handleChange}
                              placeholder={`https://${platform.platform.toLowerCase()}.com/...`}
                              disabled={isLoading}
                            />
                          </div>
                        )
                    )}
                  </div>
                )}

                <div className="grid gap-x-4 grid-cols-2">
                  <DatePicker
                    errors={errors}
                    value={values.startDate}
                    onChange={handleChange}
                    name="startDate"
                    title="Start Date"
                    touched={touched}
                    disabled={isLoading}
                  />
                  <DatePicker
                    title="Due Date"
                    errors={errors}
                    value={values.dueDate}
                    onChange={handleDueDateChange}
                    touched={touched}
                    name="dueDate"
                    disabled={isLoading}
                  />
                </div>
                {!isAssignee && (
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
                )}
                {!isAssignee && (
                  <MultiSelect
                    title="Assignees"
                    errors={errors}
                    onChange={handleChange}
                    touched={touched}
                    name="assignedTo"
                    value={values?.assignedTo || []}
                    options={
                      teams?.map((user) => ({
                        label: `${user?.firstName || user?.name} (${
                          user.position
                        })`,
                        value: user._id,
                      })) || []
                    }
                    placeholder="Select Assignees"
                    disabled={isLoading}
                  />
                )}

                <div className="mt-auto pt-4">
                  <div className="flexEnd">
                    <PrimaryButton
                      type="submit"
                      title="Save Subtask"
                      disable={isLoading}
                    />
                  </div>
                </div>
              </form>
            </div>
            <PrimaryButton
              icon="/icons/cancel.svg"
              className="bg-[#F4F9FD] absolute z-40 top-7 right-7"
              onclick={handleClose}
              disable={isLoading}
            />
          </>
        )}
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
    </div>
  );
};

export default AddSubTask;
