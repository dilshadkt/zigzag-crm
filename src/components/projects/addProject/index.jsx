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

const TAB_HINTS = {
  basic: "Name, dates, and team on the left. Image and files on the right.",
  customFields: "Fill extra fields configured for your company.",
  workDetails: "Set this month’s work quota for the project.",
  socialMedia: "Choose which platforms this project manages.",
  reporter: "People who receive client-facing updates.",
  checklist: "Daily tasks the team should complete.",
};

const BASIC_FIELDS = [
  "name",
  "startDate",
  "endDate",
  "priority",
  "description",
  "teams",
];

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
    setTouched,
    validateForm,
    isSubmitting,
    submitCount,
  } = useAddProjectForm(initialValues, onSubmit, projectFields);

  const [activeTab, setActiveTab] = useState("basic");
  const [attemptedTabs, setAttemptedTabs] = useState({});

  const tabs = [
    { id: "basic", label: "Basic Info" },
    ...(projectFields && projectFields.length > 0
      ? [{ id: "customFields", label: "Additional Info" }]
      : []),
    { id: "workDetails", label: "Work Details" },
    { id: "socialMedia", label: "Social Media" },
    { id: "reporter", label: "Reporter" },
    { id: "checklist", label: "Daily Checklist" },
  ];

  const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const isLastTab = activeTab === tabs[tabs.length - 1].id;
  const showTabErrors = (tabId) =>
    Boolean(attemptedTabs[tabId]) || submitCount > 0;

  const getErrorCount = (tabId, sourceErrors = errors) => {
    if (!showTabErrors(tabId) || !sourceErrors) return 0;

    switch (tabId) {
      case "basic":
        return BASIC_FIELDS.filter((key) => sourceErrors[key]).length;
      case "customFields":
        return Object.keys(sourceErrors?.customFields || {}).length;
      case "workDetails":
        return Object.keys(sourceErrors?.workDetails || {}).length > 0 ? 1 : 0;
      case "socialMedia":
        return Object.keys(sourceErrors?.socialMedia || {}).length > 0 ? 1 : 0;
      case "reporter":
        return sourceErrors?.reporters ? 1 : 0;
      default:
        return 0;
    }
  };

  const goToTab = (tabId) => setActiveTab(tabId);

  const handleNext = async () => {
    setAttemptedTabs((prev) => ({ ...prev, [activeTab]: true }));

    if (activeTab === "basic") {
      const nextTouched = BASIC_FIELDS.reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        { ...touched }
      );
      setTouched(nextTouched, true);
      const formErrors = await validateForm();
      if (BASIC_FIELDS.some((key) => formErrors[key])) return;
    }

    if (activeTab === "customFields") {
      setTouched({ ...touched, customFields: true }, true);
      const formErrors = await validateForm();
      if (
        formErrors.customFields &&
        Object.keys(formErrors.customFields).length > 0
      ) {
        return;
      }
    }

    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!isLastTab) {
      handleNext();
      return;
    }
    setAttemptedTabs((prev) => ({ ...prev, [activeTab]: true }));
    handleSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#2155A3]/20 backdrop-blur-sm p-3 md:p-4">
      <form
        onSubmit={onFormSubmit}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-5 py-3 md:px-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {isEditMode ? "Edit Project" : "Add Project"}
            </h4>
            <p className="text-xs text-gray-500">
              {TAB_HINTS[activeTab] || "Complete each step to save the project."}
            </p>
          </div>
          <PrimaryButton
            onclick={() => !isSubmitting && setShowModalProject(false)}
            icon={"/icons/cancel.svg"}
            disable={isSubmitting}
            className="bg-[#F4F9FD]"
          />
        </header>

        <div className="flex flex-shrink-0 gap-1 overflow-x-auto border-b border-gray-100 px-5 md:px-6">
          {tabs.map((tab, index) => {
            const errorCount = getErrorCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : errorCount > 0
                      ? "border-transparent text-red-500 hover:text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => goToTab(tab.id)}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : errorCount > 0
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span>{tab.label}</span>
                {errorCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full border border-red-200 bg-red-100 px-1 text-[10px] font-bold text-red-600">
                    {errorCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {activeTab === "basic" && (
            <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-2">
              <div className="min-h-0 space-y-5 overflow-y-auto border-gray-100 px-5 py-5 md:px-6 lg:border-r">
                <Input
                  name={"name"}
                  errors={errors}
                  onchange={handleChange}
                  touched={touched}
                  value={values}
                  placeholder="Project Name"
                  title="Project Name"
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DatePicker
                    title="Start date"
                    errors={errors}
                    name={"startDate"}
                    onChange={handleChange}
                    touched={touched}
                    value={values.startDate}
                  />
                  <DatePicker
                    title="Due date"
                    errors={errors}
                    name={"endDate"}
                    onChange={handleChange}
                    touched={touched}
                    value={values.endDate}
                  />
                </div>
                <Select
                  title="Priority"
                  options={[
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                  ]}
                  errors={errors}
                  name={"priority"}
                  onChange={handleChange}
                  touched={touched}
                  value={values.priority !== null ? values.priority : "low"}
                />
                <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-4">
                  <AddEmployee
                    compact
                    defaultSelectedEmployee={values.teams}
                    onChange={(team) => setFieldValue("teams", team)}
                  />
                  {touched.teams && errors.teams && (
                    <p className="mt-2 text-[11px] text-red-500">{errors.teams}</p>
                  )}
                </div>
              </div>
              <div className="min-h-0 space-y-5 overflow-y-auto bg-[#F7F9FC] px-5 py-5 md:px-6">
                <div>
                  <h5 className="text-sm font-semibold text-gray-800">Project image</h5>
                  <p className="mb-3 text-xs text-gray-500">
                    Pick an avatar or upload a jpg/png.
                  </p>
                  <ThumbImage
                    onSelect={(thmbImg) => setFieldValue("thumbImg", thmbImg)}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-800">Attachments</h5>
                  <p className="mb-3 text-xs text-gray-500">
                    Optional files and links for this project.
                  </p>
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
              </div>
            </div>
          )}

          {activeTab === "workDetails" && (
            <div className="h-full min-h-0 overflow-y-auto px-5 py-5 md:px-6">
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-800">Work details</h5>
                <p className="text-xs text-gray-500">
                  These counts drive monthly quota and task categories.
                </p>
              </div>
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

          {activeTab === "socialMedia" && (
            <div className="h-full min-h-0 overflow-y-auto px-5 py-5 md:px-6">
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-800">Social media</h5>
                <p className="text-xs text-gray-500">
                  Turn on Manage for platforms this project owns.
                </p>
              </div>
              <SocialMediaForm
                values={values}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
              />
            </div>
          )}

          {activeTab === "customFields" && (
            <div className="h-full min-h-0 overflow-y-auto px-5 py-5 md:px-6">
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-800">Additional info</h5>
                <p className="text-xs text-gray-500">
                  Company-specific fields. Required items are marked with *.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {projectFields?.map((field) => {
                  const fieldKey = `customFields.${field.key}`;
                  const fieldValue = values.customFields?.[field.key] ?? "";
                  const fieldTitle = field.required
                    ? `${field.label} *`
                    : field.label;

                  if (field.type === "textarea") {
                    return (
                      <div key={field._id} className="md:col-span-2">
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
                      <label
                        key={field._id}
                        htmlFor={field.key}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-[#F8FAFC] px-3 py-3"
                      >
                        <input
                          type="checkbox"
                          id={field.key}
                          checked={!!fieldValue}
                          onChange={(e) =>
                            setFieldValue(fieldKey, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {fieldTitle}
                        </span>
                      </label>
                    );
                  }

                  if (field.type === "dynamic_list") {
                    return (
                      <div key={field._id} className="md:col-span-2">
                        <DynamicList
                          title={fieldTitle}
                          placeholder={field.placeholder}
                          value={fieldValue || []}
                          fields={field.options}
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

          {activeTab === "reporter" && (
            <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-2">
              <div className="min-h-0 overflow-y-auto border-gray-100 px-5 py-5 md:px-6 lg:border-r">
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-800">Reporters</h5>
                  <p className="text-xs text-gray-500">
                    Search and add people who should see client updates.
                  </p>
                </div>
                <AddEmployee
                  compact
                  label="Reporter"
                  defaultSelectedEmployee={values.reporters}
                  onChange={(reporters) => setFieldValue("reporters", reporters)}
                />
              </div>
              <div className="min-h-0 overflow-y-auto bg-[#F7F9FC] px-5 py-5 md:px-6">
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6">
                  <h5 className="text-sm font-semibold text-gray-800">Why this matters</h5>
                  <p className="mt-2 text-sm text-gray-500">
                    Reporters get visibility on client-facing work. You can skip
                    this step and add them later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="h-full min-h-0 overflow-y-auto px-5 py-5 md:px-6">
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-800">Daily checklist</h5>
                <p className="text-xs text-gray-500">
                  Recurring daily items for this project. Optional.
                </p>
              </div>
              <DailyChecklistForm
                values={values}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
              />
            </div>
          )}
        </div>

        <footer className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3 md:px-6">
          <p className="text-xs text-gray-500">
            Step {currentIndex + 1} of {tabs.length}
          </p>
          <div className="flex items-center gap-3">
            {activeTab !== "basic" && (
              <PrimaryButton
                key="prev-btn"
                type="button"
                title="Previous"
                disable={isSubmitting}
                onclick={handlePrevious}
                className="bg-gray-200 px-4 text-gray-800"
              />
            )}
            {isLastTab ? (
              <PrimaryButton
                key="submit-btn"
                type="submit"
                loading={isSubmitting}
                disable={isSubmitting}
                title={
                  isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Saving..."
                    : isEditMode
                      ? "Save Changes"
                      : "Save Project"
                }
                className="px-4 text-white"
              />
            ) : (
              <PrimaryButton
                key="next-btn"
                type="button"
                title="Next"
                disable={isSubmitting}
                onclick={handleNext}
                className="px-4 text-white"
              />
            )}
          </div>
        </footer>
      </form>
    </div>
  );
};

export default AddProject;
