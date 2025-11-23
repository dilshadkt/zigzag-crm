import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiLock,
  FiSmartphone,
  FiActivity,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { MdSecurity, MdHistory, MdDevices, MdEdit } from "react-icons/md";
import { AiOutlineSafety } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { useGetPositions, useUpdatePermissions } from "../../../api/hooks";
import { verifyCurrentPassword, changePassword } from "../../../api/service";

// Permission definitions organized by category
const PERMISSION_CATEGORIES = {
  tasks: {
    label: "Task Management",
    icon: "📋",
    permissions: [
      {
        key: "create",
        label: "Create Task",
        description: "Can create new tasks",
      },
      {
        key: "edit",
        label: "Edit Task",
        description: "Can edit existing tasks",
      },
      { key: "delete", label: "Delete Task", description: "Can delete tasks" },
      { key: "view", label: "View Task", description: "Can view task details" },
      {
        key: "assign",
        label: "Assign Task",
        description: "Can assign tasks to team members",
      },
      {
        key: "changeStatus",
        label: "Change Status",
        description: "Can change task status",
      },
    ],
  },
  projects: {
    label: "Project Management",
    icon: "📁",
    permissions: [
      {
        key: "create",
        label: "Create Project",
        description: "Can create new projects",
      },
      {
        key: "edit",
        label: "Edit Project",
        description: "Can edit project details",
      },
      {
        key: "delete",
        label: "Delete Project",
        description: "Can delete projects",
      },
      {
        key: "view",
        label: "View Project",
        description: "Can view project details",
      },
      {
        key: "manageTeam",
        label: "Manage Team",
        description: "Can add/remove team members",
      },
    ],
  },
  employees: {
    label: "Employee Management",
    icon: "👥",
    permissions: [
      {
        key: "create",
        label: "Add Employee",
        description: "Can add new employees",
      },
      {
        key: "edit",
        label: "Edit Employee",
        description: "Can edit employee details",
      },
      {
        key: "delete",
        label: "Remove Employee",
        description: "Can remove employees",
      },
      {
        key: "view",
        label: "View Employee",
        description: "Can view employee details",
      },
      {
        key: "viewSalary",
        label: "View Salary",
        description: "Can view employee salary",
      },
    ],
  },
  vacations: {
    label: "Vacation Management",
    icon: "🏖️",
    permissions: [
      {
        key: "approve",
        label: "Approve Vacation",
        description: "Can approve vacation requests",
      },
      {
        key: "reject",
        label: "Reject Vacation",
        description: "Can reject vacation requests",
      },
      {
        key: "view",
        label: "View Vacations",
        description: "Can view all vacation requests",
      },
      {
        key: "create",
        label: "Create Vacation",
        description: "Can create vacation requests",
      },
    ],
  },
  attendance: {
    label: "Attendance Management",
    icon: "👆",
    permissions: [
      {
        key: "view",
        label: "View Attendance",
        description: "Can view attendance records",
      },
      {
        key: "edit",
        label: "Edit Attendance",
        description: "Can edit attendance records",
      },
      {
        key: "approve",
        label: "Approve Attendance",
        description: "Can approve attendance",
      },
      {
        key: "export",
        label: "Export Attendance",
        description: "Can export attendance reports",
      },
    ],
  },
  leads: {
    label: "Lead Management",
    icon: "🎯",
    permissions: [
      {
        key: "create",
        label: "Create Lead",
        description: "Can create new leads",
      },
      {
        key: "edit",
        label: "Edit Lead",
        description: "Can edit existing leads",
      },
      {
        key: "delete",
        label: "Delete Lead",
        description: "Can delete leads",
      },
      {
        key: "view",
        label: "View Lead",
        description: "Can view lead details",
      },
      {
        key: "assign",
        label: "Assign Lead",
        description: "Can assign leads to team members",
      },
      {
        key: "changeStatus",
        label: "Change Status",
        description: "Can change lead status",
      },
    ],
  },
  settings: {
    label: "Settings & Configuration",
    icon: "⚙️",
    permissions: [
      {
        key: "manageRoles",
        label: "Manage Roles",
        description: "Can manage roles and permissions",
      },
      {
        key: "manageCompany",
        label: "Manage Company",
        description: "Can manage company settings",
      },
      {
        key: "viewSettings",
        label: "View Settings",
        description: "Can view settings",
      },
    ],
  },
};

// Role Permission Editor Component
const RolePermissionEditor = ({ role, onUpdate, onClose, companyId }) => {
  const [permissions, setPermissions] = useState(role.permissions || {});
  const { mutate: updatePermissions, isLoading: isSaving } =
    useUpdatePermissions(companyId);

  // Initialize permissions from role
  useEffect(() => {
    setPermissions(role.permissions || {});
  }, [role]);

  const handlePermissionToggle = (category, permissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [permissionKey]: !prev[category]?.[permissionKey],
      },
    }));
  };

  const handleAdminDashboardToggle = () => {
    setPermissions((prev) => ({
      ...prev,
      accessAdminDashboard: !prev.accessAdminDashboard,
    }));
  };

  const handleSelectAll = (category) => {
    const allPermissions = {};
    PERMISSION_CATEGORIES[category].permissions.forEach((perm) => {
      allPermissions[perm.key] = true;
    });
    setPermissions((prev) => ({
      ...prev,
      [category]: allPermissions,
    }));
  };

  const handleDeselectAll = (category) => {
    const allPermissions = {};
    PERMISSION_CATEGORIES[category].permissions.forEach((perm) => {
      allPermissions[perm.key] = false;
    });
    setPermissions((prev) => ({
      ...prev,
      [category]: allPermissions,
    }));
  };

  const handleSave = async () => {
    updatePermissions(
      {
        positionId: role._id,
        permissions: permissions,
      },
      {
        onSuccess: (data) => {
          toast.success(`Permissions updated for ${role.name}`);
          onUpdate({ ...role, permissions });
          onClose();
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Failed to update permissions"
          );
        },
      }
    );
  };

  const countActivePermissions = (category) => {
    const categoryPerms = permissions[category] || {};
    return Object.values(categoryPerms).filter(Boolean).length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FiUsers className="text-lg text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Edit Permissions
              </h2>
              <p className="text-xs text-gray-600">
                Managing permissions for{" "}
                <span className="font-semibold">{role.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Admin Dashboard Access Section */}
            <div className="border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                    <FiShield className="text-lg text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Admin Dashboard Access
                    </h3>
                    <p className="text-[10px] text-gray-600">
                      Grant access to the admin dashboard and administrative
                      features
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.accessAdminDashboard || false}
                    onChange={handleAdminDashboardToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {Object.entries(PERMISSION_CATEGORIES).map(
              ([
                category,
                { label, icon, permissions: categoryPermissions },
              ]) => (
                <div
                  key={category}
                  className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">
                          {label}
                        </h3>
                        <p className="text-[10px] text-gray-500">
                          {countActivePermissions(category)} of{" "}
                          {categoryPermissions.length} enabled
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSelectAll(category)}
                        className="px-2 py-1 text-[10px] font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => handleDeselectAll(category)}
                        className="px-2 py-1 text-[10px] font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryPermissions.map((perm) => {
                      const isChecked =
                        permissions[category]?.[perm.key] || false;
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                            isChecked
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handlePermissionToggle(category, perm.key)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs text-gray-800">
                                {perm.label}
                              </span>
                              {isChecked && (
                                <FiCheck className="text-blue-600 text-xs" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {perm.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Total permissions enabled:{" "}
              <span className="font-semibold">
                {Object.entries(permissions).reduce((acc, [key, value]) => {
                  if (key === "accessAdminDashboard") {
                    return acc + (value ? 1 : 0);
                  }
                  return acc + Object.values(value).filter(Boolean).length;
                }, 0)}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Security Settings Component
const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleEditor, setShowRoleEditor] = useState(false);

  const { user } = useAuth();
  const companyId = user?.company;
  const { data: positionsData, isLoading: isLoadingPositions } =
    useGetPositions(companyId);
  const positions = positionsData?.positions || [];

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);

    try {
      // First verify current password
      const verifyResult = await verifyCurrentPassword({ currentPassword });
      if (!verifyResult.success) {
        toast.error(verifyResult.message || "Current password is incorrect");
        setIsChangingPassword(false);
        return;
      }

      // If current password is correct, proceed with password change
      const changeResult = await changePassword({
        currentPassword,
        newPassword,
      });

      if (changeResult.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(changeResult.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(
      twoFactorEnabled
        ? "Two-factor authentication disabled"
        : "Two-factor authentication enabled"
    );
  };

  const handleEditRole = (role) => {
    // Check if role is admin - admins can't edit permissions
    const isAdminRole =
      role.name.toLowerCase().includes("admin") ||
      role.name.toLowerCase() === "company-admin";

    if (isAdminRole) {
      toast.info(
        "Admin roles have full access by default and cannot be edited"
      );
      return;
    }

    setSelectedRole(role);
    setShowRoleEditor(true);
  };

  const handleUpdateRole = (updatedRole) => {
    // Handle role update - replace with actual API call
    toast.success("Role permissions updated successfully");
  };

  const getPermissionCount = (role) => {
    if (!role.permissions) return 0;
    return Object.entries(role.permissions).reduce((acc, [key, value]) => {
      if (key === "accessAdminDashboard") {
        return acc + (value ? 1 : 0);
      }
      return acc + Object.values(value).filter(Boolean).length;
    }, 0);
  };

  const hasAdminDashboardAccess = (role) => {
    return role.permissions?.accessAdminDashboard || false;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-50 rounded-lg">
            <AiOutlineSafety className="text-lg text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Security Settings
            </h2>
            <p className="text-xs text-gray-500">
              Manage your account security and role permissions
            </p>
          </div>
        </div>

        {/* Role-Based Permissions */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <FiUsers className="text-lg text-gray-700" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800">
                Role-Based Permissions
              </h3>
              <p className="text-xs text-gray-500">
                Configure what each role can do in the system
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-blue-600 mt-0.5 text-sm" />
              <div className="flex-1">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Admin roles (Company Admin, etc.) have
                  full access to all system features by default. Their
                  permissions cannot be modified to ensure system security and
                  prevent lockout.
                </p>
              </div>
            </div>
          </div>

          {isLoadingPositions ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 text-xs mt-2">Loading roles...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="text-xs">
                No roles found. Create roles in the Company settings.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((role) => {
                const isAdminRole =
                  role.name.toLowerCase().includes("admin") ||
                  role.name.toLowerCase() === "company-admin";

                return (
                  <div
                    key={role._id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isAdminRole
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`p-3 bg-gradient-to-br rounded-lg ${
                          isAdminRole
                            ? "from-yellow-100 to-orange-100"
                            : "from-blue-100 to-indigo-100"
                        }`}
                      >
                        <FiShield
                          className={`text-lg ${
                            isAdminRole ? "text-yellow-600" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-800">
                            {role.name}
                          </h4>
                          {isAdminRole && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-medium rounded-full">
                              Admin - Full Access
                            </span>
                          )}
                          {role.isActive ? (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {isAdminRole ? (
                            <>
                              <span className="font-medium text-yellow-700">
                                All permissions enabled by default
                              </span>
                              {" • "}Full system access
                            </>
                          ) : (
                            <>
                              {getPermissionCount(role)} permissions enabled •
                              Access to {role.allowedRoutes?.length || 0}{" "}
                              modules
                              {hasAdminDashboardAccess(role) && (
                                <>
                                  {" • "}
                                  <span className="font-medium text-purple-600">
                                    Admin Dashboard Access
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {isAdminRole ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-700 border border-yellow-300 rounded-lg bg-yellow-50">
                        <FiLock className="text-xs" />
                        <span>Protected</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditRole(role)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <MdEdit className="text-xs" />
                        Edit Permissions
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <FiLock className="text-lg text-gray-700" />
            <h3 className="text-sm font-semibold text-gray-800">
              Change Password
            </h3>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <FiEyeOff className="text-xs" />
                  ) : (
                    <FiEye className="text-xs" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <FiEyeOff className="text-xs" />
                  ) : (
                    <FiEye className="text-xs" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-xs" />
                  ) : (
                    <FiEye className="text-xs" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiSmartphone className="text-lg text-gray-700" />
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={handleToggle2FA}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FiShield className="text-lg text-blue-600 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Security Recommendations
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Use a strong, unique password for your account
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Enable two-factor authentication for extra security
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Configure role permissions to follow least privilege principle
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Regularly review and update role permissions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Role Permission Editor Modal */}
      {showRoleEditor && selectedRole && (
        <RolePermissionEditor
          role={selectedRole}
          companyId={companyId}
          onUpdate={handleUpdateRole}
          onClose={() => {
            setShowRoleEditor(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
};

export default SecuritySettings;
