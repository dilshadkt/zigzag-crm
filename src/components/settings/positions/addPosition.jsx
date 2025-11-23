import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useCreatePosition, useUpdatePosition } from "../../../api/hooks";
import { toast } from "react-toastify";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Position name is required"),
  allowedRoutes: Yup.array().of(Yup.string()),
});

const AddPosition = ({ isOpen, setShowModal, initialValues, companyId }) => {
  const { mutate: createPosition, isLoading: isCreating } =
    useCreatePosition(companyId);
  const { mutate: updatePosition, isLoading: isUpdating } =
    useUpdatePosition(companyId);

  const handleSubmit = (values, { resetForm }) => {
    const positionData = {
      ...values,
      companyId,
    };

    if (initialValues) {
      updatePosition(
        { id: initialValues._id, data: positionData },
        {
          onSuccess: () => {
            toast.success("Position updated successfully");
            handleClose(resetForm);
          },
          onError: (error) => {
            toast.error(
              error.response?.data?.message || "Error updating position"
            );
          },
        }
      );
    } else {
      createPosition(positionData, {
        onSuccess: () => {
          toast.success("Position created successfully");
          handleClose(resetForm);
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Error creating position"
          );
        },
      });
    }
  };

  const handleClose = (resetForm) => {
    resetForm();
    setShowModal(false);
  };

  if (!isOpen) return null;

  const routeOptions = [
    { value: "projects", label: "Clients", icon: "📁" },
    { value: "board", label: "Board", icon: "📋" },
    { value: "calendar", label: "Calendar", icon: "📅" },
    { value: "vacations", label: "Vacations", icon: "🏖️" },
    { value: "employees", label: "Employees", icon: "👥" },
    { value: "messenger", label: "Messenger", icon: "💬" },
    { value: "leads", label: "Leads", icon: "🎯" },
    { value: "task-on-review", label: "Task on Review", icon: "👀" },
    { value: "task-on-publish", label: "Task on Publish", icon: "☁️" },
    { value: "client-review", label: "Client Review", icon: "✅" },
    { value: "attendance", label: "Attendance", icon: "👆" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {initialValues ? "Edit Position" : "Add New Position"}
              </h2>
              <p className="text-xs text-gray-600">
                {initialValues
                  ? "Update position details and permissions"
                  : "Create a new position with specific permissions"}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleClose(() => {})}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <Formik
          initialValues={{
            name: initialValues?.name || "",
            allowedRoutes: initialValues?.allowedRoutes || [],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
          validateOnMount={true}
          initialTouched={{
            name: true,
            allowedRoutes: true,
          }}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Position Name Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Position Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Position Name *
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                      placeholder="e.g. Senior Developer, Marketing Manager"
                    />
                    {errors.name && touched.name && (
                      <p className="text-red-500 text-xs flex items-center space-x-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Access Permissions
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {values.allowedRoutes.length} selected
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> Dashboard, Board, and Settings
                        are always accessible to all users and don't need to be
                        selected here.
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Select which additional areas this position can access
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      {routeOptions.map((route) => (
                        <label
                          key={route.value}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <Field
                            type="checkbox"
                            name="allowedRoutes"
                            value={route.value}
                            checked={values.allowedRoutes.includes(route.value)}
                            onChange={(e) => {
                              const newRoutes = e.target.checked
                                ? [...values.allowedRoutes, route.value]
                                : values.allowedRoutes.filter(
                                    (r) => r !== route.value
                                  );
                              setFieldValue("allowedRoutes", newRoutes);
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all"
                          />
                          <span className="text-lg">{route.icon}</span>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                              {route.label}
                            </span>
                            <p className="text-xs text-gray-500">
                              {route.value === "projects"
                                ? "Client and project management"
                                : route.value === "board"
                                ? "Task board and workflow management"
                                : route.value === "calendar"
                                ? "Schedule and events management"
                                : route.value === "vacations"
                                ? "Time-off and vacation management"
                                : route.value === "employees"
                                ? "Employee management and profiles"
                                : route.value === "messenger"
                                ? "Internal messaging and communication"
                                : route.value === "leads"
                                ? "Lead management and CRM"
                                : route.value === "task-on-review"
                                ? "Tasks pending review and approval"
                                : route.value === "task-on-publish"
                                ? "Tasks ready for publishing"
                                : route.value === "client-review"
                                ? "Client feedback and review process"
                                : route.value === "attendance"
                                ? "Employee attendance tracking"
                                : "System access and management"}
                            </p>
                          </div>
                          {values.allowedRoutes.includes(route.value) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {values.allowedRoutes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h4 className="text-xs font-semibold text-blue-900">
                        Permission Summary
                      </h4>
                    </div>
                    <p className="text-xs text-blue-700">
                      This position will have access to{" "}
                      <strong>{values.allowedRoutes.length}</strong> area
                      {values.allowedRoutes.length !== 1 ? "s" : ""} of the
                      system.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleClose(() => {})}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isCreating ||
                      isUpdating ||
                      isSubmitting ||
                      !values.name.trim()
                    }
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isCreating || isUpdating ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>
                          {initialValues ? "Updating..." : "Creating..."}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>
                          {initialValues
                            ? "Update Position"
                            : "Create Position"}
                        </span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddPosition;
