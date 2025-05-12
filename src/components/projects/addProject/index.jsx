import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Input from "../../shared/Field/input";
import DatePicker from "../../shared/Field/date";
import Select from "../../shared/Field/select";
import Description from "../../shared/Field/description";
import { useAddProjectForm } from "../../../hooks/useAddProjectForm";
import FileAndLinkUpload from "../../shared/fileUpload";
import AddEmployee from "../addEmployee";
import WorkDetailsForm from "../workDetailsForm";
import SocialMediaForm from "../socialMediaForm";
import ThumbImage from "../thumbImage";

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
  const [activeTab, setActiveTab] = useState("basic"); // "basic", "workDetails", "socialMedia"
  if (!isOpen) {
    return null;
  }

  // Tabs for better organization
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "workDetails", label: "Work Details" },
    { id: "socialMedia", label: "Social Media" },
  ];

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'socialMedia') {
      handleSubmit(e);
    }
  };

  const hasErrors = (tabId) => {
    switch (tabId) {
      case 'basic':
        return Object.keys(errors).some(key => ['name', 'startDate', 'endDate', 'periority', 'description', 'teams'].includes(key));
      case 'workDetails':
        return Object.keys(errors).some(key => ['workDetails'].includes(key));
      case 'socialMedia':
        return Object.keys(errors).some(key => ['socialMedia'].includes(key));
      default:
        return false;
    }
  };
  return (
    <div
      className="fixed z-[1000] left-0 right-0 top-0 bottom-0
bg-blue-50 flexCenter py-8 backdrop-blur-sm"
    >
      <form
        onSubmit={onFormSubmit}
        className="bg-white w-full rounded-3xl py-14 flex flex-col
  px-28 h-full max-w-[1149px] m-auto relative "
      >
        <h4 className="text-3xl font-bold">
          {isEditMode ? "Edit Project" : "Add Project"}
        </h4>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`px-6 py-3 text-sm cursor-pointer border-b-2 font-medium ${
                activeTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : hasErrors(tab.id)
                  ? "text-red-600 border-transparent"
                  : "text-gray-500 hover:text-gray-700 border-transparent"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full grid grid-cols-5 my-7 overflow-hidden gap-x-[50px] h-[calc(100%-180px)]">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <>
              <div className="col-span-3 flex flex-col gap-y-4 overflow-y-auto pr-4">
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
                    name={"endDate"}
                    onChange={handleChange}
                    touched={touched}
                    value={values.endDate}
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
              <div className="col-span-2 h-full overflow-y-auto flex flex-col pr-4">
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
            </>
          )}

          {/* Work Details Tab */}
          {activeTab === "workDetails" && (
            <div className="col-span-5 overflow-y-auto pr-4">
              <WorkDetailsForm
                values={values}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
              />
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === "socialMedia" && (
            <div className="col-span-5 overflow-y-auto pr-4">
              <SocialMediaForm
                values={values}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
              />
            </div>
          )}
        </div>

        <PrimaryButton
          onclick={() => setShowModalProject(false)}
          icon={"/icons/cancel.svg"}
          className={"absolute bg-[#F4F9FD] right-[30px] top-[30px]"}
        />

        {/* Bottom navigation buttons */}
        <div className="absolute  bottom-[35px] right-[30px] flex gap-4">
          {activeTab !== "basic" && (
            <PrimaryButton
              type="button"
              title="Previous"
              onclick={() => {
                const currentIndex = tabs.findIndex(
                  (tab) => tab.id === activeTab
                );
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].id);
                }
              }}
              className="bg-gray-200 text-gray-800 px-4"
            />
          )}

          {activeTab !== tabs[tabs.length - 1].id ? (
            <PrimaryButton
              type="button"
              title="Next"
              onclick={() => {
                const currentIndex = tabs.findIndex(
                  (tab) => tab.id === activeTab
                );
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1].id);
                }
              }}
              className="text-white px-4"
            />
          ) : (
            <PrimaryButton
              type="submit"
              title={
                isSubmitting
                  ? "Loading..."
                  : isEditMode
                  ? "Save Changes"
                  : "Save Project"
              }
              className="text-white px-4"
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default AddProject;
