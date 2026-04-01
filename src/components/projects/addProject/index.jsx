import React, { useState } from "react";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Input from "../../shared/Field/input";
import DatePicker from "../../shared/Field/date";
import Select from "../../shared/Field/select";
import Description from "../../shared/Field/description";
import DynamicList from "../../shared/Field/dynamicList";
import FileUpload from "../../shared/Field/file";
import { useAddProjectForm } from "../../../hooks/useAddProjectForm";
import FileAndLinkUpload from "../../shared/fileUpload";
import AddEmployee from "../addEmployee";
import WorkDetailsForm from "../workDetailsForm";
import SocialMediaForm from "../socialMediaForm";
import ThumbImage from "../thumbImage";
import MonthlyWorkDetailsForm from "../monthlyWorkDetailsForm";

import DailyChecklistForm from "../dailyChecklistForm";

import { useGetProjectFields } from "../../../api/hooks";
import { useAuth } from "../../../hooks/useAuth";

const AddProject = ({
  setShowModalProject,
  initialValues,
  onSubmit,
  isOpen,
  isEditMode = false,
}) => {
  const { companyId } = useAuth();
  const { data: projectFields } = useGetProjectFields(companyId);

  const {
    values,
    errors,
    handleSubmit,
    handleChange,
    touched,
    setFieldValue,
    isSubmitting,
  } = useAddProjectForm(initialValues, onSubmit, projectFields); // Pass projectFields to the hook

  const [activeTab, setActiveTab] = useState("basic"); // "basic", "workDetails", "socialMedia", "checklist", "customFields"
  if (!isOpen) {
    return null;
  }

  // Tabs for better organization
  const tabs = [
    { id: "basic", label: "Basic Info" },
    ...(projectFields && projectFields.length > 0 ? [{ id: "customFields", label: "Additional Info" }] : []),
    { id: "workDetails", label: "Work Details" },
    { id: "socialMedia", label: "Social Media" },
    { id: "checklist", label: "Daily Checklist" },
  ];

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "checklist") {
      handleSubmit(e);
    }
  };

  const getErrorCount = (tabId) => {
    if (!errors || Object.keys(errors).length === 0) return 0;

    switch (tabId) {
      case "basic":
        return [
          "name",
          "startDate",
          "endDate",
          "priority",
          "description",
          "teams",
        ].filter((key) => errors[key]).length;
      case "customFields":
        return Object.keys(errors?.customFields || {}).length;
      case "workDetails":
        return Object.keys(errors?.workDetails || {}).length > 0 ? 1 : 0;
      case "socialMedia":
        return Object.keys(errors?.socialMedia || {}).length > 0 ? 1 : 0;
      default:
        return 0;
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
          {tabs.map((tab) => {
            const errorCount = getErrorCount(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                className={`px-6 py-3 text-sm cursor-pointer border-b-2 font-medium flex items-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600"
                    : errorCount > 0
                    ? "text-red-500 border-transparent hover:text-red-600"
                    : "text-gray-500 hover:text-gray-700 border-transparent"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {errorCount > 0 && (
                  <span className="flex items-center justify-center bg-red-100 text-red-600 text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full animate-pulse border border-red-200 shadow-sm">
                    {errorCount}
                  </span>
                )}
              </button>
            );
          })}
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
                  name={"priority"}
                  onChange={handleChange}
                  touched={touched}
                  value={values.priority !== null ? values.priority : "low"}
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
                  onChange={(files) => setFieldValue("attachments", files)}
                />
              </div>
            </>
          )}

          {/* Work Details Tab */}
          {activeTab === "workDetails" && (
            <div className="col-span-5 overflow-y-auto pr-4">
              {isEditMode ? (
                <MonthlyWorkDetailsForm
                  values={values}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                  isEditMode={isEditMode}
                  projectStartDate={values.startDate}
                  projectEndDate={values.endDate}
                />
              ) : (
                <WorkDetailsForm
                  values={values}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                  isEditMode={isEditMode}
                />
              )}
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

          {/* Custom Fields Tab */}
          {activeTab === "customFields" && (
            <div className="col-span-5 overflow-y-auto pr-4">
              <div className="grid grid-cols-2 gap-6">
                {projectFields?.map((field) => {
                  const fieldKey = `customFields.${field.key}`;
                  const fieldValue = values.customFields?.[field.key] ?? "";
                  const fieldTitle = field.required ? `${field.label} *` : field.label;

                  if (field.type === "textarea") {
                    return (
                      <div key={field._id} className="col-span-2">
                        <Description
                          title={fieldTitle}
                          placeholder={field.placeholder}
                          value={{ [field.key]: fieldValue }}
                          name={field.key}
                          onChange={(e) => setFieldValue(fieldKey, e.target.value)}
                          errors={errors.customFields}
                          touched={touched.customFields}
                        />
                      </div>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <Select
                        key={field._id}
                        title={fieldTitle}
                        options={field.options || []}
                        value={fieldValue}
                        name={field.key}
                        onChange={(e) => setFieldValue(fieldKey, e.target.value)}
                        errors={errors.customFields}
                        touched={touched.customFields}
                      />
                    );
                  }

                  if (field.type === "checkbox") {
                    return (
                      <div key={field._id} className="flex flex-col gap-1 py-2">
                        <div className="flex items-center gap-x-3">
                          <input
                            type="checkbox"
                            id={field.key}
                            checked={!!fieldValue}
                            onChange={(e) => setFieldValue(fieldKey, e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                            {fieldTitle}
                          </label>
                        </div>
                        {errors.customFields?.[field.key] && touched.customFields?.[field.key] && (
                          <span className="text-[10px] text-red-500 ml-8">
                            {errors.customFields[field.key]}
                          </span>
                        )}
                      </div>
                    );
                  }
                  if (field.type === "dynamic_list") {
                    return (
                      <div key={field._id} className="col-span-2">
                        <DynamicList
                          title={fieldTitle}
                          placeholder={field.placeholder}
                          value={fieldValue || [""]}
                          name={field.key}
                          onChange={(newList) => setFieldValue(fieldKey, newList)}
                          errors={errors.customFields}
                          touched={touched.customFields}
                        />
                      </div>
                    );
                  }

                  if (field.type === "date") {
                    return (
                      <DatePicker
                        key={field._id}
                        title={fieldTitle}
                        value={fieldValue}
                        name={field.key}
                        onChange={(e) => setFieldValue(fieldKey, e.target.value)}
                        errors={errors.customFields}
                        touched={touched.customFields}
                      />
                    );
                  }

                   if (field.type === "file" || field.type === "image") {
                    return (
                      <FileUpload
                        key={field._id}
                        title={fieldTitle}
                        type={field.type}
                        placeholder={field.placeholder || `Select ${field.type}`}
                        value={{ [field.key]: fieldValue }}
                        name={field.key}
                        onchange={(e) => setFieldValue(fieldKey, e.target.value)}
                        errors={errors.customFields}
                        touched={touched.customFields}
                      />
                    );
                  }

                  return (
                    <Input
                      key={field._id}
                      title={fieldTitle}
                      placeholder={field.placeholder}
                      value={{ [field.key]: fieldValue }}
                      name={field.key}
                      onchange={(e) => setFieldValue(fieldKey, e.target.value)}
                      type={field.type}
                      errors={errors.customFields}
                      touched={touched.customFields}
                    />
                  );

                })}
              </div>
            </div>
          )}

          {/* Daily Checklist Tab */}
          {activeTab === "checklist" && (
            <div className="col-span-5 overflow-y-auto pr-4">
              <DailyChecklistForm
                values={values}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
              />
            </div>
          )}
        </div>

        <PrimaryButton
          onclick={() => !isSubmitting && setShowModalProject(false)}
          icon={"/icons/cancel.svg"}
          disable={isSubmitting}
          className={"absolute bg-[#F4F9FD] right-[30px] top-[30px]"}
        />

        {/* Bottom navigation buttons */}
        <div className="absolute  bottom-[35px] right-[30px] flex gap-4">
          {activeTab !== "basic" && (
            <PrimaryButton
              key="prev-btn"
              type="button"
              title="Previous"
              disable={isSubmitting}
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
              key="next-btn"
              type="button"
              title="Next"
              disable={isSubmitting}
              onclick={(e) => {
                e?.preventDefault();
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
              key="submit-btn"
              type="submit"
              loading={isSubmitting}
              disable={isSubmitting}
              title={isEditMode ? "Save Changes" : "Save Project"}
              className="text-white px-4"
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default AddProject;
