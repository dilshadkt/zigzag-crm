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

  console.log(initialValues);

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

  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 bg-[#2155A3]/15 py-3 px-3 z-50 flexEnd">
      <div className="w-[400px] bg-white rounded-3xl flex flex-col py-7 h-full">
        <div className="flexBetween px-7 border-b border-[#E4E6E8]/80 pb-4">
          <h4 className="text-lg font-medium text-gray-800">
            {initialValues ? "Edit Position" : "Add New Position"}
          </h4>
          <PrimaryButton
            icon={"/icons/cancel.svg"}
            className={"bg-[#F4F9FD] hover:bg-gray-100 transition-colors"}
            onclick={() => handleClose(() => {})}
          />
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
            <Form className="flex flex-col flex-1">
              <div className="px-7 py-5 border-b border-[#E4E6E8]/80">
                <h5 className="text-sm font-medium text-[#7D8592] mb-4">
                  Position Details
                </h5>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Position Name
                  </label>
                  <Field
                    type="text"
                    name="name"
                    className="appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter position name"
                  />
                  {errors.name && touched.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="px-7 py-5 border-b border-[#E4E6E8]/80 flex-1 overflow-y-auto">
                <h5 className="text-sm font-medium text-[#7D8592] mb-4">
                  Allowed Routes
                </h5>
                <div className="flex flex-col gap-y-3">
                  {[
                    "/",
                    "/projects",
                    "/tasks",
                    "/team",
                    "/reports",
                    "/settings",
                    "/calender",
                    "/vacations",
                  ].map((route) => (
                    <label
                      key={route}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <Field
                        type="checkbox"
                        name="allowedRoutes"
                        value={route}
                        checked={values.allowedRoutes.includes(route)}
                        onChange={(e) => {
                          const newRoutes = e.target.checked
                            ? [...values.allowedRoutes, route]
                            : values.allowedRoutes.filter((r) => r !== route);
                          setFieldValue("allowedRoutes", newRoutes);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200"
                      />
                      <span className="text-gray-700 text-sm font-medium group-hover:text-blue-600 transition-colors">
                        {route === "/"
                          ? "Dashboard"
                          : route.slice(1).charAt(0).toUpperCase() +
                            route.slice(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-7 py-5 mt-auto">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleClose(() => {})}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating || isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                  >
                    {isCreating || isUpdating ? (
                      <span className="flex items-center justify-center">
                        <img
                          src="/icons/loading.svg"
                          alt="Loading"
                          className="w-5 h-5 mr-2"
                        />
                        {initialValues ? "Updating..." : "Creating..."}
                      </span>
                    ) : initialValues ? (
                      "Update Position"
                    ) : (
                      "Create Position"
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
