import React, { useState, useRef } from "react";
import { useAuth } from "../../../hooks/useAuth";
import {
  useDeleteAllCompanyTasks,
  useDeleteAllCompanyProjects,
  useDeleteAllCompanyEmployees,
  useUpdateProfile,
} from "../../../api/hooks";
import { toast } from "react-hot-toast";
import Modal from "../../../components/shared/modal";
import { useDispatch } from "react-redux";
import { updateUser } from "../../../store/slice/authSlice";
import {
  FiTrash2,
  FiAlertTriangle,
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiShield,
  FiDatabase,
  FiCamera,
  FiLoader,
} from "react-icons/fi";

const Account = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const isCompanyAdmin = user?.role === "company-admin";

  // Delete mutations
  const deleteAllTasks = useDeleteAllCompanyTasks();
  const deleteAllProjects = useDeleteAllCompanyProjects();
  const deleteAllEmployees = useDeleteAllCompanyEmployees();

  // Profile update mutation
  const updateProfileMutation = useUpdateProfile((data) => {
    if (data.success) {
      dispatch(updateUser(data.employee));
      toast.success("Profile image updated successfully");
    }
  });

  // Modal states
  const [showDeleteTasksModal, setShowDeleteTasksModal] = useState(false);
  const [showDeleteProjectsModal, setShowDeleteProjectsModal] = useState(false);
  const [showDeleteEmployeesModal, setShowDeleteEmployeesModal] =
    useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      await updateProfileMutation.mutateAsync(formData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile image");
    }
  };

  // Handle delete operations
  const handleDeleteAllTasks = async () => {
    try {
      toast.loading("Deleting all tasks...", { id: "delete-tasks" });
      await deleteAllTasks.mutateAsync();
      toast.success("✅ All company tasks have been permanently deleted", {
        id: "delete-tasks",
      });
      setShowDeleteTasksModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete tasks", {
        id: "delete-tasks",
      });
    }
  };

  const handleDeleteAllProjects = async () => {
    try {
      toast.loading("Deleting all projects...", { id: "delete-projects" });
      await deleteAllProjects.mutateAsync();
      toast.success("✅ All company projects have been permanently deleted", {
        id: "delete-projects",
      });
      setShowDeleteProjectsModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete projects",
        { id: "delete-projects" }
      );
    }
  };

  const handleDeleteAllEmployees = async () => {
    try {
      toast.loading("Deleting all employees...", { id: "delete-employees" });
      await deleteAllEmployees.mutateAsync();
      toast.success("✅ All company employees have been permanently deleted", {
        id: "delete-employees",
      });
      setShowDeleteEmployeesModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete employees",
        { id: "delete-employees" }
      );
    }
  };

  // If not company admin, show restricted access message
  if (!isCompanyAdmin) {
    return (
      <div className="h-full overflow-y-auto flex flex-col">
        <div className="mb-6 px-2 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="mt-0.5 text-xs text-gray-600">
                Manage your account and company settings
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-8 rounded-3xl">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-4">
              Only company administrators can access account management
              features.
            </p>
            <p className="text-sm text-gray-500">
              Contact your company administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Header Section */}
      <div className=" pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="mt-0.5 text-xs text-gray-600">
              Manage your account and company data
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1  rounded-3xl">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Account Information */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative group">
                <div
                  className={`w-14 h-14 rounded-full overflow-hidden bg-gray-900
                    flex items-center justify-center cursor-pointer border-2 border-white shadow-sm
                    hover:brightness-75 transition-all duration-200 ${updateProfileMutation.isLoading ? 'opacity-50' : ''}`}
                  onClick={handleAvatarClick}
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-blue-100 w-full h-full flex items-center justify-center">
                      <FiUsers className="w-6 h-6 text-blue-600" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  {!updateProfileMutation.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiCamera className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Loading State */}
                  {updateProfileMutation.isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiLoader className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <h2 className=" font-semibold text-gray-900">
                  Account Information
                </h2>
                <p className="text-sm text-gray-600">
                  Your personal account details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900 text-sm">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-gray-900 text-sm">{user?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Role
                </label>
                <p className="text-gray-900 text-sm capitalize">
                  {user?.role?.replace("-", " ")}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Company
                </label>
                <p className="text-gray-900 text-sm">
                  {user?.companyName || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            className="bg-white rounded-2xl p-4 
           border border-red-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiAlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className=" font-semibold text-gray-900">Danger Zone</h2>
                <p className="text-sm text-gray-600">
                  Irreversible and destructive actions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Delete All Tasks */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiCheckSquare className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">
                      Delete All Tasks
                    </h3>
                    <p className="text-xs text-gray-600">
                      Permanently delete all tasks across all projects
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteTasksModal(true)}
                  disabled={deleteAllTasks.isLoading}
                  className="px-4 py-2 bg-red-500 text-white
                   rounded-lg hover:bg-red-600 disabled:opacity-50 
                   disabled:cursor-not-allowed transition-colors duration-200
                    text-sm font-medium"
                >
                  {deleteAllTasks.isLoading ? "Deleting..." : "Delete Tasks"}
                </button>
              </div>

              {/* Delete All Projects */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiFolder className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">
                      Delete All Projects
                    </h3>
                    <p className="text-xs text-gray-600">
                      Permanently delete all projects and their associated tasks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteProjectsModal(true)}
                  disabled={deleteAllProjects.isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                >
                  {deleteAllProjects.isLoading
                    ? "Deleting..."
                    : "Delete Projects"}
                </button>
              </div>

              {/* Delete All Employees */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">
                      Delete All Employees
                    </h3>
                    <p className="text-xs text-gray-600">
                      Permanently delete all employee accounts (except yours)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteEmployeesModal(true)}
                  disabled={deleteAllEmployees.isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                >
                  {deleteAllEmployees.isLoading
                    ? "Deleting..."
                    : "Delete Employees"}
                </button>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-yellow-800 mb-1">
                    Important Warning
                  </h4>
                  <p className="text-xs text-yellow-700">
                    These actions are irreversible and will permanently delete
                    all associated data. Please ensure you have proper backups
                    before proceeding. These operations cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          {/* <div className="bg-gray-50 rounded-2xl p-6 
           border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FiDatabase className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  System Information
                </h2>
                <p className="text-sm text-gray-600">
                  Current system status and data
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  Active
                </div>
                <div className="text-sm text-gray-600">System Status</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  Secure
                </div>
                <div className="text-sm text-gray-600">Data Protection</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Availability</div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Delete Tasks Confirmation Modal */}
      <Modal
        isOpen={showDeleteTasksModal}
        onClose={() => setShowDeleteTasksModal(false)}
        title="Delete All Company Tasks"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <FiAlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">
                Warning: Irreversible Action
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete ALL tasks across all projects in
                your company.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">This action will:</h4>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Delete all tasks from all projects</li>
              <li>Remove all task assignments</li>
              <li>Delete all task attachments and comments</li>
              <li>Clear all task history and logs</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDeleteTasksModal(false)}
              className="px-6 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={deleteAllTasks.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllTasks}
              disabled={deleteAllTasks.isLoading}
              className="px-6 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {deleteAllTasks.isLoading ? "Deleting..." : "Delete All Tasks"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Projects Confirmation Modal */}
      <Modal
        isOpen={showDeleteProjectsModal}
        onClose={() => setShowDeleteProjectsModal(false)}
        title="Delete All Company Projects"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <FiAlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">
                Warning: Irreversible Action
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete ALL projects and their associated
                tasks in your company.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">This action will:</h4>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Delete all projects</li>
              <li>Delete all tasks within those projects</li>
              <li>Remove all project team assignments</li>
              <li>Delete all project files and attachments</li>
              <li>Clear all project history and analytics</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDeleteProjectsModal(false)}
              className="px-6 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={deleteAllProjects.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllProjects}
              disabled={deleteAllProjects.isLoading}
              className="px-6 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {deleteAllProjects.isLoading
                ? "Deleting..."
                : "Delete All Projects"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Employees Confirmation Modal */}
      <Modal
        isOpen={showDeleteEmployeesModal}
        onClose={() => setShowDeleteEmployeesModal(false)}
        title="Delete All Company Employees"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <FiAlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">
                Warning: Irreversible Action
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete ALL employee accounts in your
                company (except yours).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">This action will:</h4>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Delete all employee accounts (except yours)</li>
              <li>Remove all employee project assignments</li>
              <li>Unassign all tasks from employees</li>
              <li>Delete all employee profiles and data</li>
              <li>Clear all employee activity history</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDeleteEmployeesModal(false)}
              className="px-6 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={deleteAllEmployees.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllEmployees}
              disabled={deleteAllEmployees.isLoading}
              className="px-6 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {deleteAllEmployees.isLoading
                ? "Deleting..."
                : "Delete All Employees"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Account;
