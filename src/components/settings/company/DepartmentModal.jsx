import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ModalLayout from "../../shared/modal";
import { FiCheck, FiInfo } from "react-icons/fi";
import { useGetAllEmployees } from "../../../api/hooks";

const getEmployeeName = (employee) =>
  `${employee.firstName || ""} ${employee.lastName || ""}`.trim();

const DepartmentModal = ({ isOpen, onClose, department, onSave }) => {
  const isEditing = !!department;
  const { data: employeesData } = useGetAllEmployees(isOpen);
  const employees = employeesData?.employees || [];

  const initialValues = {
    name: department?.name || "",
    description: department?.description || "",
    head: department?.head?._id || department?.head || "",
    isActive: department?.isActive !== undefined ? department.isActive : true,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Department Name is required").max(100, "Too long"),
    description: Yup.string().max(255, "Too long"),
    head: Yup.string().nullable(),
    isActive: Yup.boolean(),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    onSave({
      ...values,
      head: values.head || null,
    });
    setSubmitting(false);
  };

  return (
    <ModalLayout 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="sm:max-w-md"
      title={isEditing ? "Edit Department" : "New Department"}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
          <Form className="flex flex-col mt-2">
            <div className="space-y-6">
              
              {/* Department Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 block">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="e.g., Human Resources, IT"
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${
                    errors.name && touched.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  } rounded-xl text-[13px] text-gray-800 transition-all font-medium placeholder:text-gray-400 placeholder:font-normal outline-none`}
                />
                {errors.name && touched.name && (
                  <p className="text-[11px] font-medium text-red-500 flex items-center gap-1.5 mt-1">
                    <FiInfo className="w-3.5 h-3.5" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Department Description */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 block">
                  Description
                </label>
                <Field
                  name="description"
                  as="textarea"
                  rows="3"
                  placeholder="Optional description of this department..."
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${
                    errors.description && touched.description
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  } rounded-xl text-[13px] text-gray-800 transition-all font-medium placeholder:text-gray-400 placeholder:font-normal outline-none resize-none`}
                />
                {errors.description && touched.description && (
                  <p className="text-[11px] font-medium text-red-500 flex items-center gap-1.5 mt-1">
                    <FiInfo className="w-3.5 h-3.5" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Department Head */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700 block">
                  Department Head
                </label>
                <Field
                  as="select"
                  name="head"
                  className={`w-full px-4 py-2.5 bg-gray-50 border ${
                    errors.head && touched.head
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  } rounded-xl text-[13px] text-gray-800 transition-all font-medium outline-none`}
                >
                  <option value="">Select Department Head</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name || getEmployeeName(employee)}
                    </option>
                  ))}
                </Field>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Optional. Assign the employee who leads this department.
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <div className="pt-0.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <Field
                      type="checkbox"
                      name="isActive"
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-gray-700 block cursor-pointer">
                    Active Status
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    If inactive, this department may be hidden from selection options.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="pt-5 mt-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-[13px] font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FiCheck className="w-4 h-4" />
                {isEditing ? "Save Changes" : "Create Department"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalLayout>
  );
};

export default DepartmentModal;
