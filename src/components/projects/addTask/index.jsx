import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import MultiSelect from "../../shared/Field/multiSelect";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";
import { useAddTaskForm } from "../../../hooks/useAddTaskForm";
import { useCreateTask } from "../../../api/hooks";
import FileAndLinkUpload from "../../shared/fileUpload";

const AddTask = ({
  isOpen,
  setShowModalTask,
  teams,
  initialValues,
  isLoading = false,
  onSubmit,
  projectData,
  isEdit = false,
}) => {
  const handleClose = () => {
    resetForm();
    setShowModalTask(false);
  };

  const { values, touched, errors, handleChange, handleSubmit, resetForm } =
    useAddTaskForm(initialValues, onSubmit);

  // Get task group options from project work details
  const getTaskGroupOptions = () => {
    if (!projectData?.workDetails) return [];

    const options = [];
    const workDetails = projectData.workDetails;

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

  // Get extra task work type options
  const getExtraTaskWorkTypeOptions = () => {
    if (!projectData?.workDetails) return [];

    const options = [];
    const workDetails = projectData.workDetails;

    // Add all work types as options for extra tasks
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

  const taskGroupOptions = getTaskGroupOptions();
  const extraTaskWorkTypeOptions = getExtraTaskWorkTypeOptions();
  const isTaskGroupSelected =
    values.taskGroup && values.taskGroup !== "Select task group";
  const isExtraTaskSelected = values.taskGroup === "extraTask";
  const isExtraTaskWorkTypeSelected = isExtraTaskSelected
    ? values.extraTaskWorkType &&
      values.extraTaskWorkType !== "Select work type"
    : true;
  const isFormEnabled = isTaskGroupSelected && isExtraTaskWorkTypeSelected;

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
              <form
                action=" "
                onSubmit={handleSubmit}
                className="mt-3 flex flex-col gap-y-4"
              >
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
                  required
                  disabled={isEdit}
                />

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
                    required
                  />
                )}

                <Input
                  placeholder="Task Name"
                  title="Task Name"
                  errors={errors}
                  name={"title"}
                  onchange={handleChange}
                  touched={touched}
                  value={values}
                  disabled={!isFormEnabled}
                />
                <div className="grid gap-x-4 grid-cols-2">
                  <DatePicker
                    errors={errors}
                    value={values.startDate}
                    onChange={handleChange}
                    name={"startDate"}
                    title="Estimate"
                    touched={touched}
                    disabled={!isFormEnabled}
                  />
                  <DatePicker
                    title="Dead Line"
                    errors={errors}
                    value={values.dueDate}
                    onChange={handleChange}
                    touched={touched}
                    name={"dueDate"}
                    disabled={!isFormEnabled}
                  />
                </div>
                <Select
                  errors={errors}
                  name={"periority"}
                  touched={touched}
                  value={"Low"}
                  onChange={handleChange}
                  title="Priority"
                  options={["Low", "Medium", "High"]}
                  disabled={!isFormEnabled}
                />
                <MultiSelect
                  title="Assignees"
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"assignedTo"}
                  value={values?.assignedTo || []}
                  options={
                    teams?.map((user) => ({
                      label: `${user.firstName} (${user.position})`,
                      value: user._id,
                    })) || []
                  }
                  placeholder="Select Assignees"
                  disabled={!isFormEnabled}
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
                    disabled={!isFormEnabled}
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
                          value={values}
                          disabled={!isFormEnabled}
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
                            disabled={!isFormEnabled}
                          />
                          <Input
                            placeholder="10"
                            title="Max Recurrences (Optional)"
                            errors={errors}
                            name={"maxRecurrences"}
                            onchange={handleChange}
                            touched={touched}
                            value={values}
                            disabled={!isFormEnabled}
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
                  value={values}
                  title="Content for Description"
                  placeholder="Add copy of description"
                  disabled={!isFormEnabled}
                />
                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"description"}
                  value={values}
                  title="Description for publishing"
                  placeholder="Add some description of the task"
                  disabled={!isFormEnabled}
                />
                <div>
                  <FileAndLinkUpload
                    fileClassName={"grid grid-cols-3 gap-3"}
                    initialFiles={initialValues?.attachments.filter(
                      (file) => file.type !== "link"
                    )}
                    initialLinks={initialValues?.attachments.filter(
                      (file) => file.type === "link"
                    )}
                    onChange={(files) => (values.attachments = files)}
                    disabled={!isFormEnabled}
                  />
                  <div className="flexEnd">
                    <PrimaryButton
                      type="submit"
                      title="Save Task"
                      disabled={!isFormEnabled}
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
