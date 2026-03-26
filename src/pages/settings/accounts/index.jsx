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

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

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

  if (!isCompanyAdmin) {
    return (
      <div className="h-full overflow-y-auto flex flex-col pr-1">
        <div className="pb-3 px-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-[17px] font-bold text-gray-800">
                Account Settings
              </h1>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Manage your account and company settings
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-inner">
              <FiShield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-4 text-[13px]">
              Only company administrators can access account management
              features.
            </p>
            <p className="text-[12px] text-gray-400">
              Contact your company administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col pr-1">
      {/* Header Section */}
      <div className="pb-3 px-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-[17px] font-bold text-gray-800">
              Account Settings
            </h1>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Manage your profile and company data
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 space-y-4">
        {/* Account Information */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative group">
              <div
                className={`w-12 h-12 rounded-full overflow-hidden bg-gray-900
                  flex items-center justify-center cursor-pointer border-2 border-white shadow-sm
                  hover:brightness-75 transition-all duration-200 ${
                    updateProfileMutation.isLoading ? "opacity-50" : ""
                  }`}
                onClick={handleAvatarClick}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-blue-50 w-full h-full flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-blue-500" />
                  </div>
                )}

                {!updateProfileMutation.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCamera className="w-4 h-4 text-white" />
                  </div>
                )}

                {updateProfileMutation.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiLoader className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-[15px] font-bold text-gray-800">
                Profile Details
              </h2>
              <p className="text-[12px] text-gray-500">
                Update your identity on the platform
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Full Name
              </label>
              <p className="text-gray-800 text-[13px] font-medium leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Email Address
              </label>
              <p className="text-gray-800 text-[13px] font-medium leading-tight">{user?.email}</p>
            </div>
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Account Role
              </label>
              <p className="text-gray-800 text-[13px] font-medium leading-tight capitalize">
                {user?.role?.replace("-", " ")}
              </p>
            </div>
            <div className="space-y-0.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Organization
              </label>
              <p className="text-gray-800 text-[13px] font-medium leading-tight">
                {user?.companyName || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-4 border border-red-50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-red-100 opacity-50" />
          
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-800">Management & Danger Zone</h2>
              <p className="text-[12px] text-gray-500">
                Highly sensitive administrative actions
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <FiCheckSquare className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-gray-800">
                    Clear Workspace Tasks
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Permanently delete all tasks in the company
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteTasksModal(true)}
                disabled={deleteAllTasks.isLoading}
                className="px-3.5 py-1.5 bg-white text-red-500 hover:bg-red-50 border border-red-100 rounded-lg disabled:opacity-50 transition-all text-[12px] font-bold"
              >
                {deleteAllTasks.isLoading ? "..." : "Delete All"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <FiFolder className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-gray-800">
                    Purge All Projects
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Erase all projects and their data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteProjectsModal(true)}
                disabled={deleteAllProjects.isLoading}
                className="px-3.5 py-1.5 bg-white text-red-500 hover:bg-red-50 border border-red-100 rounded-lg disabled:opacity-50 transition-all text-[12px] font-bold"
              >
                {deleteAllProjects.isLoading ? "..." : "Delete All"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-gray-800">
                    Reset User Base
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Delete all employee accounts except your own
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteEmployeesModal(true)}
                disabled={deleteAllEmployees.isLoading}
                className="px-3.5 py-1.5 bg-white text-red-500 hover:bg-red-50 border border-red-100 rounded-lg disabled:opacity-50 transition-all text-[12px] font-bold"
              >
                {deleteAllEmployees.isLoading ? "..." : "Delete All"}
              </button>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-orange-50/50 rounded-xl border border-orange-100">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5" />
              <div>
                <h4 className="font-bold text-[12px] text-orange-800 mb-0.5">
                  Critical Warning
                </h4>
                <p className="text-[11px] text-orange-700 leading-relaxed max-w-2xl">
                  Actions in this area are permanent and cannot be reversed. 
                  Please double-check all requirements before identifying accounts or data for removal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <Modal
        isOpen={showDeleteTasksModal}
        onClose={() => setShowDeleteTasksModal(false)}
        title="Clear Workplace Tasks"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-[14px] text-red-800">
                Are you absolutely sure?
              </h3>
              <p className="text-[11px] text-red-600">
                This will permanently remove all task records for your company.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[12px] text-gray-800">Summary of data removal:</h4>
            <ul className="text-[11px] text-gray-500 space-y-1 list-disc list-inside px-1">
              <li>All project tasks and subtasks</li>
              <li>Task assignments and histories</li>
              <li>Any attachments or comments tied to tasks</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowDeleteTasksModal(false)}
              className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[12px] font-bold"
              disabled={deleteAllTasks.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllTasks}
              disabled={deleteAllTasks.isLoading}
              className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-[12px] font-bold disabled:opacity-50"
            >
              System Purge
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteProjectsModal}
        onClose={() => setShowDeleteProjectsModal(false)}
        title="Purge All Projects"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-[14px] text-red-800">
                Permanent Data Loss Warning
              </h3>
              <p className="text-[11px] text-red-600">
                All projects and their nested tasks will be completely erased.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[12px] text-gray-800">Data covered by this action:</h4>
            <ul className="text-[11px] text-gray-500 space-y-1 list-disc list-inside px-1">
              <li>Project definitions and settings</li>
              <li>Linked tasks and resources</li>
              <li>Analytics and milestones</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowDeleteProjectsModal(false)}
              className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[12px] font-bold"
              disabled={deleteAllProjects.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllProjects}
              disabled={deleteAllProjects.isLoading}
              className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-[12px] font-bold disabled:opacity-50"
            >
              Confirm Purge
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteEmployeesModal}
        onClose={() => setShowDeleteEmployeesModal(false)}
        title="Reset User Base"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
            <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-[14px] text-red-800">
                Account Termination Warning
              </h3>
              <p className="text-[11px] text-red-600">
                All employee access will be revoked and accounts deleted.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[12px] text-gray-800">Results of this action:</h4>
            <ul className="text-[11px] text-gray-500 space-y-1 list-disc list-inside px-1">
              <li>All secondary employee accounts removed</li>
              <li>Revocation of all workspace access</li>
              <li>Unlinking of all personal user data</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowDeleteEmployeesModal(false)}
              className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-[12px] font-bold"
              disabled={deleteAllEmployees.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllEmployees}
              disabled={deleteAllEmployees.isLoading}
              className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-[12px] font-bold disabled:opacity-50"
            >
              Reset Users
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Account;
