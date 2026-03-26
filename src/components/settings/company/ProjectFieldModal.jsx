import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ModalLayout from "../../shared/modal";
import { FiX, FiCheck, FiInfo, FiHash, FiType, FiList, FiCalendar, FiCheckSquare, FiUpload, FiLink, FiMail } from "react-icons/fi";

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
    { value: "text", label: "Text", icon: <FiType /> },
    { value: "textarea", label: "Text Area", icon: <FiType /> },
    { value: "number", label: "Number", icon: <FiHash /> },
    { value: "date", label: "Date", icon: <FiCalendar /> },
    { value: "email", label: "Email", icon: <FiMail /> },
    { value: "select", label: "Select (Dropdown)", icon: <FiList /> },
    { value: "checkbox", label: "Checkbox (Yes/No)", icon: <FiCheckSquare /> },
    { value: "dynamic_list", label: "Dynamic List", icon: <FiSettings /> },
    { value: "file", label: "File Upload", icon: <FiUpload /> },
    { value: "image", label: "Image Upload", icon: <FiUpload /> },
    { value: "url", label: "URL/Link", icon: <FiLink /> },
  ];

  return (
    <ModalLayout
      isOpen={isOpen}
      setIsOpen={onClose}
      title={isEditing ? "Edit Custom Field" : "Create New Custom Field"}
    >
      <div className="w-[480px]">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, handleChange, handleBlur, errors, touched }) => (
            <Form className="flex flex-col gap-4">
              <div className="space-y-4">
                {/* Field Label */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
                    Field Label
                  </label>
                  <div className="relative">
                    <input
                      name="label"
                      className={`w-full bg-gray-50 border rounded-xl py-2 px-3 text-[13px] font-medium transition-all duration-200 outline-none
                        ${errors.label && touched.label 
                          ? 'border-red-200 focus:border-red-400 ring-2 ring-red-500/5' 
                          : 'border-gray-100 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5'}`}
                      placeholder="e.g. Project Code, Client Budget, SKU"
                      value={values.label}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {errors.label && touched.label && (
                    <span className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.label}</span>
                  )}
                </div>

                {/* Field Type & Required Toggle */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
                      Data Type
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        className={`w-full bg-gray-50 border rounded-xl py-2 px-3 text-[13px] font-medium appearance-none cursor-pointer outline-none transition-all duration-200
                          ${errors.type && touched.type 
                            ? 'border-red-200 focus:border-red-400' 
                            : 'border-gray-100 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5'}`}
                        value={values.type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        {fieldTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <FiList className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
                      Input Requirement
                    </label>
                    <label className="flex items-center group cursor-pointer h-10 px-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all duration-200">
                      <div className="relative flex items-center">
                        <Field
                          type="checkbox"
                          name="isRequired"
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                          <FiCheck className="text-white w-3 h-3 translate-y-px opacity-0 peer-checked:opacity-100" />
                        </div>
                        <span className="ml-2.5 text-[12px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                          Set as Mandatory
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Options for Select */}
                {values.type === "select" && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
                      Dropdown Options (Comma Separated)
                    </label>
                    <textarea
                      name="options"
                      rows={2}
                      className={`w-full bg-gray-50 border rounded-xl py-2 px-3 text-[13px] font-medium transition-all duration-200 outline-none
                        ${errors.options && touched.options 
                          ? 'border-red-200 focus:border-red-400' 
                          : 'border-gray-100 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5'}`}
                      placeholder="e.g. Highly Important, Medium, Low Priority"
                      value={values.options}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <div className="flex items-center gap-1.5 ml-1 opacity-60">
                      <FiInfo className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-medium text-gray-500 italic">Separate each option with a comma</span>
                    </div>
                    {errors.options && touched.options && (
                      <span className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.options}</span>
                    )}
                  </div>
                )}

                {/* Placeholder */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">
                    Input Hint / Placeholder
                  </label>
                  <input
                    name="placeholder"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[13px] font-medium transition-all duration-200 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                    placeholder="e.g. Choice of color... or Default value"
                    value={values.placeholder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-5 border-t border-gray-50 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[12px] font-bold text-gray-500 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-[12px] font-bold text-white bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Field"}
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
