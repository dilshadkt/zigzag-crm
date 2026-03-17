import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ModalLayout from "../../shared/modal";
import Input from "../../shared/Field/input";
import Select from "../../shared/Field/select";

const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" }
];

const ProjectFieldModal = ({ isOpen, onClose, field, onSave }) => {
  const isEditing = !!field;

  const initialValues = {
    label: field?.label || "",
    type: field?.type || "text",
    isRequired: field?.required || false,
    placeholder: field?.placeholder || "",
    options: field?.options?.join(", ") || "",
    key: field?.key || "",
  };

  const validationSchema = Yup.object().shape({
    label: Yup.string()
      .required("Field Label is required")
      .max(100, "Too long"),
    type: Yup.string().required("Field Type is required"),
    isRequired: Yup.boolean(),
    placeholder: Yup.string(),
    options: Yup.string().when("type", {
      is: "select",
      then: (schema) => schema.required("Options are required (comma separated)"),
    }),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const fieldKey = values.key || values.label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    const fieldData = {
      label: values.label,
      type: values.type,
      required: values.isRequired,
      placeholder: values.placeholder,
      key: fieldKey,
      options: values.type === "select" 
        ? values.options.split(",").map(opt => opt.trim()).filter(opt => opt !== "")
        : []
    };

    onSave && onSave(fieldData);
    setSubmitting(false);
    onClose();
  };

  const fieldTypeOptions = [
    { value: "text", label: "Text" },
    { value: "textarea", label: "Text Area" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "email", label: "Email" },
    { value: "select", label: "Select (Dropdown)" },
    { value: "checkbox", label: "Checkbox (Yes/No)" },
  ];

  return (
    <ModalLayout
      isOpen={isOpen}
      setIsOpen={onClose}
      title={isEditing ? "Edit Custom Field" : "Add Custom Field"}
    >
      <div className="w-[450px]">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, status, values, handleChange, handleBlur, errors, touched }) => (
            <Form className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Field Label</label>
                <input
                  name="label"
                  className={`border rounded-lg p-2 text-sm ${errors.label && touched.label ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g. Client Budget"
                  value={values.label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.label && touched.label && <span className="text-xs text-red-500">{errors.label}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Field Type</label>
                <select
                  name="type"
                  className={`border rounded-lg p-2 text-sm ${errors.type && touched.type ? 'border-red-500' : 'border-gray-300'}`}
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  {fieldTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.type && touched.type && <span className="text-xs text-red-500">{errors.type}</span>}
              </div>

              {values.type === "select" && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Options (comma separated)</label>
                  <input
                    name="options"
                    className={`border rounded-lg p-2 text-sm ${errors.options && touched.options ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g. Option 1, Option 2, Option 3"
                    value={values.options}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.options && touched.options && <span className="text-xs text-red-500">{errors.options}</span>}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Placeholder (Optional)</label>
                <input
                  name="placeholder"
                  className="border border-gray-300 rounded-lg p-2 text-sm"
                  placeholder="e.g. Enter amount in USD"
                  value={values.placeholder}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center">
                <Field
                  type="checkbox"
                  name="isRequired"
                  id="isRequired-checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRequired-checkbox" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Make this field mandatory
                </label>
              </div>

              <div className="flex justify-end gap-x-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </ModalLayout>
  );
};

export default ProjectFieldModal;
