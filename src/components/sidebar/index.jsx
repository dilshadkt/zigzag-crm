import React, { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { SIDE_MENU } from "../../constants";
import { useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "../shared/buttons/primaryButton";
import { useAuth } from "../../hooks/useAuth";
import { useRouteAccess } from "../../hooks/useRouteAccess";
import { usePermissions } from "../../hooks/usePermissions";
import {
  MdDashboard,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from "react-icons/md";
import {
  useGetTasksOnReview,
  useGetTasksOnPublish,
  useGetClientReviewTasks,
  useGetUnreadMessageCount,
} from "../../api/hooks";
import { assetPath } from "../../utils/assetPath";
const ALWAYS_ACCESSIBLE_ROUTES = ["dashboard", "board", "settings"];

const Sidebar = () => {
  const { user } = useAuth();
  const { userPosition } = useRouteAccess();
  const { hasAdminDashboardAccess, hasPermission } = usePermissions();

  // Get current month in YYYY-MM format for tasks on review
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // Fetch tasks on review count
  const { data: tasksOnReviewData } = useGetTasksOnReview({
    taskMonth: getCurrentMonth(),
  });

  // Fetch tasks on publish count
  const { data: tasksOnPublishData } = useGetTasksOnPublish({
    taskMonth: getCurrentMonth(),
  });

  // Fetch client review tasks count
  const { data: clientReviewData } = useGetClientReviewTasks({
    taskMonth: getCurrentMonth(),
  });

  // Fetch unread messages count
  const { data: unreadMessageCount = 0 } = useGetUnreadMessageCount();

  // Check if user has admin dashboard access permission
  // IMPORTANT: Company admins should NOT see this option - only non-admin users with permission
  const isCompanyAdmin = user?.role === "company-admin";
  const canAccessAdminDashboard = !isCompanyAdmin && hasAdminDashboardAccess();

  const sidebarMenuItems = SIDE_MENU.map((item) => {
    // If the item is "Dashboard", check if sub-items should be shown
    if (item.routeKey === "dashboard") {
      // ONLY Company Admin sees all sub-items under the main "Dashboard"
      if (isCompanyAdmin) {
        return item;
      }
      
      // For others, check if they have specific dashboard permissions (like lead-dashboard)
      const allowedRoutes = userPosition?.allowedRoutes || [];
      const hasDashboardChildren = item.children?.some(child => 
        child.routeKey !== "dashboard" && allowedRoutes.includes(child.routeKey)
      );

      if (hasDashboardChildren) {
        // Return dashboard with only allowed children
        const allowedChildren = item.children.filter(child => 
          child.routeKey === "dashboard" || allowedRoutes.includes(child.routeKey)
        );
        return { ...item, children: allowedChildren };
      }

      // If no specific dashboard permissions, return a flat "Dashboard" link
      const { children, ...rest } = item;
      return rest;
    }

    // Transform Settings for Employees (non-admin users)
    if (item.routeKey === "settings" && !isCompanyAdmin) {
      const settingsChildren = [
        {
          id: 1201,
          title: "Profile",
          path: "/settings/account",
          routeKey: "settings",
        },
      ];

      // My Company related management
      if (
        hasPermission("settings", "manageCompany") || 
        hasPermission("settings", "managePositions") || 
        hasPermission("settings", "manageTaskFlows")
      ) {
        settingsChildren.push({
          id: 1204,
          title: "My Company",
          path: "/settings/company",
          routeKey: "settings",
        });
      }

      // Security (Security Hub)
      if (hasPermission("settings", "manageSecurity") || hasPermission("settings", "manageRoles")) {
        settingsChildren.push({
          id: 1205,
          title: "Security",
          path: "/settings/safety",
          routeKey: "settings",
        });
      }

      // Master configuration
      if (hasPermission("settings", "manageMaster")) {
        settingsChildren.push({
          id: 1206,
          title: "Master",
          path: "/settings/master",
          routeKey: "settings",
        });
      }

      // Return a collapsible settings menu
      return { 
        ...item, 
        children: settingsChildren,
        path: undefined // Remove direct path so it only toggles
      };
    }

    return item;
  });

  // IMPORTANT: Only add Company Dashboard menu item if user has the permission AND is NOT a company admin
  if (canAccessAdminDashboard) {
    const dashboardIndex = sidebarMenuItems.findIndex(
      (item) => item.routeKey === "dashboard"
    );
    
    // Get the sub-items template from SIDE_MENU
    const dashboardItem = SIDE_MENU.find(i => i.routeKey === "dashboard");
    const subItems = dashboardItem?.children || [];

    if (dashboardIndex !== -1) {
      sidebarMenuItems.splice(dashboardIndex + 1, 0, {
        id: 13,
        title: "Company Dashboard",
        icon: MdDashboard,
        routeKey: "company-dashboard",
        children: [
          {
            id: 1301,
            title: "Company Overview",
            path: "/company-dashboard",
            routeKey: "company-dashboard",
          },
          // Add Lead, Employee, and Cost dashboards (skipping the main dashboard which is redundant here)
          ...subItems.filter(child => child.routeKey !== 'dashboard')
        ],
      });
    }
  }

  // Filter sidebar items based on user's position allowed routes
  const filteredSidebar = sidebarMenuItems.filter((item) => {
    // Company admins have full access to all menu items EXCEPT Company Dashboard
    if (isCompanyAdmin) {
      // Hide Company Dashboard for admins
      if (item.routeKey === "company-dashboard") {
        return false;
      }
      return true;
    }

    // Certain routes are always accessible to everyone
    if (ALWAYS_ACCESSIBLE_ROUTES.includes(item.routeKey)) {
      return true;
    }

    // Company Dashboard is ONLY accessible if user has the permission (and is NOT an admin)
    if (item.routeKey === "company-dashboard") {
      return canAccessAdminDashboard;
    }

    // For other menu items, check if the routeKey is in their allowed routes
    const allowedRoutes = userPosition?.allowedRoutes || [];
    return allowedRoutes.includes(item.routeKey);
  });

  // Additional debug for each menu item
  if (user?.role !== "company-admin") {
    SIDE_MENU.forEach((item) => {
      const allowedRoutes = userPosition?.allowedRoutes || [];
      const isAlwaysAccessible = ALWAYS_ACCESSIBLE_ROUTES.includes(item.routeKey);
      const hasRouteAccess = allowedRoutes.includes(item.routeKey);
      const hasAccess = isAlwaysAccessible || hasRouteAccess;
    });
  }

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => {
    const initialOpenMenus = {};
    filteredSidebar.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => pathname === child.path
        );
        if (isChildActive) {
          initialOpenMenus[item.title] = true;
        }
      }
    });
    return initialOpenMenus;
  });

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = () => {
    navigate("/auth/signin");
  };
  return (
    <section
      className=" flex-col min-w-[220px] hidden lg:flex  my-3 ml-3 justify-between
     rounded-[24px] gap-y-10 bg-white p-3"
    >
      <div className="flex flex-col  overflow-y-auto scrollbar-hide">
        <ul className="flex flex-col gap-y-1  text-[#7D8592] ">
          {filteredSidebar.length > 0 ? (
            filteredSidebar.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.title];
              const isActive = pathname === item.path || (hasChildren && item.children.some(child => pathname === child.path));

              // Get count for "Task on Review", "Task on Publish", and "Client Review" menu items
              const getTaskCount = (menuItem) => {
                if (
                  menuItem.routeKey === "task-on-review" &&
                  tasksOnReviewData?.tasks?.length
                ) {
                  return tasksOnReviewData.tasks.length;
                }
                if (
                  menuItem.routeKey === "task-on-publish" &&
                  tasksOnPublishData?.tasks?.length
                ) {
                  return tasksOnPublishData.tasks.length;
                }
                if (
                  menuItem.routeKey === "client-review" &&
                  clientReviewData?.tasks?.length
                ) {
                  return clientReviewData.tasks.length;
                }
                if (menuItem.routeKey === "messenger" && unreadMessageCount > 0) {
                  return unreadMessageCount;
                }
                return null;
              };

              const taskCount = getTaskCount(item);

              return (
                <li key={index} className="flex flex-col gap-y-1">
                  <div
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(item.title);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className={` relative cursor-pointer px-2 py-[10px] flexStart
          gap-x-3.5 rounded-[10px] hover:bg-[#ECF3FF] group ${isActive && `bg-[#ECF3FF] text-[#3F8CFF]`
                      }`}
                  >
                    <item.icon className="text-lg group-hover:text-[#3F8CFF]" />
                    <span
                      className="group-hover:text-[#3F8CFF] group-hover:translate-x-1
            transition-all duration-300 text-sm flex-1"
                    >
                      {item.title}
                    </span>
                    {taskCount !== null && taskCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[20px] text-center">
                        {taskCount}
                      </span>
                    )}
                    {hasChildren && (
                      <div className="text-gray-400">
                        {isOpen ? (
                          <MdKeyboardArrowDown className="text-xl" />
                        ) : (
                          <MdKeyboardArrowRight className="text-xl" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Render Sub-items */}
                  {hasChildren && isOpen && (
                    <ul className="flex flex-col gap-y-1   border-[#F4F9FD]">
                      {item.children.map((child, childIdx) => {
                        const childTaskCount = getTaskCount(child);
                        const isChildActive = pathname === child.path;

                        return (
                          <li
                            key={childIdx}
                            onClick={() => navigate(child.path)}
                            className={`relative cursor-pointer px-3 py-[8px] flexStart
                    gap-x-3 rounded-[8px] hover:bg-[#ECF3FF] group ${isChildActive && `text-[#3F8CFF]`
                              }`}
                          >
                            <span
                              className={`group-hover:text-[#3F8CFF] group-hover:translate-x-1
                      transition-all duration-300 text-[13px] flex-1 ${isChildActive ? 'font-medium' : ''}`}
                            >
                              {child.title}
                            </span>
                            {childTaskCount !== null && childTaskCount > 0 && (
                              <span className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-full min-w-[16px] text-center">
                                {childTaskCount}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })
          ) : (
            <li className="px-2 py-[10px] flexStart gap-x-3.5 rounded-[10px] text-[#7D8592] text-[13px]">
              <span>No accessible menu items</span>
            </li>
          )}
        </ul>
      </div>
      <div className="flex flex-col ">
        <div className="h-[95px] mt-3 justify-center  w-full flex items-end bg-[#F4F9FD] relative rounded-[24px] p-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="flexCenter  
       gap-x-2 rounded-[14px] cursor-pointer bg-[#3F8CFF] text-white w-fit px-5 py-2
    text-sm font-medium"
          >
            <img src={assetPath("icons/chat.svg")} alt="" loading="lazy" className="w-4" />
            <span>Support</span>
          </button>
          <img
            src="/image/support.svg"
            alt=""
            loading="lazy"
            className="absolute w-22 -top-10"
          />
        </div>
        <button
          onClick={handleLogout}
          className="text-[#7D8592] mt-2 px-2 py-[10px] rounded-[10px]  
  flexStart gap-x-3.5 hover:text-[#3F8CFF] text-sm"
        >
          <TbLogout className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
      {/* support section  */}
      {isMenuOpen && (
        <div
          className="fixed left-0 right-0 top-0 
      bottom-0 m-auto bg-black/40 backdrop-blur-sm flexCenter z-[1000]"
        >
          <div className="max-w-lg bg-white w-full rounded-3xl p-7 px-9 flex flex-col">
            <div className="flexBetween">
              <h4 className="text-lg font-medium">Need some Help?</h4>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-11 h-11 flexCenter bg-[#F4F9FD] rounded-2xl"
              >
                <img
                  src={assetPath("icons/cancel.svg")}
                  alt=""
                  className="w-5"
                  loading="lazy"
                />
              </button>
            </div>
            <div className="mt-4">
              <img src="/image/support.png" alt="" loading="lazy" />
            </div>
            <p className="text-gray-600 mt-3">
              Describe your question and our specialists will answer you within
              24 hours.
            </p>
            <form
              action="
          "
              className="mt-4 flex flex-col gap-y-3"
            >
              <div className="flex flex-col gap-y-2">
                <span className="text-[#7D8592] font-medium text-sm">
                  Request Subject
                </span>
                <div className="p-3 border rounded-xl h-12 border-[#D8E0F0]"></div>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-[#7D8592] font-medium text-sm">
                  Description
                </span>
                <textarea
                  placeholder="Add some description of the request "
                  className="p-3 border rounded-xl h-28 text-sm border-[#D8E0F0]"
                />
              </div>
              <div className="flexEnd mt-2">
                <PrimaryButton title={"Send Request"} />
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Sidebar;
