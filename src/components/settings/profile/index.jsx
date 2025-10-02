import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Input from "../../shared/Field/input";
import DatePicker from "../../shared/Field/date";
import Select from "../../shared/Field/select";
import PrimaryButton from "../../shared/buttons/primaryButton";
import Progress from "../../shared/progress";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAuth } from "../../../hooks/useAuth";
import {
  useGetPositions,
  useUpdateProfile,
  useDeleteEmployee,
} from "../../../api/hooks";
import { loginSuccess } from "../../../store/slice/authSlice";
import { toast } from "react-hot-toast";

const UserProfile = ({ user, disableEdit, employeeId }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user: currentUser } = useAuth();
  const companyId = currentUser?.company;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if we're on the employee details page and user is admin
  const isEmployeePage = location.pathname.includes("/employees/");
  const isAdmin = currentUser?.role === "company-admin";
  const isOwnProfile =
    currentUser?._id === employeeId || currentUser?._id === user?._id;
  const showDeleteButton = isEmployeePage && isAdmin && !isOwnProfile;

  // Determine which employeeId to use for updates
  const targetEmployeeId = isOwnProfile ? null : employeeId;

  // Fetch company positions for dropdown
  const { data: positionsData, isLoading: positionsLoading } =
    useGetPositions(companyId);
  const positions = positionsData?.positions || [];

  // Format positions for dropdown
  const positionOptions = positions.map((position) => ({
    value: position.name,
    label: position.name,
  }));

  // Delete employee mutation
  const deleteEmployeeMutation = useDeleteEmployee();

  // Initial form values from the user object
  const initialValues = {
    position: user?.position || "",
    company: user?.company || "",
    location: user?.location || "",
    birthday: user?.dob || null,
    email: user?.email || "",
    mobile: user?.phoneNumber || "",
    skype: user?.skype || "",
  };

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format"),
    mobile: Yup.string().matches(
      /^[+]?[\d\s\-()]+$/,
      "Invalid phone number format"
    ),
  });

  // Handle successful profile update
  const handleUpdateSuccess = (updatedData) => {
    setIsEditMode(false);
    toast.success("Profile updated successfully!");

    // If this is the current user's profile, update Redux state
    if (isOwnProfile && updatedData?.employee) {
      dispatch(
        loginSuccess({
          user: updatedData.employee,
          companyId: updatedData.employee.company,
          isProfileComplete: updatedData.employee.isProfileComplete,
        })
      );
    }
  };

  // Handle successful employee deletion
  const handleDeleteSuccess = () => {
    toast.success("Employee deleted successfully!");
    navigate("/employees"); // Redirect to employees list
  };

  // Update profile mutation - pass employeeId if updating another employee
  const updateProfileMutation = useUpdateProfile(
    handleUpdateSuccess,
    targetEmployeeId
  );

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true, // This will reinitialize the form when initialValues change
    onSubmit: async (values) => {
      try {
        const updateData = {
          position: values.position,
          location: values.location,
          dob: values.birthday,
          phoneNumber: values.mobile,
          skype: values.skype,
          email: values.email,
        };

        await updateProfileMutation.mutateAsync(updateData);
      } catch (error) {
        toast.error("Failed to update profile. Please try again.");
        console.error("Profile update error:", error);
      }
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      resetForm({
        values: {
          position: user?.position || "",
          company: user?.company || "",
          location: user?.location || "",
          birthday: user?.dob || null,
          email: user?.email || "",
          mobile: user?.phoneNumber || "",
          skype: user?.skype || "",
        },
      });
    }
  }, [user, resetForm]);

  // Handle position change
  const handlePositionChange = (e) => {
    setFieldValue("position", e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setFieldValue("birthday", e.target.value);
  };

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    try {
      await deleteEmployeeMutation.mutateAsync(employeeId);
      handleDeleteSuccess();
    } catch (error) {
      toast.error("Failed to delete employee. Please try again.");
      console.error("Delete employee error:", error);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className=" w-full md:w-[250px] bg-white md:overflow-hidden
       pb-4 h-fit md:h-full text-[#0A1629]
rounded-3xl  flex flex-col "
    >
      <div className="flex flex-col border-b border-[#E4E6E8] p-5">
        <div className="flex justify-between">
          <div className="relative">
            <Progress size={54} currentValue={75} />
            <img
              src={user?.profileImage}
              alt=""
              className="absolute top-0 left-0 right-0
              scale-85 bottom-0 w-full h-full  object-cover rounded-full"
            />
          </div>
          <div className="flex gap-2">
            <PrimaryButton
              disable={disableEdit}
              onclick={() => setIsEditMode(!isEditMode)}
              icon={"/icons/edit.svg"}
              className={`${isEditMode ? `bg-[#3F8CFF]` : `bg-[#F4F9FD]`}`}
            />
            {showDeleteButton && (
              <button
                onClick={() =>
                  !deleteEmployeeMutation.isLoading &&
                  setShowDeleteConfirm(true)
                }
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  deleteEmployeeMutation.isLoading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95"
                } shadow-sm`}
                disabled={deleteEmployeeMutation.isLoading}
                title="Delete Employee"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <h4 className="text-lg font-medium mt-2">{user?.firstName}</h4>
        <span className="text-xs text-gray-600  capitalize">
          {user?.position}
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex h-full flex-col px-5 py-4 md:overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col gap-y-3">
          <h4 className=" font-medium">Main info</h4>

          {/* Position Field - Dropdown when editing, Input when readonly */}
          {isEditMode ? (
            <Select
              title="Position"
              name="position"
              value={values.position}
              onChange={handlePositionChange}
              options={positionOptions}
              placeholder="Select Position"
              errors={errors}
              touched={touched}
              disabled={positionsLoading}
            />
          ) : (
            <Input
              readOnly={true}
              name="position"
              value={values}
              title="Position"
              placeholder="UI/UX Designer"
            />
          )}

          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"company"}
            value={values}
            readOnly={!isEditMode}
            title="Company"
            placeholder="Cadabra"
          />
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"location"}
            value={values}
            readOnly={!isEditMode}
            title="Location"
            placeholder="NYC, New York, USA"
          />
          <DatePicker
            errors={errors}
            touched={touched}
            onChange={handleDateChange}
            name={"birthday"}
            value={values.birthday}
            readOnly={!isEditMode}
            title="Birthday Date"
          />
        </div>
        <div className="flex flex-col gap-y-3 mt-7">
          <h4 className=" font-medium">Contact Info</h4>
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"email"}
            value={values}
            readOnly={!isEditMode}
            title="Email"
            placeholder="evanyates@gmail.com"
          />
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"mobile"}
            value={values}
            readOnly={!isEditMode}
            title="Mobile Number"
            placeholder="+1 675 346 23-10"
          />
          <Input
            errors={errors}
            touched={touched}
            onchange={handleChange}
            name={"skype"}
            value={values}
            readOnly={!isEditMode}
            title="Skype"
            placeholder="Evan 2256"
          />
        </div>

        {/* Save Button - Only show when in edit mode */}
        {isEditMode && (
          <div className="mt-6 pt-4 border-t border-[#E4E6E8]">
            <PrimaryButton
              type="submit"
              title={
                updateProfileMutation.isLoading ? "Saving..." : "Save Changes"
              }
              className="w-full bg-[#3F8CFF] text-white py-2 px-4 rounded-lg"
              disable={updateProfileMutation.isLoading}
            />
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Employee
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this employee? This action will:
            </p>
            <ul className="text-sm text-gray-600 mb-6 list-disc list-inside">
              <li>Remove them from all projects</li>
              <li>Unassign all their tasks</li>
              <li>Permanently delete their account</li>
            </ul>
            <p className="text-red-600 text-sm font-medium mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={deleteEmployeeMutation.isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                disabled={deleteEmployeeMutation.isLoading}
              >
                {deleteEmployeeMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
