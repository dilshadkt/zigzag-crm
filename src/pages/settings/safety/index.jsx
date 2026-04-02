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
  FiCheckSquare,
  FiFolder,
  FiMap,
  FiClock,
  FiTarget,
  FiSettings,
} from "react-icons/fi";
import { MdSecurity, MdHistory, MdDevices, MdEdit } from "react-icons/md";
import { AiOutlineSafety } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { useGetPositions, useUpdatePermissions } from "../../../api/hooks";
import { verifyCurrentPassword, changePassword } from "../../../api/service";
import ModalLayout from "../../../components/shared/modal";

// Permission definitions organized by category
const PERMISSION_CATEGORIES = {
  tasks: {
    label: "Task Management",
    icon: <FiCheckSquare />,
    permissions: [
      { key: "create", label: "Create Task", description: "Can create new tasks" },
      { key: "edit", label: "Edit Task", description: "Can edit existing tasks" },
      { key: "delete", label: "Delete Task", description: "Can delete tasks" },
      { key: "view", label: "View Task", description: "Can view task details" },
      { key: "viewAll", label: "View All Tasks", description: "Can view all company tasks" },
      { key: "assign", label: "Assign Task", description: "Can assign tasks to team members" },
      { key: "changeStatus", label: "Change Status", description: "Can change task status" },
    ],
  },
  projects: {
    label: "Project Management",
    icon: <FiFolder />,
    permissions: [
      { key: "create", label: "Create Project", description: "Can create new projects" },
      { key: "edit", label: "Edit Project", description: "Can edit project details" },
      { key: "delete", label: "Delete Project", description: "Can delete projects" },
      { key: "view", label: "View Project", description: "Can view project details" },
      { key: "manageTeam", label: "Manage Team", description: "Can add/remove team members" },
    ],
  },
  employees: {
    label: "Employee Management",
    icon: <FiUsers />,
    permissions: [
      { key: "create", label: "Add Employee", description: "Can add new employees" },
      { key: "edit", label: "Edit Employee", description: "Can edit employee details" },
      { key: "delete", label: "Remove Employee", description: "Can remove employees" },
      { key: "view", label: "View Employee", description: "Can view employee details" },
      { key: "viewSalary", label: "View Salary", description: "Can view employee salary" },
    ],
  },
  vacations: {
    label: "Vacation Management",
    icon: <FiMap />,
    permissions: [
      { key: "approve", label: "Approve Vacation", description: "Can approve vacation requests" },
      { key: "reject", label: "Reject Vacation", description: "Can reject vacation requests" },
      { key: "view", label: "View Vacations", description: "Can view all vacation requests" },
      { key: "create", label: "Create Vacation", description: "Can create vacation requests" },
    ],
  },
  attendance: {
    label: "Attendance Management",
    icon: <FiClock />,
    permissions: [
      { key: "view", label: "View Attendance", description: "Can view attendance records" },
      { key: "edit", label: "Edit Attendance", description: "Can edit attendance records" },
      { key: "approve", label: "Approve Attendance", description: "Can approve attendance" },
      { key: "export", label: "Export Attendance", description: "Can export attendance reports" },
    ],
  },
  leads: {
    label: "Lead Management",
    icon: <FiTarget />,
    permissions: [
      { key: "create", label: "Create Lead", description: "Can create new leads" },
      { key: "edit", label: "Edit Lead", description: "Can edit existing leads" },
      { key: "delete", label: "Delete Lead", description: "Can delete leads" },
      { key: "view", label: "View Lead", description: "Can view lead details" },
      { key: "assign", label: "Assign Lead", description: "Can assign leads to team members" },
      { key: "changeStatus", label: "Change Status", description: "Can change lead status" },
    ],
  },
  settings: {
    label: "Settings & Configuration",
    icon: <FiSettings />,
    permissions: [
      { key: "manageAccount", label: "Account Access", description: "Can manage personal profile and account settings" },
      { key: "manageCompany", label: "Company Settings", description: "Can manage general company profile and details" },
      { key: "managePositions", label: "Position Management", description: "Can manage employee positions and role definitions" },
      { key: "manageTaskFlows", label: "Workflow Management", description: "Can manage task statuses and company workflows" },
      { key: "manageSecurity", label: "Security Hub", description: "Can manage system roles, permissions, and security policies" },
      { key: "manageMaster", label: "Master Data", description: "Can manage system-level master configuration and data" },
    ],
  },
  dashboard: {
    label: "Dashboard Features",
    icon: <FiActivity />,
    permissions: [
      { key: "viewDailyChecklist", label: "View Daily Checklist", description: "Can view the daily checklist drawer on dashboard" },
      { key: "viewCampaignDetails", label: "View Campaign Details", description: "Can view campaign details and analytics on dashboard" },
    ],
  },
};


// Role Permission Editor Component
const RolePermissionEditor = ({ role, onUpdate, onClose, companyId }) => {
  const [permissions, setPermissions] = useState(role.permissions || {});
  const { mutate: updatePermissions, isLoading: isSaving } =
    useUpdatePermissions(companyId);

  // Initialize permissions from role with default structure
  useEffect(() => {
    const initializePermissions = (rolePermissions) => {
      const defaultPermissions = {
        tasks: {},
        projects: {},
        employees: {},
        vacations: {},
        attendance: {},
        leads: {},
        settings: {},
        dashboard: {},
      };

      const mergedPermissions = { ...defaultPermissions };

      if (rolePermissions) {
        Object.keys(rolePermissions).forEach((category) => {
          if (mergedPermissions[category]) {
            mergedPermissions[category] = {
              ...mergedPermissions[category],
              ...rolePermissions[category],
            };
          } else {
            mergedPermissions[category] = rolePermissions[category];
          }
        });
      }

      return mergedPermissions;
    };

    setPermissions(initializePermissions(role.permissions));
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
        onSuccess: () => {
          toast.success(`Access policy updated for ${role.name}`);
          onUpdate({ ...role, permissions });
          onClose();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Policy update failed");
        },
      }
    );
  };

  const countActivePermissions = (category) => {
    const categoryPerms = permissions[category] || {};
    return Object.values(categoryPerms).filter(Boolean).length;
  };

  return (
    <ModalLayout
      isOpen={true}
      setIsOpen={onClose}
      maxWidth="sm:max-w-4xl"
      title={`Access Control: ${role.name}`}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Admin Dashboard Access Section */}
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-100/50 rounded-2xl p-4 shadow-sm shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white border border-indigo-100 rounded-xl shadow-sm">
                <FiShield className="text-lg text-indigo-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-[13px] font-bold text-gray-800 tracking-tight">
                  Intelligence Dashboard Access
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Grant entry to organization analytics and administrative control panels
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
              <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(PERMISSION_CATEGORIES).map(
            ([category, { label, icon, permissions: categoryPermissions }]) => (
              <div
                key={category}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-200/50 transition-all duration-300"
              >
                <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-base grayscale opacity-80">{icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">
                        {label}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400">
                        {countActivePermissions(category)} of {categoryPermissions.length} Scopes Enabled
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(category)}
                      className="px-2.5 py-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-tight"
                    >
                      Authorize All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeselectAll(category)}
                      className="px-2.5 py-1 text-[10px] font-bold text-gray-400 hover:text-gray-500 transition-colors uppercase tracking-tight"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryPermissions.map((perm) => {
                    const isChecked = permissions[category]?.[perm.key] || false;
                    return (
                      <label
                        key={perm.key}
                        className={`group flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? "border-blue-200 bg-blue-50/30"
                            : "border-gray-100 bg-gray-50/30 hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        <div className="relative flex items-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(category, perm.key)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className={`text-[11px] font-bold leading-none ${isChecked ? "text-gray-800" : "text-gray-500"}`}>
                            {perm.label}
                          </span>
                          <p className="text-[10px] text-gray-400 font-medium leading-tight truncate-2-lines group-hover:text-gray-500 transition-colors">
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

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2 sticky bottom-0 bg-white">
          <div className="flex flex-col gap-0.5 ml-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Active Permission Capacity
            </span>
            <span className="text-[12px] font-extrabold text-blue-600">
              {Object.entries(permissions).reduce((acc, [key, value]) => {
                if (key === "accessAdminDashboard") return acc + (value ? 1 : 0);
                return acc + Object.values(value).filter(Boolean).length;
              }, 0)} Scopes Defined
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-[12px] font-bold text-gray-500 hover:text-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-[12px] font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Syncing..." : "Update Security Policy"}
            </button>
          </div>
        </div>
      </div>
    </ModalLayout>
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

  const { companyId } = useAuth();
  const { data: positionsData, isLoading: isLoadingPositions } =
    useGetPositions(companyId);
  const positions = positionsData?.positions || [];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error("All credentials required");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    if (newPassword.length < 8) return toast.error("Minimum 8 characters required");

    setIsChangingPassword(true);
    try {
      const verifyResult = await verifyCurrentPassword({ currentPassword });
      if (!verifyResult.success) {
        toast.error(verifyResult.message || "Incorrect current password");
        return;
      }

      const changeResult = await changePassword({ currentPassword, newPassword });
      if (changeResult.success) {
        toast.success("Identity updated successfully");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast.error(changeResult.message || "Credential update failed");
      }
    } catch (error) {
      toast.error("An error occurred during sync");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(twoFactorEnabled ? "Double-auth system deactivated" : "Layered security enabled");
  };

  const handleEditRole = (role) => {
    const isAdminRole = role.name.toLowerCase().includes("admin") || role.name.toLowerCase() === "company-admin";
    if (isAdminRole) return toast.info("Root admin privileges cannot be restricted");
    setSelectedRole(role);
    setShowRoleEditor(true);
  };

  const handleUpdateRole = () => toast.success("Module access policy synchronized");

  const getPermissionCount = (role) => {
    if (!role.permissions) return 0;
    return Object.entries(role.permissions).reduce((acc, [key, value]) => {
      if (key === "accessAdminDashboard") return acc + (value ? 1 : 0);
      return acc + Object.values(value).filter(Boolean).length;
    }, 0);
  };

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="space-y-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100/50 shadow-sm">
              <AiOutlineSafety className="text-[17px] text-blue-600 font-bold" />
            </div>
            <h2 className="text-[17px] font-bold text-gray-800 tracking-tight">
              Safety & Security Hub
            </h2>
          </div>
          <p className="text-[11px] text-gray-500 font-medium ml-1">
            Govern organization-wide access policies, manage credential standards, and audit system entry points.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Role Management */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-200/40 p-5 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <FiUsers className="text-[16px] text-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[14px] font-bold text-gray-800 tracking-tight leading-none mb-1">
                      Organization Module Policies
                    </h3>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter">
                      Assign module-level CRUD permissions per role
                    </p>
                  </div>
                </div>
                {!isLoadingPositions && (
                  <div className="px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {positions.length} Active Positions
                    </span>
                  </div>
                )}
              </div>

              {/* Lockdown Notice */}
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 flex gap-4 mb-6">
                <FiAlertCircle className="text-amber-500 shrink-0 mt-0.5 text-[15px]" />
                <p className="text-[11px] font-medium text-amber-800/80 leading-relaxed uppercase tracking-tight">
                  <span className="font-extrabold text-amber-600">Strict Protocol:</span> Primary Administrative roles are hard-locked to prevent accidental organization lockout. All system permissions are implicitly granted.
                </p>
              </div>

              {isLoadingPositions ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hydrating Roles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {positions.map((role) => {
                    const isAdminRole = role.name.toLowerCase().includes("admin") || role.name.toLowerCase() === "company-admin";
                    return (
                      <div
                        key={role._id}
                        className={`group p-4 border rounded-2xl transition-all duration-300 flex flex-col gap-4 ${
                          isAdminRole
                            ? "border-amber-100 bg-amber-50/30 shadow-sm shadow-amber-500/5"
                            : "border-gray-50 bg-gray-50/30 hover:bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`p-2.5 rounded-xl border-2 transition-transform group-hover:scale-105 ${
                            isAdminRole ? "bg-white border-amber-50 text-amber-500" : "bg-white border-gray-50 text-gray-400 group-hover:text-blue-500 group-hover:border-blue-50"
                          }`}>
                            <FiShield className="text-[18px]" />
                          </div>
                          {isAdminRole ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/50 border border-amber-200/50 rounded-lg text-[10px] font-bold text-amber-600 uppercase">
                              <FiLock className="text-[10px]" /> Immutable
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditRole(role)}
                              className="p-2 text-gray-400 hover:text-blue-500 bg-white border border-gray-50 rounded-lg shadow-sm transition-all active:scale-95"
                            >
                              <MdEdit className="text-[16px]" />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-[13px] font-extrabold text-gray-800 tracking-tight leading-none">
                            {role.name}
                          </h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-gray-400 py-0.5 rounded uppercase">
                              {isAdminRole ? "System Root" : `${getPermissionCount(role)} Active Scopes`}
                            </span>
                            <span className={`w-1 h-1 rounded-full ${role.isActive ? "bg-green-500" : "bg-red-400"}`} />
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-gray-500 leading-snug line-clamp-2">
                          {isAdminRole ? "Global read/write/delete access across all organization modules and settings." : `Assigned access to ${role.allowedRoutes?.length || 0} core modules.`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Credential Management */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {/* Password Section */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                  <FiLock className="text-rose-500" />
                </div>
                <h3 className="text-[14px] font-bold text-gray-800 tracking-tight">Identity Credentials</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Current Authentication Key</label>
                  <div className="relative group">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[12px] font-bold transition-all outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                      placeholder="Verify present key"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 transition-colors">
                      {showCurrentPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">New Security Protocol</label>
                  <div className="relative group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[12px] font-bold transition-all outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                      placeholder="Establish new key"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 transition-colors">
                      {showNewPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 ml-1 font-medium italic">Standard 8-character complexity required</p>
                </div>

                <div className="flex flex-col gap-1.5 pb-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Verify New Key</label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-[12px] font-bold transition-all outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                      placeholder="Re-enter for confirmation"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 transition-colors">
                      {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-2.5 bg-gray-800 hover:bg-black text-white rounded-xl text-[12px] font-bold shadow-lg shadow-gray-200/40 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isChangingPassword ? "Synching Creds..." : "Update Authentication Key"}
                </button>
              </form>
            </div>

            {/* 2FA Section */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                    <FiSmartphone className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[14px] font-bold text-white tracking-tight leading-none mb-1">Double-Auth Protocol</h3>
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-tighter">Active Session Security</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer pointer-events-auto">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={handleToggle2FA}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-white/20 backdrop-blur-md rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-blue-600 after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
                </label>
              </div>
              <p className="text-[11px] text-blue-50 font-medium leading-relaxed mt-2 p-3 bg-white/10 rounded-xl border border-white/10">
                Layered security adds a verification step through your authenticated device, shielding your intelligence assets from unauthorized entry.
              </p>
            </div>
          </div>
        </div>
      </div>

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
