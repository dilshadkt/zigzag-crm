import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
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

    return options;
  };

  const taskGroupOptions = getTaskGroupOptions();
  const isTaskGroupSelected =
    values.taskGroup && values.taskGroup !== "Select task group";

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
                <Input
                  placeholder="Task Name"
                  title="Task Name"
                  errors={errors}
                  name={"title"}
                  onchange={handleChange}
                  touched={touched}
                  value={values}
                  disabled={!isTaskGroupSelected}
                />
                <div className="grid gap-x-4 grid-cols-2">
                  <DatePicker
                    errors={errors}
                    value={values.startDate}
                    onChange={handleChange}
                    name={"startDate"}
                    title="Estimate"
                    touched={touched}
                    disabled={!isTaskGroupSelected}
                  />
                  <DatePicker
                    title="Dead Line"
                    errors={errors}
                    value={values.dueDate}
                    onChange={handleChange}
                    touched={touched}
                    name={"dueDate"}
                    disabled={!isTaskGroupSelected}
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
                  disabled={!isTaskGroupSelected}
                />
                <Select
                  title="Assignee"
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"assignedTo"}
                  selectedValue={values?.assignedTo}
                  options={
                    teams?.map((user) => ({
                      label: `${user.firstName} (${user.position})`,
                      value: user._id,
                    })) || []
                  }
                  defaultValue={
                    teams?.find((user) => user._id === values?.assignedTo)
                      ? `${
                          teams.find((user) => user._id === values?.assignedTo)
                            .firstName
                        } (${
                          teams.find((user) => user._id === values?.assignedTo)
                            .position
                        })`
                      : "Select Assignee"
                  }
                  disabled={!isTaskGroupSelected}
                />
                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name={"description"}
                  value={values}
                  title="Description"
                  placeholder="Add some description of the task"
                  disabled={!isTaskGroupSelected}
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
                    disabled={!isTaskGroupSelected}
                  />
                  <div className="flexEnd">
                    <PrimaryButton
                      type="submit"
                      title="Save Task"
                      disabled={!isTaskGroupSelected}
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
