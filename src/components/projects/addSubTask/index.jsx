import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import MultiSelect from "../../shared/Field/multiSelect";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";
import { useAddSubTaskForm } from "../../../hooks/useAddSubTaskForm";

const AddSubTask = ({
  isOpen,
  setShowSubTaskModal,
  teams,
  initialValues = {},
  isLoading = false,
  onSubmit,
  isEdit = false,
  parentTaskId,
}) => {
  const handleClose = () => {
    resetForm();
    setShowSubTaskModal(false);
  };

  const subTaskInitialValues = {
    ...initialValues,
    parentTaskId: parentTaskId,
  };

  const { values, touched, errors, handleChange, handleSubmit, resetForm } =
    useAddSubTaskForm(subTaskInitialValues, onSubmit);

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 bg-[#2155A3]/15 backdrop-blur-sm py-8 z-50 flexCenter">
      <div className="p-10 bg-white pt-12 px-12 flex flex-col rounded-3xl max-w-[584px] w-full h-full relative">
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
                <Input
                  placeholder="Subtask Name"
                  title="Subtask Name"
                  errors={errors}
                  name="title"
                  onchange={handleChange}
                  touched={touched}
                  value={values}
                />

                <Description
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name="description"
                  value={values}
                  title="Description"
                  placeholder="Add some description of the subtask (optional)"
                />

                <div className="grid gap-x-4 grid-cols-2">
                  <DatePicker
                    errors={errors}
                    value={values.startDate}
                    onChange={handleChange}
                    name="startDate"
                    title="Start Date"
                    touched={touched}
                  />
                  <DatePicker
                    title="Due Date"
                    errors={errors}
                    value={values.dueDate}
                    onChange={handleChange}
                    touched={touched}
                    name="dueDate"
                  />
                </div>

                <Select
                  errors={errors}
                  name="priority"
                  touched={touched}
                  value={values.priority || "Low"}
                  onChange={handleChange}
                  title="Priority"
                  options={["Low", "Medium", "High"]}
                />

                <MultiSelect
                  title="Assignees"
                  errors={errors}
                  onChange={handleChange}
                  touched={touched}
                  name="assignedTo"
                  value={values?.assignedTo || []}
                  options={
                    teams?.map((user) => ({
                      label: `${user.firstName} (${user.position})`,
                      value: user._id,
                    })) || []
                  }
                  placeholder="Select Assignees"
                />

                <div className="mt-auto pt-4">
                  <div className="flexEnd">
                    <PrimaryButton type="submit" title="Save Subtask" />
                  </div>
                </div>
              </form>
            </div>
            <PrimaryButton
              icon="/icons/cancel.svg"
              className="bg-[#F4F9FD] absolute z-40 top-7 right-7"
              onclick={handleClose}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AddSubTask;
