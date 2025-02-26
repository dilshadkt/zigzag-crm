import React from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Description from "../../shared/Field/description";
import Select from "../../shared/Field/select";
import DatePicker from "../../shared/Field/date";
import Input from "../../shared/Field/input";
import { useAddTaskForm } from "../../../hooks/useAddTaskForm";
import { useCreateTask } from "../../../api/hooks";
import FileAndLinkUpload from "../../shared/fileUpload";

const AddTask = ({ setShowModalTask, selectedProject, assignee }) => {
  const handleClose = () => {
    resetForm();
    setShowModalTask(false);
  };
  const createTaskMutation = useCreateTask(handleClose, selectedProject);
  const { values, touched, errors, handleChange, handleSubmit, resetForm } =
    useAddTaskForm(createTaskMutation, assignee);

  return (
    <div
      className="fixed left-0 right-0 top-0 bottom-0
bg-[#2155A3]/15 backdrop-blur-sm py-8 z-50 flexCenter"
    >
      <div
        className="p-10 bg-white pt-12  px-12 flex flex-col
rounded-3xl max-w-[584px] w-full h-full relative"
      >
        <div className="w-full h-full flex flex-col overflow-y-auto">
          <h4 className="text-lg pb-2 font-medium sticky top-0 bg-white z-20">
            Add Task
          </h4>
          <form
            action=" "
            onSubmit={handleSubmit}
            className="mt-3 flex flex-col gap-y-4"
          >
            <Input
              placeholder="Task Name"
              title="Task Name"
              errors={errors}
              name={"name"}
              onchange={handleChange}
              touched={touched}
              value={values}
            />
            <Select
              errors={errors}
              touched={touched}
              name={"taskGroup"}
              value="Design"
              onChange={handleChange}
              title="Task Group"
              options={["Design", "Content", "Editing"]}
            />
            <div className="grid gap-x-4 grid-cols-2">
              <DatePicker
                errors={errors}
                value={values.startDate}
                onChange={handleChange}
                name={"startDate"}
                title="Estimate"
                touched={touched}
              />
              <DatePicker
                title="Dead Line"
                errors={errors}
                value={values.dueDate}
                onChange={handleChange}
                touched={touched}
                name={"dueDate"}
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
            />
            <Select
              title="Assignee"
              errors={errors}
              onChange={handleChange}
              touched={touched}
              name={"assignee"}
              options={assignee?.map((user) => user?.firstName)}
              defaultValue={"Select Assignee"}
            />
            <Description
              errors={errors}
              onChange={handleChange}
              touched={touched}
              name={"description"}
              value={values}
              title="Description"
              placeholder="Add some description of the task"
            />
            <div>
              <FileAndLinkUpload fileClassName={"grid grid-cols-3 gap-3"} />
              <div className="flexEnd">
                <PrimaryButton type="submit" title="Save Task" />
              </div>
            </div>
          </form>
        </div>
        <PrimaryButton
          icon={"/icons/cancel.svg"}
          className={"bg-[#F4F9FD] absolute z-40 top-7 right-7"}
          onclick={handleClose}
        />
      </div>
    </div>
  );
};

export default AddTask;
