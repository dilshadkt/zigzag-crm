import React, { useEffect, useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Input from "../../shared/Field/input";
import DatePicker from "../../shared/Field/date";
import Select from "../../shared/Field/select";
import Description from "../../shared/Field/description";
import { useAddProjectForm } from "../../../hooks/useAddProjectForm";
import FileAndLinkUpload from "../../shared/fileUpload";
import ThumbImage from "../thumbImage";
import AddEmployee from "../addEmployee";

const AddProject = ({
  setShowModalProject,
  initialValues,
  onSubmit,
  isOpen,
  isEditMode = false,
}) => {
  const {
    values,
    errors,
    handleSubmit,
    handleChange,
    touched,
    setFieldValue,
    isSubmitting,
  } = useAddProjectForm(initialValues, onSubmit); // Pass initialValues and onSubmit to the hook
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed z-[1000] left-0 right-0 top-0 bottom-0
bg-blue-50 flexCenter py-8 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full rounded-3xl py-14 flex flex-col
  px-28 h-full max-w-[1149px] m-auto relative "
      >
        <h4 className="text-3xl font-bold">
          {isEditMode ? "Edit Project" : "Add Project"}
        </h4>
        <div className="w-full grid grid-cols-5 my-7  overflow-hidden  gap-x-[50px] ">
          <div className="col-span-3 flex flex-col gap-y-4 overflow-y-auto">
            <Input
              name={"name"}
              errors={errors}
              onchange={handleChange}
              touched={touched}
              value={values}
              placeholder="Project Name"
              title="Project Name"
            />
            <div className="grid grid-cols-2 gap-x-4">
              <DatePicker
                title="Starts"
                errors={errors}
                name={"startDate"}
                onChange={handleChange}
                touched={touched}
                value={values.startDate}
              />
              <DatePicker
                title="Dead Line"
                errors={errors}
                name={"dueDate"}
                onChange={handleChange}
                touched={touched}
                value={values.dueDate}
              />
            </div>
            <Select
              title="Priority"
              options={["low", "medium", "high"]}
              errors={errors}
              name={"periority"}
              onChange={handleChange}
              touched={touched}
              value={values.periority !== null ? values.periority : "low"}
            />
            <Description
              errors={errors}
              touched={touched}
              name={"description"}
              onChange={handleChange}
              value={values}
              title="Description"
              placeholder="Add some description of the project"
            />
            <AddEmployee
              defaultSelectedEmployee={values.teams}
              onChange={(team) => setFieldValue("teams", team)}
            />
          </div>
          <div className="col-span-2  h-full  overflow-y-auto  flex flex-col ">
            <ThumbImage
              onSelect={(thmbImg) => setFieldValue("thumbImg", thmbImg)}
            />
            <FileAndLinkUpload
              initialFiles={values?.attachments?.filter(
                (file) => file?.type !== "link"
              )}
              initialLinks={values?.attachments?.filter(
                (file) => file?.type === "link"
              )}
              fileClassName={"grid grid-cols-2 gap-3"}
              onChange={(files) => (values.attachments = files)}
            />
          </div>
        </div>
        <PrimaryButton
          onclick={() => setShowModalProject(false)}
          icon={"/icons/cancel.svg"}
          className={"absolute bg-[#F4F9FD] right-[30px] top-[30px]"}
        />
        <PrimaryButton
          type="submit"
          title={
            isSubmitting
              ? "Loading..."
              : isEditMode
              ? "Save Changes"
              : "Save Project"
          }
          className={"absolute text-white right-[112px] px-4 bottom-[35px]"}
        />
      </form>
    </div>
  );
};

export default AddProject;
