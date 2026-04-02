import React, { useState } from "react";
import { SETTINGS } from "../../constants";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRouteAccess } from "../../hooks/useRouteAccess";
import { usePermissions } from "../../hooks/usePermissions";
import UserProfile from "../../components/settings/profile";
import EmployeeSettings from "../../components/settings/employeeSettings";

const SettingsLayout = () => {
  const [selected, setSelected] = useState(SETTINGS[0].id);
  const { user } = useAuth();
  const { hasAccessToRoute } = useRouteAccess();
  const { hasPermission } = usePermissions();
  const location = useLocation();
  
  const isEmployee = user?.role === "employee";
  const isAdmin = user?.role === "company-admin";
  const isProfilePage = location.pathname === "/settings/account" || location.pathname === "/settings";

  // Check if employee has any management permissions
  const hasManagementAccess = hasPermission("settings", "manageCompany") || 
                               hasPermission("settings", "managePositions") || 
                               hasPermission("settings", "manageTaskFlows") ||
                               hasPermission("settings", "manageSecurity") ||
                               hasPermission("settings", "manageMaster");

  // Filter settings based on user's route access and granular permissions
  const accessibleSettings = SETTINGS.filter((setting) => {
    // Admins always have access to everything
    if (isAdmin) return true;

    // For employees, check specific permissions
    if (isEmployee) {
      // 1. Account: Available if they have manageAccount OR if they have NO management access (default profile view)
      if (setting.path === "account") {
        return hasPermission("settings", "manageAccount") || !hasManagementAccess;
      }

      // 2. My Company: Available if they have any company-related management permission
      if (setting.path === "company") {
        return hasPermission("settings", "manageCompany") || 
               hasPermission("settings", "managePositions") || 
               hasPermission("settings", "manageTaskFlows");
      }

      // 3. Security (Safety): Available if they have manageSecurity
      if (setting.path === "safety") {
        return (
          hasPermission("settings", "manageSecurity") || 
          hasPermission("settings", "manageRoles") // Backward compatibility
        );
      }

      // 4. Master: Available if they have manageMaster
      if (setting.path === "master") {
        return hasPermission("settings", "manageMaster");
      }

      // 5. Billing: Strictly admin only
      if (setting.path === "billing") {
        return false;
      }
    }

    // Default fallback to route access
    return hasAccessToRoute(`/settings/${setting.path}`);
  });

  // Update selected setting based on current location
  React.useEffect(() => {
    const currentPath = location.pathname;
    const currentSetting = accessibleSettings.find(
      (setting) => currentPath === `/settings/${setting.path}`
    );
    if (currentSetting) {
      setSelected(currentSetting.id);
    } else if (accessibleSettings.length > 0) {
      setSelected(accessibleSettings[0].id);
    }
  }, [location.pathname, accessibleSettings]);

  // If no settings are accessible, redirect to unauthorized
  if (accessibleSettings.length === 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Use the detailed settings layout if user is admin OR employee with management access
  const showManagementLayout = isAdmin || (isEmployee && hasManagementAccess);

  return (
    <section className="flex flex-col h-full gap-y-3">
      <div className="w-full h-full md:overflow-hidden gap-x-5 gap-y-5 md:gap-y-0 flex flex-col md:flex-row">
        
        {/* Profile Card Section: Show for employees when on Profile tab, or if management layout is altogether disabled */}
        {(!showManagementLayout || (isEmployee && isProfilePage)) && (
          <UserProfile user={user} />
        )}

        {/* Settings Content Area */}
        <div className="flex-1 md:overflow-y-auto h-full gap-y-2 flex flex-col">
          <div className="flex flex-col gap-y-5 md:gap-y-0 md:flex-row h-full md:overflow-y-auto gap-x-3">
            
            {/* Internal Settings Sidebar: Show for admins OR authorized employees when NOT on Profile tab */}
            {(isAdmin || (showManagementLayout && !isProfilePage)) && (
              <div className="w-full md:w-[200px] rounded-3xl bg-white p-2 flex flex-col gap-y-1 pt-5 shrink-0">
                {accessibleSettings.map((setting) => (
                  <Link
                    to={`/settings/${setting.path}`}
                    key={setting.id}
                    className={`flexStart px-4 group text-[#7D8592] rounded-xl py-[10px] relative mr-1 
                      ${selected === setting.id ? "bg-[#F4F9FD]" : ""} hover:bg-[#F4F9FD] gap-x-3`}
                  >
                    <setting.icon
                      className={`${selected === setting.id ? "text-[#3F8CFF]" : ""} group-hover:text-[#3F8CFF] text-base`}
                    />
                    <span
                      className={`group-hover:text-gray-800 group-hover:translate-x-1 transition-all duration-300 text-[14px] 
                        ${selected === setting.id ? "text-[#3F8CFF]" : ""}`}
                    >
                      {setting.title}
                    </span>
                    <div
                      className={`absolute h-full bg-[#3F8CFF] w-1 ${setting.id === selected ? "block" : "hidden"} 
                        -right-[11px] rounded-full top-0 bottom-0`}
                    />
                  </Link>
                ))}
              </div>
            )}

            {/* Main Page Content */}
            <div className={`flex-1 bg-white p-5 md:overflow-hidden flex flex-col h-fit md:h-full rounded-3xl ${isAdmin ? "md:overflow-y-auto" : ""}`}>
              {isEmployee && isProfilePage ? (
                <div className="h-full overflow-y-auto">
                  <EmployeeSettings />
                </div>
              ) : (
                <Outlet />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsLayout;
